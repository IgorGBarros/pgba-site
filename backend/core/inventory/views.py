from time import timezone
from django.db import models
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

from rest_framework_simplejwt.views import TokenObtainPairView,TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import CustomTokenObtainPairSerializer, CustomUserSerializer
from .models import CustomUser


# Imports do seu Projeto
from .models import Product, InventoryItem, InventoryBatch, Store, Sale, SaleItem, PriceHistory
# OBS: Removi 'CustomUserSerializer' e 'CustomTokenObtainPairSerializer' pois eles dependem do CustomUser
from .serializers import InventoryItemSerializer, ProductSerializer, StockEntrySerializer, SaleSerializer
from .scraper import search_google_shopping
import re
from django.contrib.auth import login


# Pega o usuário padrão (seja ele Custom ou Default)
User = get_user_model()

# ============================================================================
# 1. AUTHENTICATION (Simplificada para MVP)
# ============================================================================

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class CustomUserCreateView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [AllowAny]  # Permissão para qualquer usuário


User = get_user_model()


class FirebaseLoginView(APIView):
    """View para Login/Cadastro via Google (Firebase)"""
    permission_classes = [AllowAny]

    def post(self, request):
        firebase_token = request.data.get('token')
        
        if not firebase_token:
            return Response({'error': 'Token ausente'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            # 1. Verifica token via firebase_admin
            from firebase_admin import auth as firebase_auth
            decoded_token = firebase_auth.verify_id_token(firebase_token)
            email = decoded_token.get('email')
            name = decoded_token.get('name', 'Consultora')
            
            # 2. Cria ou pega usuário usando o modelo Padrão do Django
            # CORREÇÃO AQUI: Usa first_name em vez de name
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'first_name': name[:30], # Limita tamanho caso venha nome muito longo
                    'username': email
                }
            )
            
            # Se for criado agora, define uma senha inútil para ele não conseguir logar sem Google
            if created:
                user.set_unusable_password()
                user.save()

            # 3. Gera JWT do Django para a sessão
            from rest_framework_simplejwt.tokens import RefreshToken
            refresh = RefreshToken.for_user(user)
            
            # 4. Adiciona Claims extras (Opcional, mas útil pro Front)
            refresh['email'] = user.email
            refresh['name'] = user.first_name
            
            return Response({
                'access': str(refresh.access_token), 
                'refresh': str(refresh),
                'email': user.email,
                'name': user.first_name,
                'is_authenticated': True
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            # Trocado para imprimir no log do Render qual foi o erro exato
            print(f"🔥 ERRO FIREBASE VIEW: {str(e)}") 
            return Response({'error': f"Erro interno: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)


# ============================================================================
# 2. CORE BUSINESS (ESTOQUE)
# ============================================================================
from rest_framework import viewsets, status, permissions
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.db import transaction
from django.db.models import Q, Sum, F
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
import re

# Imports Locais
from .models import (
    Product, Store, InventoryItem, InventoryBatch, 
    Sale, SaleItem, PriceHistory, StockTransaction
)
from .serializers import (
    ProductSerializer, InventoryItemSerializer, 
    StockEntrySerializer, SaleSerializer, StockTransactionSerializer
)
from .scraper import search_google_shopping

# ==========================================
# 0. HELPERS & MIXINS MULTI-TENANT
# ==========================================

def get_current_store(user):
    """
    Retorna a loja vinculada ao usuário logado.
    Em um cenário SaaS real, isso garante que o user só mexa na própria loja.
    """
    if hasattr(user, 'store'):
        return user.store
    return None

class TenantModelMixin:
    """
    Mixin para ViewSets. Filtra automaticamente os dados pela loja do usuário.
    """
    permission_classes = [IsAuthenticated]

    def get_store(self):
        return get_current_store(self.request.user)

    def get_queryset(self):
        qs = super().get_queryset()
        store = self.get_store()
        if store:
            return qs.filter(store=store)
        return qs.none()

    def perform_create(self, serializer):
        serializer.save(store=self.get_store())

# ==========================================
# 1. VIEWSETS BASE (CRUD)
# ==========================================

class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    """Catálogo Global - Apenas Leitura para as consultoras"""
    permission_classes = [IsAuthenticated]
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

class InventoryViewSet(TenantModelMixin, viewsets.ModelViewSet):
    """Estoque Privado da Consultora"""
    queryset = InventoryItem.objects.all().select_related('product')
    serializer_class = InventoryItemSerializer

class StockTransactionViewSet(TenantModelMixin, viewsets.ReadOnlyModelViewSet):
    """Extrato de Movimentações da Loja"""
    queryset = StockTransaction.objects.all().order_by('-created_at')
    serializer_class = StockTransactionSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['transaction_type']

# ==========================================
# 2. OPERAÇÕES COMPLEXAS (ENTRADA E SAÍDA)
# ==========================================

class StockEntryView(APIView):
    """
    RECEBIMENTO DE MERCADORIA
    Lógica: Tenta achar por SKU -> Tenta achar por Barcode -> Cria Novo
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = StockEntrySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)
            
        data = serializer.validated_data
        store = get_current_store(request.user)
        if not store:
            return Response({"error": "Usuário não possui loja vinculada."}, status=403)
        
        with transaction.atomic():
            product = None
            sku_input = data.get('natura_sku')
            barcode_input = data.get('bar_code')

            # 1. Tenta achar o produto no catálogo global
            if sku_input:
                product = Product.objects.filter(natura_sku=sku_input).first()

            if not product and barcode_input:
                product = Product.objects.filter(bar_code=barcode_input).first()

            # 2. Cria ou Atualiza o Produto Global
            if product:
                updated = False
                if barcode_input and not product.bar_code:
                    product.bar_code = barcode_input
                    updated = True
                if sku_input and not product.natura_sku:
                    product.natura_sku = sku_input
                    updated = True
                if data.get('name') and "Produto Novo" in product.name:
                    product.name = data['name']
                    updated = True
                if updated:
                    product.save()
            else:
                product = Product.objects.create(
                    bar_code=barcode_input,
                    natura_sku=sku_input,
                    name=data.get('name', 'Produto Novo'),
                    category=data.get('category', 'Geral'),
                    official_price=data.get('sale_price', 0),
                    image_url=data.get('image_url', ''),
                    last_checked_at=timezone.now()
                )
            
            # 3. Gerenciar Estoque da Loja
            item, _ = InventoryItem.objects.get_or_create(
                store=store,
                product=product,
                defaults={
                    'cost_price': data.get('cost_price', 0),
                    'sale_price': data.get('sale_price', 0),
                    'total_quantity': 0
                }
            )
            
            if data.get('cost_price'): item.cost_price = data['cost_price']
            if data.get('sale_price'): item.sale_price = data['sale_price']
            item.save() 
            
            # 4. Criar Lote
            new_batch = InventoryBatch.objects.create(
                item=item,
                quantity=data['quantity'],
                batch_code=data.get('batch_code', ''),
                expiration_date=data.get('expiration_date')
            )
            
            # 5. Atualizar Total Consolidado
            total_real = item.batches.aggregate(total=Sum('quantity'))['total'] or 0
            item.total_quantity = total_real
            item.save()
            
            # 6. Registrar Transação (Log/Extrato)
            StockTransaction.objects.create(
                store=store,
                product=product,
                batch=new_batch,
                transaction_type='ENTRADA',
                quantity=data['quantity'],
                unit_cost=data.get('cost_price'),
                unit_price=data.get('sale_price'),
                description=f"Entrada Lote {new_batch.batch_code or 'S/N'}"
            )
            
        return Response({
            "message": "Estoque atualizado com sucesso!", 
            "product": product.name,
            "new_total": item.total_quantity
        })

class SaleCheckoutView(APIView):
    """
    CAIXA / PDV (SCAN DE SAÍDA)
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = SaleSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)
            
        data = serializer.validated_data
        store = get_current_store(request.user)
        total_sale = 0
        
        try:
            with transaction.atomic():
                sale = Sale.objects.create(
                    store=store,
                    client_name=data.get('client_name', ''),
                    payment_method=data.get('payment_method', 'DINHEIRO'),
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
                    
                    # Lógica de Baixa (Lote Específico ou FIFO)
                    batch_used = None
                    if 'batch_id' in item_data:
                        batch_used = InventoryBatch.objects.get(id=item_data['batch_id'])
                        if batch_used.quantity < qtd: raise Exception("Lote insuficiente")
                        batch_used.quantity -= qtd
                        batch_used.save()
                    else:
                        batches = inventory_item.batches.filter(quantity__gt=0).order_by('expiration_date')
                        remaining = qtd
                        for b in batches:
                            if remaining <= 0: break
                            take = min(remaining, b.quantity)
                            b.quantity -= take
                            b.save()
                            remaining -= take
                            batch_used = b 
                    
                    inventory_item.total_quantity -= qtd
                    inventory_item.save()
                    
                    SaleItem.objects.create(
                        sale=sale, product=product, batch=batch_used,
                        quantity=qtd, unit_price_sold=price
                    )
                    
                    # Registrar no Extrato
                    StockTransaction.objects.create(
                        store=store,
                        product=product,
                        batch=batch_used,
                        transaction_type=sale.transaction_type,
                        quantity=-qtd, # Negativo = Saída
                        unit_cost=inventory_item.cost_price,
                        unit_price=price,
                        description=f"Ref. Operação #{sale.id}"
                    )

                    if sale.transaction_type == 'VENDA':
                        total_sale += price * qtd
                
                sale.total_amount = total_sale
                sale.save()
                
        except Exception as e:
            return Response({"error": str(e)}, status=400)
            
        return Response({"message": "Operação realizada com sucesso!", "total": total_sale})


# ==========================================
# 3. BUSCA INTELIGENTE (SCRAPER)
# ==========================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def lookup_product(request):
    """
    Busca produto no banco local ou na internet via RPA.
    """
    query = request.query_params.get('ean') or request.query_params.get('q')
    force_remote = request.query_params.get('force_remote') == 'true'
    
    print(f"\n🔍 [DEBUG] Nova busca: '{query}'")
    if not query:
        return Response({"error": "Query obrigatória"}, status=400)
    
    # 1. Busca Local
    if not force_remote:
        local = Product.objects.filter(Q(bar_code=query) | Q(natura_sku=query)).first()
        if local:
            print(f"   ✅ Encontrado no banco local: {local.name}")
            return Response({"found": True, "source": "local", "data": ProductSerializer(local).data})
            
    # 2. Busca Remota
    if query and query.isdigit() and len(query) > 6:
        print(f"   ↳ Buscando ONLINE para aprender...")
        
        online_data = search_google_shopping(query)
        
        if online_data:
            sku_found = online_data.get('natura_sku')
            name_found = online_data.get('name')
            
            # Salvar resultados bônus (se houver)
            all_results = online_data.get('all_results', [])
            if all_results:
                for p in all_results:
                    Product.objects.update_or_create(
                        natura_sku=p['natura_sku'],
                        defaults={
                            'name': p['name'],
                            'official_price': p.get('sale_price', 0),
                            'category': p.get('category', 'Geral'),
                            'last_checked_at': timezone.now()
                        }
                    )
            
            # Match exato por SKU
            if sku_found:
                product, created = Product.objects.get_or_create(
                    natura_sku=sku_found,
                    defaults={
                        'bar_code': query,
                        'name': name_found,
                        'official_price': online_data.get('sale_price', 0),
                        'category': online_data.get('category', 'Geral'),
                        'description': online_data.get('description', '')
                    }
                )
                if not created and not product.bar_code:
                    product.bar_code = query
                    product.save()
                    
                return Response({
                    "found": True, 
                    "source": "remote_learned", 
                    "data": ProductSerializer(product).data
                })
                
            # Match Fuzzy (Nome)
            elif name_found:
                stopwords = ['ml', 'g', 'de', 'e', 'para', 'o', 'a', 'com', 'natura', '-', 'refil']
                clean_name = re.sub(r'\b\d+\b', '', name_found.lower())
                keywords = [w for w in clean_name.split() if w not in stopwords and len(w) > 2]
                
                query_filter = Q()
                if keywords:
                    query_filter &= Q(name__icontains=keywords[0])
                    for word in keywords[1:3]: 
                        query_filter &= Q(name__icontains=word)
                    
                    candidates = Product.objects.filter(query_filter)[:5]
                    
                    if candidates.exists():
                         return Response({
                            "found": True,
                            "source": "suggestion",
                            "google_name": name_found,
                            "candidates": ProductSerializer(candidates, many=True).data,
                            "message": "Qual destes é o correto?"
                        })
                        
                return Response({
                    "found": True,
                    "source": "remote_partial",
                    "data": online_data
                })
                
    return Response({"found": False, "source": None})


# ==========================================
# 4. VITRINE PÚBLICA E DASHBOARD
# ==========================================

@api_view(['GET'])
@permission_classes([AllowAny]) # ✅ Público para clientes
def public_storefront(request, slug):
    """
    Exibe os produtos disponíveis da loja para clientes (Vitrine).
    """
    try:
        store = Store.objects.get(slug=slug)
    except Store.DoesNotExist:
        return Response({"error": "Loja não encontrada"}, status=404)
        
    items = InventoryItem.objects.filter(
        store=store, total_quantity__gt=0
    ).select_related('product').prefetch_related('batches')
    
    items_data = []
    for item in items:
        # Pega a validade do lote que vence primeiro
        first_batch = item.batches.filter(quantity__gt=0).order_by('expiration_date').first()
        
        items_data.append({
            "id": item.id,
            "sale_price": item.sale_price if item.sale_price > 0 else item.product.official_price,
            "total_quantity": item.total_quantity,
            "product": {
                "name": item.product.name,
                "category": item.product.category,
                "image_url": item.product.image_url
            },
            "next_expiration": first_batch.expiration_date if first_batch else None
        })
        
    return Response({
        "store": {
            "name": store.name,
            "whatsapp": store.whatsapp
        },
        "items": items_data
    })

class DashboardStatsView(APIView):
    """
    Estatísticas para o painel principal.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        store = get_current_store(request.user)
        if not store:
            return Response({"error": "Loja não configurada"}, status=400)
        
        totals = InventoryItem.objects.filter(store=store).aggregate(
            total_cost=Sum(F('total_quantity') * F('cost_price')),
            total_sales_potential=Sum(F('total_quantity') * F('sale_price')),
            total_items=Sum('total_quantity')
        )

        category_stats = (
            InventoryItem.objects.filter(store=store, total_quantity__gt=0)
            .values('product__category')
            .annotate(
                value=Sum(F('total_quantity') * F('sale_price')),
                count=Sum('total_quantity')
            ).order_by('-value')
        )

        low_stock = InventoryItem.objects.filter(
            store=store, total_quantity__lte=F('min_quantity'), total_quantity__gt=0
        ).count()

        return Response({
            "financial": {
                "invested": totals['total_cost'] or 0,
                "potential_revenue": totals['total_sales_potential'] or 0,
                "profit_margin": (totals['total_sales_potential'] or 0) - (totals['total_cost'] or 0)
            },
            "inventory": {
                "total_items": totals['total_items'] or 0,
                "low_stock_count": low_stock
            },
            "charts": {
                "by_category": category_stats
            }
        })