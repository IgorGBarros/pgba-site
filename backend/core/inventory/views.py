from time import timezone
from django.db import transaction
from django.db.models import Q
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status, generics

# Imports do Django Auth
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model

# Imports do seu Projeto
from .models import Product, InventoryItem, InventoryBatch, Store, Sale, SaleItem, PriceHistory
# OBS: Removi 'CustomUserSerializer' e 'CustomTokenObtainPairSerializer' pois eles dependem do CustomUser
from .serializers import InventoryItemSerializer, ProductSerializer, StockEntrySerializer, SaleSerializer
from .scraper import search_google_shopping
import re

# Pega o usuário padrão (seja ele Custom ou Default)
User = get_user_model()

# ============================================================================
# 1. AUTHENTICATION (Simplificada para MVP)
# ============================================================================

# Se você ainda não criou o CustomTokenObtainPairSerializer, use o padrão:
class CustomTokenObtainPairView(TokenObtainPairView):
    # serializer_class = CustomTokenObtainPairSerializer (Descomente quando criar o serializer)
    pass

# COMENTADO ATÉ VOCÊ CRIAR O MODELO CUSTOMUSER E O SERIALIZER
# class CustomUserCreateView(generics.CreateAPIView):
#     queryset = User.objects.all()
#     serializer_class = CustomUserSerializer
#     permission_classes = [AllowAny]

# COMENTADO POIS O MÉTODO 'create_user_with_firebase' NÃO EXISTE NO USER PADRÃO
# class FirebaseLoginView(APIView):
#     def post(self, request, *args, **kwargs):
#         firebase_token = request.data.get("firebase_token")
#         if not firebase_token:
#             return Response({"error": "Token obrigatório."}, status=status.HTTP_400_BAD_REQUEST)
#         try:
#             # Requer Manager customizado
#             # user = User.objects.create_user_with_firebase(firebase_token)
#             return Response({"message": "Funcionalidade pendente de implementação no Model."})
#         except Exception as e:
#             return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

# ============================================================================
# 2. CORE BUSINESS (ESTOQUE)
# ============================================================================

# Helper para pegar a loja atual (MVP: Primeira loja)
def get_current_store(user):
    # No futuro, filtrar por user: Store.objects.get(user=user)
    return Store.objects.first()

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

class InventoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Lista o estoque da loja atual (Visualização)
    """
    serializer_class = InventoryItemSerializer
    
    def get_queryset(self):
        # Garante que usuário esteja logado ou trata erro
        if self.request.user.is_anonymous:
            return InventoryItem.objects.none()
            
        store = get_current_store(self.request.user)
        if not store:
            return InventoryItem.objects.none()
            
        return InventoryItem.objects.filter(store=store).select_related('product')

class StockEntryView(APIView):
    """
    RECEBIMENTO DE MERCADORIA (CRIA PRODUTO SE NÃO EXISTIR)
    """
    def post(self, request):
        serializer = StockEntrySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)
            
        data = serializer.validated_data
        store = get_current_store(request.user)
        
        with transaction.atomic():
            # 1. Busca ou Cria o Produto Global
            product, created = Product.objects.get_or_create(
                bar_code=data['bar_code'],
                defaults={
                    'name': data.get('name', 'Produto Novo'),
                    'category': data.get('category', 'Geral'),
                    # Se tiver preço de venda no form, usa como oficial inicial
                    'official_price': data.get('sale_price', 0) 
                }
            )
            
            # 2. Achar ou Criar Item no Estoque da Loja
            item, _ = InventoryItem.objects.get_or_create(
                store=store,
                product=product,
                defaults={
                    'cost_price': data.get('cost_price', 0),
                    'sale_price': data.get('sale_price', 0),
                    'total_quantity': 0
                }
            )
            
            # Atualiza preços da loja se vierem no request
            if data.get('cost_price'): item.cost_price = data['cost_price']
            if data.get('sale_price'): item.sale_price = data['sale_price']
            
            # 3. Criar Lote (Batch)
            InventoryBatch.objects.create(
                item=item,
                quantity=data['quantity'],
                batch_code=data.get('batch_code', ''),
                expiration_date=data.get('expiration_date')
            )
            
            # 4. Atualizar Total
            item.total_quantity += data['quantity']
            item.save()
            
        return Response({
            "message": "Estoque atualizado!", 
            "product": product.name,
            "new_total": item.total_quantity
        })

class SaleCheckoutView(APIView):
    def post(self, request):
        serializer = SaleSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)
            
        data = serializer.validated_data
        store = get_current_store(request.user)
        
        total_sale = 0
        
        try:
            with transaction.atomic():
                # 1. Cria a Venda
                sale = Sale.objects.create(
                    store=store,
                    client_name=data.get('client_name', ''),
                    payment_method=data.get('payment_method'),
                    transaction_type=data.get('transaction_type', 'VENDA'),
                    notes=data.get('notes', '')
                )
                
                for item_data in data['items']:
                    product = Product.objects.get(bar_code=item_data['bar_code'])
                    inventory_item = InventoryItem.objects.get(store=store, product=product)
                    qtd = item_data['quantity']
                    price = item_data.get('price_sold', inventory_item.sale_price)
                    
                    if inventory_item.total_quantity < qtd:
                        raise Exception(f"Estoque insuficiente para {product.name}")
                    
                    # 2. Lógica de Baixa (Lote Específico ou FIFO)
                    batch_used = None
                    
                    if 'batch_id' in item_data:
                        batch_used = InventoryBatch.objects.get(id=item_data['batch_id'])
                        if batch_used.quantity < qtd:
                             raise Exception("Lote insuficiente")
                        batch_used.quantity -= qtd
                        batch_used.save()
                    else:
                        # FIFO Automático
                        batches = inventory_item.batches.filter(quantity__gt=0).order_by('expiration_date')
                        remaining = qtd
                        for b in batches:
                            if remaining <= 0: break
                            take = min(remaining, b.quantity)
                            b.quantity -= take
                            b.save()
                            remaining -= take
                            batch_used = b # Registra o último lote usado para referência
                    
                    # 3. Atualiza Saldo Geral
                    inventory_item.total_quantity -= qtd
                    inventory_item.save()
                    
                    # 4. Cria Item da Venda
                    SaleItem.objects.create(
                        sale=sale, product=product, batch=batch_used,
                        quantity=qtd, unit_price_sold=price
                    )
                    
                    # 5. REGISTRA NO HISTÓRICO (StockTransaction)
                    # Quantidade negativa para indicar saída [1]
                    StockTransaction.objects.create(
                        store=store,
                        product=product,
                        batch=batch_used,
                        transaction_type=sale.transaction_type, # 'VENDA', 'PRESENTE', etc.
                        quantity=-qtd, 
                        unit_cost=inventory_item.cost_price,
                        unit_price=price,
                        description=f"Saída Ref. Venda #{sale.id} ({sale.get_transaction_type_display()})"
                    )

                    if sale.transaction_type == 'VENDA':
                        total_sale += price * qtd
                
                sale.total_amount = total_sale
                sale.save()
                
        except Exception as e:
            return Response({"error": str(e)}, status=400)
            
        return Response({"message": "Operação realizada com sucesso!", "total": total_sale})
# --- LOOKUP INTELIGENTE ---

@api_view(['GET'])
def lookup_product(request):
    query = request.query_params.get('ean') or request.query_params.get('q')
    force_remote = request.query_params.get('force_remote') == 'true'
    
    # 1. Busca Local (Só se não for forçado)
    if not force_remote:
        local = Product.objects.filter(Q(bar_code=query) | Q(natura_sku=query)).first()
        if local:
            return Response({"found": True, "source": "local", "data": ProductSerializer(local).data})
            
    # 2. Busca Remota (Lógica mantida conforme original)
    if query and query.isdigit() and len(query) > 6:
        print(f"   ↳ Buscando ONLINE para aprender...")
        
        online_data = search_google_shopping(query)
        
        if online_data:
            sku_found = online_data.get('natura_sku')
            name_found = online_data.get('name')
            
            # --- BÔNUS: Salvar resultados relacionados ---
            all_results = online_data.get('all_results', [])
            if all_results:
                # Lógica mantida...
                pass 
            
            # CASO 1: TEM SKU (Google ou Natura achou)
            if sku_found:
                try:
                    product = Product.objects.get(natura_sku=sku_found)
                    product.bar_code = query
                    product.save()
                except Product.DoesNotExist:
                    product = Product.objects.create(
                        natura_sku=sku_found,
                        bar_code=query,
                        name=name_found,
                        official_price=online_data.get('sale_price', 0),
                        category=online_data.get('category', 'Geral'),
                        description=online_data.get('description', '')
                    )
                
                return Response({
                    "found": True, 
                    "source": "remote_learned", 
                    "data": ProductSerializer(product).data,
                    "message": "Produto identificado e vinculado!"
                })
                
            # CASO 2: SÓ TEM NOME (Cosmos achou - Sugestão Inteligente)
            elif name_found:
                print(f"   ⚠️ Nome descoberto: '{name_found}'. Buscando candidatos no banco local...")
                
                # 1. Limpeza básica do nome para melhorar a busca
                # Remove palavras comuns que atrapalham a busca específica
                stopwords = ['ml', 'g', 'de', 'e', 'para', 'o', 'a', 'com', 'natura', '-', 'refil']
                clean_name = name_found.lower()
                # Remove códigos numéricos soltos se houver (ex: "789...")
                clean_name = re.sub(r'\b\d+\b', '', clean_name) 
                
                # Filtra palavras-chave relevantes (maiores que 2 letras e não stopwords)
                keywords = [w for w in clean_name.split() if w not in stopwords and len(w) > 2]
                
                # 2. Construção da Query de Busca
                query_filter = Q()
                if keywords:
                    # A primeira palavra é obrigatória (ex: "Kaiak")
                    query_filter &= Q(name__icontains=keywords[0])
                    
                    # Tenta refinar combinando com até mais 2 palavras seguintes
                    if len(keywords) > 1:
                        sub_query = Q()
                        for word in keywords[1:3]: 
                             sub_query |= Q(name__icontains=word)
                        query_filter &= sub_query

                    # 3. Execução da Busca no Banco Local
                    candidates = Product.objects.filter(query_filter)[:5]
                    
                    # 4. Retorno: Sugestão ou Cadastro Manual
                    if candidates.exists():
                         print(f"   ✅ Encontrados {candidates.count()} candidatos similares.")
                         return Response({
                            "found": True,
                            "source": "suggestion", # Frontend deve tratar isso mostrando a lista
                            "google_name": name_found,
                            "candidates": ProductSerializer(candidates, many=True).data,
                            "message": f"Encontramos '{name_found}'. É algum destes do seu catálogo?"
                        })

                # Se não achou candidato no banco, mantém o comportamento original
                return Response({
                    "found": True,
                    "source": "remote_partial",
                    "data": online_data,
                    "message": "Nome encontrado! Complete o cadastro."
                })

# backend/core/inventory/views.py

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

@api_view(['GET'])
@permission_classes([AllowAny]) # ✅ Permite acesso sem login
def public_storefront(request, seller_id):
    try:
        # Busca a loja pelo ID do usuário ou ID da loja
        # Assumindo que seller_id é o ID do USER dono da loja
        store = Store.objects.get(user_id=seller_id)
    except Store.DoesNotExist:
        return Response({"error": "Loja não encontrada"}, status=404)

    # Busca itens com estoque > 0 dessa loja
    items = InventoryItem.objects.filter(
        store=store, 
        total_quantity__gt=0
    ).select_related('product').prefetch_related('batches')

    # Serializa manualmente ou usa o serializer existente
    items_data = []
    for item in items:
        # Pega a validade do primeiro lote que vai vencer (FIFO)
        batches = item.batches.filter(quantity__gt=0).order_by('expiration_date')
        first_batch = batches.first()
        
        items_data.append({
            "id": item.id,
            "sale_price": item.sale_price if item.sale_price > 0 else item.product.official_price,
            "total_quantity": item.total_quantity,
            "product": {
                "name": item.product.name,
                "category": item.product.category,
                "image_url": item.product.image_url
            },
            "batches": [{"expiration_date": first_batch.expiration_date}] if first_batch else []
        })

    return Response({
        "store_name": store.name,
        "whatsapp": store.whatsapp,
        "items": items_data
    })

# ... imports ...
from .models import StockTransaction # <--- Não esqueça de importar

class StockEntryView(APIView):
    def post(self, request):
        serializer = StockEntrySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)
            
        data = serializer.validated_data
        store = get_current_store(request.user)
        
        try:
            product = Product.objects.get(bar_code=data['bar_code'])
        except Product.DoesNotExist:
            return Response({"error": "Produto não cadastrado."}, status=404)
            
        with transaction.atomic():
            # 1. Atualiza/Cria Item no Estoque
            item, created = InventoryItem.objects.get_or_create(
                store=store,
                product=product,
                defaults={
                    'cost_price': data.get('cost_price', 0),
                    'sale_price': data.get('sale_price', 0),
                    'total_quantity': 0
                }
            )
            
            if not created:
                if data.get('cost_price'): item.cost_price = data['cost_price']
                if data.get('sale_price'): item.sale_price = data['sale_price']
            
            # 2. Cria Lote (Captura o objeto criado para vincular no histórico)
            new_batch = InventoryBatch.objects.create(
                item=item,
                quantity=data['quantity'],
                batch_code=data.get('batch_code', ''),
                expiration_date=data.get('expiration_date')
            )
            
            # 3. Atualiza Total
            item.total_quantity += data['quantity']
            item.save()

            # 4. REGISTRA NO HISTÓRICO (StockTransaction)
            StockTransaction.objects.create(
                store=store,
                product=product,
                batch=new_batch,
                transaction_type='ENTRADA',
                quantity=data['quantity'], # Positivo
                unit_cost=item.cost_price,
                unit_price=item.sale_price,
                description=f"Entrada Lote {new_batch.batch_code}"
            )
            
        return Response({"message": "Estoque atualizado e registrado!", "new_total": item.total_quantity})
    
    # Em backend/core/inventory/views.py

from rest_framework import viewsets
from django_filters.rest_framework import DjangoFilterBackend
from .models import StockTransaction
from .serializers import StockTransactionSerializer

# Se você estiver usando a função helper para pegar a loja atual
# from .utils import get_current_store (ou onde ela estiver definida)

class StockTransactionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = StockTransactionSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['transaction_type']

    def get_queryset(self):
        # Filtra transações apenas da loja do usuário logado
        # Ajuste a lógica de get_current_store conforme sua implementação
        # store = get_current_store(self.request.user) 
        # return StockTransaction.objects.filter(store=store).order_by('-created_at')
        
        # Exemplo genérico se o user tiver relação direta com a store
        user = self.request.user
        if hasattr(user, 'store'):
             return StockTransaction.objects.filter(store=user.store).order_by('-created_at')
        return StockTransaction.objects.none()