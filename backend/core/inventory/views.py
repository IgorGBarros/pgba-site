from aiohttp import request
from django.db import models
from django.db import transaction
from rest_framework import viewsets,status, permissions, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.db.models import Q, Sum, F
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
import re

# Imports do Django Auth
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model

from rest_framework_simplejwt.views import TokenObtainPairView,TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import CustomTokenObtainPairSerializer, CustomUserSerializer, ProfileSerializer
from .models import CustomUser, RegistrationSession


# Imports do seu Projeto
from .models import Product, InventoryItem, InventoryBatch, Store, Sale, SaleItem, PriceHistory
# OBS: Removi 'CustomUserSerializer' e 'CustomTokenObtainPairSerializer' pois eles dependem do CustomUser
from .serializers import InventoryItemSerializer, ProductSerializer, StockEntrySerializer, SaleSerializer
from .scraper import search_google_shopping
import re
from django.contrib.auth import login

from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import login, get_user_model


User = get_user_model()

# ============================================================================
# 1. AUTHENTICATION VIEWS
# ============================================================================

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
class CustomUserCreateView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [AllowAny]  # ✅ Permite GET sem login

class FirebaseLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        firebase_token = request.data.get('token')
        
        if not firebase_token:
            return Response({'error': 'Token ausente'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            # 1. Usa o método Elegante do seu Manager
            user = CustomUser.objects.create_user_with_firebase(firebase_token)
            
            # 2. Inicia sessão tradicional do Django (Opcional, mas estava no seu código)
            login(request, user)  
            
            # 3. Gera os Tokens JWT para o Frontend moderno (React/Vite) usar no Bearer
            refresh = RefreshToken.for_user(user)
            
            # Retorna o payload combinando a simplicidade do seu código antigo
            # com a necessidade de JWT do projeto atual.
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'email': user.email,
                'name': getattr(user, 'name', user.email),
                'is_authenticated': True
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            # Mantive a impressão para debug no Render, facilita muito a vida!
            print(f"🔥 ERRO FIREBASE VIEW: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# ... (Abaixo seguem as rotas do Estoque: ProductViewSet, StockEntryView, etc) ...
# ============================================================================
# 2. CORE BUSINESS (ESTOQUE)
# ============================================================================


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
    """Obtém a loja do usuário atual"""
    try:
        from .models import Store
        store, created = Store.objects.get_or_create(
            user=user,
            defaults={
                'name': f'Loja de {user.email}',
                'slug': user.email.split('@')[0].replace('.', ''),
                'storefront_enabled': True
            }
        )
        return store
    except Exception as e:
        print(f"❌ Erro ao obter loja: {e}")
        raise

class TenantModelMixin:
    """
    Mixin para ViewSets. Filtra automaticamente os dados pela loja do usuário.
    """
    permission_classes = [IsAuthenticated]

    def get_store(self):
        return get_current_store(self.request.user)

    def get_queryset(self):
        # ✅ ADICIONAR tratamento de erro
        try:
            store = get_current_store(self.request.user)
            return InventoryItem.objects.filter(store=store).select_related('product')
        except Exception as e:
            print(f"❌ Erro no get_queryset: {e}")
            return InventoryItem.objects.none()

    def perform_create(self, serializer):
        serializer.save(store=self.get_store())

# ==========================================
# 1. VIEWSETS BASE (CRUD)
# ==========================================

class ProductViewSet(viewsets.ModelViewSet):
    """Catálogo Global - Leitura livre, Edição apenas de itens não protegidos"""
    permission_classes = [AllowAny]    
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # 🚀 PROTEÇÃO: Impede que o usuário altere o catálogo oficial da Natura,
        # mas permite que ele altere os produtos que ele mesmo cadastrou manualmente.
        is_protected = getattr(instance, 'is_protected', False)
        if is_protected:
            # Retorna 200 OK para não quebrar o frontend, mas não faz a alteração no banco global
            return Response(
                {"message": "Produto protegido. Alterações no catálogo global foram ignoradas."}, 
                status=status.HTTP_200_OK
            )
            
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

from django.db.models import Sum, Prefetch
from django.utils import timezone
from rest_framework import viewsets
from rest_framework.response import Response




from django.db.models import Sum, Prefetch
from django.utils import timezone
from django.db import transaction
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

# inventory/views.py - IMPLEMENTAR ESTAS CORREÇÕES

class InventoryViewSet(TenantModelMixin, viewsets.ModelViewSet):
    """Estoque Privado da Consultora - VERSÃO CORRIGIDA"""
    serializer_class = InventoryItemSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['product__category']
    
    def get_queryset(self):
        """Queryset com tratamento de erro robusto"""
        try:
            store = get_current_store(self.request.user)
            return InventoryItem.objects.filter(store=store).select_related('product').prefetch_related(
                # ✅ CORREÇÃO: Ordenar lotes por validade (FIFO) e incluir apenas com estoque
                Prefetch(
                    'batches', 
                    queryset=InventoryBatch.objects.filter(quantity__gt=0).order_by('expiration_date', 'id')
                )
            ).order_by('-updated_at')
        except Exception as e:
            print(f"❌ Erro no get_queryset Inventory: {e}")
            return InventoryItem.objects.none()

    def consolidate_batches_by_expiry(self, inventory_item):
        """✅ NOVO: Consolida lotes com a mesma data de validade"""
        from collections import defaultdict
        
        print(f"🔄 Consolidando lotes para {inventory_item.product.name}")
        
        # Agrupar lotes por data de validade
        batches_by_date = defaultdict(list)
        
        for batch in inventory_item.batches.filter(quantity__gt=0):
            date_key = batch.expiration_date.isoformat() if batch.expiration_date else 'no_date'
            batches_by_date[date_key].append(batch)
        
        # Consolidar lotes duplicados
        consolidated_count = 0
        for date_key, batches in batches_by_date.items():
            if len(batches) > 1:
                print(f"🔄 Consolidando {len(batches)} lotes com validade {date_key}")
                
                # Manter o primeiro lote e somar as quantidades
                main_batch = batches[0]
                total_quantity = sum(batch.quantity for batch in batches)
                
                # Atualizar quantidade do lote principal
                main_batch.quantity = total_quantity
                main_batch.save()
                
                # Remover lotes duplicados
                for batch in batches[1:]:
                    print(f"🗑️ Removendo lote duplicado {batch.id}")
                    batch.delete()
                
                consolidated_count += 1
        
        if consolidated_count > 0:
            print(f"✅ Consolidados {consolidated_count} grupos de lotes")
            
            # Recalcular total
            total_real = inventory_item.batches.aggregate(
                total=Sum('quantity')
            )['total'] or 0
            
            inventory_item.total_quantity = total_real
            inventory_item.save()
        
        return inventory_item

    def list(self, request, *args, **kwargs):
        """Lista com tratamento de erro robusto e consolidação automática"""
        try:
            print("📦 Iniciando listagem do inventário...")
            
            queryset = self.filter_queryset(self.get_queryset())
            
            if not queryset.exists():
                print("📦 Nenhum item encontrado no inventário")
                return Response([])
            
            print(f"📦 Encontrados {queryset.count()} itens no inventário")
            
            # ✅ Consolidar e corrigir totais (limitado para performance)
            items_to_process = queryset[:15]  # Limitar para evitar timeout
            corrected_count = 0
            consolidated_count = 0
            
            for item in items_to_process:
                try:
                    # ✅ NOVO: Consolidar lotes primeiro
                    old_batch_count = item.batches.filter(quantity__gt=0).count()
                    item = self.consolidate_batches_by_expiry(item)
                    new_batch_count = item.batches.filter(quantity__gt=0).count()
                    
                    if old_batch_count != new_batch_count:
                        consolidated_count += 1
                    
                    # Verificar e corrigir totais
                    active_batches = item.batches.filter(quantity__gt=0)
                    total_real = active_batches.aggregate(total=Sum('quantity'))['total'] or 0
                    
                    if item.total_quantity != total_real:
                        print(f"🔄 Corrigindo total de {item.product.name}: {item.total_quantity} → {total_real}")
                        item.total_quantity = total_real
                        item.save()
                        corrected_count += 1
                        
                except Exception as e:
                    print(f"⚠️ Erro ao processar item {item.id}: {e}")
                    continue
            
            if corrected_count > 0:
                print(f"✅ Corrigidos {corrected_count} totais desatualizados")
            if consolidated_count > 0:
                print(f"✅ Consolidados lotes em {consolidated_count} produtos")
            
            # Paginação
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            
            serializer = self.get_serializer(queryset, many=True)
            data = serializer.data
            
            print(f"✅ Inventário serializado: {len(data)} itens")
            return Response(data)
            
        except Exception as e:
            print(f"❌ Erro crítico no list do inventário: {e}")
            import traceback
            traceback.print_exc()
            
            return Response({
                'error': 'Erro ao carregar inventário',
                'message': str(e),
                'fallback': []
            }, status=200)

    def retrieve(self, request, *args, **kwargs):
        """Detalhes com consolidação automática e FIFO"""
        try:
            print(f"🔍 Buscando detalhes do item {kwargs.get('pk')}")
            
            instance = self.get_object()
            
            # ✅ CONSOLIDAR lotes automaticamente
            instance = self.consolidate_batches_by_expiry(instance)
            
            # Buscar lotes ativos ordenados por validade (FIFO)
            active_batches = instance.batches.filter(quantity__gt=0).order_by('expiration_date', 'id')
            
            # Recalcular total real baseado nos lotes
            total_real = active_batches.aggregate(total=Sum('quantity'))['total'] or 0
            
            if instance.total_quantity != total_real:
                print(f"🔄 Corrigindo total de {instance.product.name}: {instance.total_quantity} → {total_real}")
                instance.total_quantity = total_real
                instance.save()
            
            # Serializar com dados básicos
            serializer = self.get_serializer(instance)
            data = serializer.data
            
            # ✅ Substituir lotes por versão ordenada e enriquecida
            batches_data = []
            today = timezone.now().date()
            
            for batch in active_batches:
                try:
                    # Calcular informações de validade
                    is_expired = False
                    days_to_expire = None
                    
                    if batch.expiration_date:
                        is_expired = batch.expiration_date < today
                        if not is_expired:
                            days_to_expire = (batch.expiration_date - today).days
                    
                    batches_data.append({
                        'id': batch.id,
                        'batch_code': batch.batch_code or 'S/N',
                        'expiration_date': batch.expiration_date,
                        'quantity': batch.quantity,
                        'cost_price': float(getattr(batch, 'cost_price', 0)),
                        'formatted_date': batch.expiration_date.strftime('%d/%m/%Y') if batch.expiration_date else 'Sem validade',
                        'is_expired': is_expired,
                        'is_near_expiry': days_to_expire is not None and days_to_expire <= 30,
                        'days_to_expire': days_to_expire,
                        'status': 'expired' if is_expired else ('near_expiry' if days_to_expire is not None and days_to_expire <= 30 else 'valid')
                    })
                    
                except Exception as e:
                    print(f"⚠️ Erro ao processar lote {batch.id}: {e}")
                    continue
            
            # Estatísticas dos lotes
            batch_stats = {
                'total_batches': len(batches_data),
                'expired_batches': len([b for b in batches_data if b['is_expired']]),
                'near_expiry_batches': len([b for b in batches_data if b['is_near_expiry'] and not b['is_expired']]),
                'valid_batches': len([b for b in batches_data if not b['is_expired'] and not b['is_near_expiry']])
            }
            
            # Atualizar response com dados organizados
            data['batches'] = batches_data
            data['batch_stats'] = batch_stats
            data['total_quantity'] = total_real
            
            print(f"✅ Detalhes do item {instance.id} carregados com {len(batches_data)} lotes")
            return Response(data)
            
        except Exception as e:
            print(f"❌ Erro no retrieve do item {kwargs.get('pk')}: {e}")
            import traceback
            traceback.print_exc()
            return Response({
                'error': 'Erro ao carregar detalhes do item',
                'message': str(e)
            }, status=500)

    def perform_create(self, serializer):
        """Garantir que criação sempre vincula à loja correta"""
        try:
            store = get_current_store(self.request.user)
            serializer.save(store=store)
            print(f"✅ Item criado para a loja {store.id}")
        except Exception as e:
            print(f"❌ Erro ao criar item: {e}")
            raise

    def perform_update(self, serializer):
        """Recalcular total após atualização"""
        try:
            instance = serializer.save()
            
            # Recalcular total baseado nos lotes
            total_real = instance.batches.filter(quantity__gt=0).aggregate(
                total=Sum('quantity')
            )['total'] or 0
            
            if instance.total_quantity != total_real:
                print(f"🔄 Recalculando total após update: {instance.total_quantity} → {total_real}")
                instance.total_quantity = total_real
                instance.save()
                
        except Exception as e:
            print(f"❌ Erro ao atualizar item: {e}")
            raise

    def update(self, request, *args, **kwargs):
        """Override do update com tratamento de erro"""
        try:
            partial = kwargs.pop('partial', False)
            instance = self.get_object()
            
            print(f"🔄 Atualizando item {instance.id}: {request.data}")
            
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            
            if getattr(instance, '_prefetched_objects_cache', None):
                instance._prefetched_objects_cache = {}
            
            return Response(serializer.data)
            
        except Exception as e:
            print(f"❌ Erro no update: {e}")
            return Response({
                'error': 'Erro ao atualizar item',
                'message': str(e)
            }, status=500)

    def destroy(self, request, *args, **kwargs):
        """Override do destroy com logs"""
        try:
            instance = self.get_object()
            print(f"🗑️ Removendo item {instance.id}")
            
            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
            
        except Exception as e:
            print(f"❌ Erro ao remover item: {e}")
            return Response({
                'error': 'Erro ao remover item',
                'message': str(e)
            }, status=500)

class StockTransactionViewSet(TenantModelMixin, viewsets.ModelViewSet):
    """Extrato de Movimentações da Loja - VERSÃO CORRIGIDA"""
    serializer_class = StockTransactionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['transaction_type']
    
    def get_queryset(self):
        """Queryset com tratamento de erro robusto"""
        try:
            store = get_current_store(self.request.user)
            return StockTransaction.objects.filter(
                store=store
            ).select_related('product', 'batch').order_by('-created_at')
        except Exception as e:
            print(f"❌ Erro no get_queryset StockTransaction: {e}")
            return StockTransaction.objects.none()

    def apply_fifo_withdrawal(self, inventory_item, quantity_to_withdraw):
        """✅ NOVO: Aplica baixa FIFO automática nos lotes"""
        print(f"🎯 Aplicando FIFO: {quantity_to_withdraw} unidades de {inventory_item.product.name}")
        
        # Buscar lotes ordenados por validade (FIFO)
        available_batches = inventory_item.batches.filter(
            quantity__gt=0
        ).order_by('expiration_date', 'id')
        
        if not available_batches.exists():
            raise ValueError("Não há lotes disponíveis")
        
        total_available = sum(batch.quantity for batch in available_batches)
        if total_available < quantity_to_withdraw:
            raise ValueError(f"Estoque insuficiente. Disponível: {total_available}, Solicitado: {quantity_to_withdraw}")
        
        # Aplicar baixas nos lotes (FIFO)
        remaining_to_withdraw = quantity_to_withdraw
        batches_used = []
        
        for batch in available_batches:
            if remaining_to_withdraw <= 0:
                break
            
            qty_from_batch = min(remaining_to_withdraw, batch.quantity)
            
            print(f"📦 Lote {batch.id} (Val: {batch.expiration_date}): {batch.quantity} → {batch.quantity - qty_from_batch}")
            
            # Aplicar baixa
            batch.quantity -= qty_from_batch
            batch.save()
            
            # Se lote zerou, pode ser removido
            if batch.quantity == 0:
                print(f"🗑️ Lote {batch.id} zerado - removendo")
                batch.delete()
            
            batches_used.append({
                'batch_id': batch.id,
                'quantity_used': qty_from_batch,
                'expiration_date': batch.expiration_date
            })
            
            remaining_to_withdraw -= qty_from_batch
        
        # Recalcular total do inventário
        total_real = inventory_item.batches.aggregate(
            total=Sum('quantity')
        )['total'] or 0
        
        inventory_item.total_quantity = total_real
        inventory_item.save()
        
        print(f"📊 Total atualizado: {inventory_item.total_quantity}")
        
        return batches_used

    def create(self, request, *args, **kwargs):
        """Criar transação com FIFO automático"""
        try:
            store = get_current_store(request.user)
            data = request.data.copy()
            
            print(f"🔄 Criando transação: {data}")
            
            # ✅ CORREÇÃO: Melhorar busca do produto
            product_id = data.get('product_id') or data.get('product')
            barcode = data.get('barcode') or data.get('bar_code')
            
            product = None
            inventory_item = None
            
            # Buscar produto por ID primeiro
            if product_id:
                try:
                    product = Product.objects.get(id=product_id)
                    print(f"✅ Produto encontrado por ID: {product.name}")
                except Product.DoesNotExist:
                    print(f"❌ Produto com ID {product_id} não encontrado")
            
            # Se não encontrou por ID, buscar por código de barras
            if not product and barcode:
                try:
                    product = Product.objects.get(bar_code=barcode)
                    print(f"✅ Produto encontrado por código de barras: {product.name}")
                except Product.DoesNotExist:
                    print(f"❌ Produto com código {barcode} não encontrado")
            
            if not product:
                return Response({'error': 'Produto não encontrado no catálogo'}, status=404)
            
            # ✅ CORREÇÃO: Buscar item no inventário da loja
            try:
                inventory_item = InventoryItem.objects.get(store=store, product=product)
                print(f"✅ Item encontrado no inventário: {inventory_item.id}")
            except InventoryItem.DoesNotExist:
                return Response({
                    'error': 'Produto não encontrado no seu estoque',
                    'message': f'O produto "{product.name}" não está cadastrado no seu estoque. Adicione-o primeiro através da entrada de estoque.'
                }, status=404)
            
            quantity = abs(int(data.get('quantity', 0)))
            if quantity <= 0:
                return Response({'error': 'Quantidade deve ser maior que zero'}, status=400)
            
            transaction_type = data.get('transaction_type', '').upper()
            
            # Verificar se é saída e aplicar FIFO
            is_exit = transaction_type in ['VENDA', 'USO_PROPRIO', 'PRESENTE', 'BRINDE', 'PERDA', 'SAIDA']
            
            if is_exit:
                # ✅ APLICAR FIFO AUTOMÁTICO
                with transaction.atomic():
                    batches_used = self.apply_fifo_withdrawal(inventory_item, quantity)
                    
                    # Criar transações para cada lote usado
                    transactions_created = []
                    for batch_info in batches_used:
                        transaction_obj = StockTransaction.objects.create(
                            store=store,
                            product=product,
                            batch_id=batch_info['batch_id'],
                            transaction_type=transaction_type,
                            quantity=-batch_info['quantity_used'],  # Negativo para saída
                            unit_price=data.get('unit_price', 0),
                            unit_cost=data.get('unit_cost', 0),
                            description=data.get('description', f"{transaction_type} - {product.name}"),
                            notes=data.get('notes', '')
                        )
                        transactions_created.append(transaction_obj)
                    
                    print(f"✅ Criadas {len(transactions_created)} transações FIFO")
                    
                    # Retornar a primeira transação como referência
                    serializer = self.get_serializer(transactions_created[0])
                    return Response(serializer.data, status=201)
            
            else:
                # Entrada normal
                serializer = self.get_serializer(data=data)
                if serializer.is_valid():
                    serializer.save(store=store, product=product)
                    return Response(serializer.data, status=201)
                else:
                    return Response(serializer.errors, status=400)
            
        except Exception as e:
            print(f"❌ Erro ao criar transação: {e}")
            return Response({'error': str(e)}, status=500)

# ==========================================
# 2. OPERAÇÕES COMPLEXAS (ENTRADA E SAÍDA)
# ==========================================

class StockEntryView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        print(f"\n=== [DEBUG] StockEntryView ===")
        print(f"Usuário: {request.user}")
        print(f"Dados recebidos: {request.data}")
        
        serializer = StockEntrySerializer(data=request.data)
        if not serializer.is_valid():
            print(f"❌ Serializer inválido: {serializer.errors}")
            return Response(serializer.errors, status=400)
            
        data = serializer.validated_data
        print(f"✅ Dados validados: {data}")
        
        store = get_current_store(request.user)
        print(f"Store encontrada: {store}")
        
        if not store:
            print("❌ Usuário sem loja vinculada")
            return Response({"error": "Usuário não possui loja vinculada."}, status=403)

        try:
            with transaction.atomic():
                # Conversão de strings vazias para None (NULL) [1]
                raw_sku = data.get('natura_sku')
                sku_input = raw_sku if raw_sku and str(raw_sku).strip() != "" else None
                
                raw_barcode = data.get('bar_code')
                barcode_input = raw_barcode if raw_barcode and str(raw_barcode).strip() != "" else None
                
                name_input = data.get('name', '').strip()
                category_input = data.get('category', 'Geral')

                # Proteção contra nomes de fallback [1]
                if name_input in ["Produto sem nome", "Produto Novo", ""]:
                    name_input = "Produto Novo"

                print(f"Buscando produto: SKU={sku_input}, Barcode={barcode_input}")

                # 1. Buscar produto no catálogo [1]
                product = None
                
                if barcode_input:
                    product = Product.objects.filter(bar_code=barcode_input).first()
                    
                if not product and sku_input:
                    product = Product.objects.filter(natura_sku=sku_input).first()

                print(f"Produto encontrado: {product}")

                # 2. Criar ou atualizar produto [1]
                if product:
                    is_protected = getattr(product, 'is_protected', False)
                    if is_protected:
                        print("Produto oficial protegido - apenas vincular")
                    else:
                        print("Produto local não protegido - validando atualizações")
                        updated = False
                        
                        if barcode_input and not product.bar_code:
                            product.bar_code = barcode_input
                            updated = True
                            
                        if sku_input and not product.natura_sku:
                            if not Product.objects.exclude(id=product.id).filter(natura_sku=sku_input).exists():
                                product.natura_sku = sku_input
                                updated = True
                        
                        if name_input != "Produto Novo" and product.name != name_input:
                            product.name = name_input
                            updated = True
                            
                        if data.get('image_url') and not getattr(product, 'image_url', ''):
                            product.image_url = data['image_url']
                            updated = True

                        if updated:
                            product.save()
                            print("Produto atualizado com os novos dados")
                else:
                    print("Criando novo produto local")
                    product = Product.objects.create(
                        bar_code=barcode_input,
                        natura_sku=sku_input,
                        name=name_input,
                        category=category_input,
                        official_price=data.get('sale_price', 0),
                        image_url=data.get('image_url', ''),
                        last_checked_at=timezone.now()
                    )
                    print(f"Produto criado: {product}")

                # 3. Gerenciar estoque da loja [1]
                print(f"Criando/atualizando InventoryItem para store={store}, product={product}")
                item, created = InventoryItem.objects.get_or_create(
                    store=store,
                    product=product,
                    defaults={
                        'cost_price': data.get('cost_price', 0),
                        'sale_price': data.get('sale_price', 0),
                        'total_quantity': 0
                    }
                )
                print(f"InventoryItem: {item} (criado: {created})")

                if data.get('cost_price'): 
                    item.cost_price = data['cost_price']
                if data.get('sale_price'): 
                    item.sale_price = data['sale_price']
                item.save()
                print("InventoryItem salvo")

                # 4. ✅ NOVO: Verificar se já existe lote com mesma validade
                expiration_date = data.get('expiration_date')
                existing_batch = None
                
                if expiration_date:
                    existing_batch = item.batches.filter(
                        expiration_date=expiration_date,
                        quantity__gt=0
                    ).first()
                else:
                    # Para produtos sem validade, consolidar em um lote único
                    existing_batch = item.batches.filter(
                        expiration_date__isnull=True,
                        quantity__gt=0
                    ).first()

                if existing_batch:
                    # ✅ CONSOLIDAR: Somar quantidade no lote existente
                    print(f"📦 Consolidando com lote existente {existing_batch.id}")
                    existing_batch.quantity += data['quantity']
                    existing_batch.save()
                    used_batch = existing_batch
                else:
                    # Criar novo lote
                    print("Criando InventoryBatch")
                    used_batch = InventoryBatch.objects.create(
                        item=item,
                        quantity=data['quantity'],
                        batch_code=data.get('batch_code', ''),
                        expiration_date=expiration_date
                    )
                    print(f"Batch criado: {used_batch}")

                # 5. Atualizar Total Consolidado [1]
                total_real = item.batches.aggregate(total=Sum('quantity'))['total'] or 0
                item.total_quantity = total_real
                item.save()
                print(f"Total atualizado: {total_real}")

                # 6. Registrar Transação [1]
                print("Criando StockTransaction")
                StockTransaction.objects.create(
                    store=store,
                    product=product,
                    batch=used_batch,
                    transaction_type='ENTRADA',
                    quantity=data['quantity'],
                    unit_cost=data.get('cost_price'),
                    unit_price=data.get('sale_price'),
                    description=f"Entrada Lote {used_batch.batch_code or 'S/N'}"
                )
                print("Transação criada")

                # 7. Adicionar à sessão se existir
                try:
                    session = RegistrationSession.objects.filter(store=store, is_active=True).first()
                    if session:
                        session.add_product(item, data['quantity'])
                except:
                    pass  # Sessão é opcional

        except Exception as e:
            print(f"❌ ERRO na transação: {str(e)}")
            print(f"Tipo do erro: {type(e)}")
            import traceback
            traceback.print_exc()
            return Response({"error": f"Erro interno: {str(e)}"}, status=500)

        print("✅ Sucesso!")
        return Response({
            "message": "Estoque atualizado com sucesso!", 
            "product": product.name,
            "new_total": item.total_quantity,
            "batch_consolidated": existing_batch is not None
        })
# inventory/views.py - CORRIGIR SaleCheckoutView

class SaleCheckoutView(APIView):
    """
    CAIXA / PDV (SCAN DE SAÍDA) - FIFO CORRIGIDO
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
                    product = Product.objects.get(id=item_data['product_id'])
                    inventory_item = InventoryItem.objects.get(store=store, product=product)
                    
                    # ✅ APLICAR FIFO AUTOMÁTICO
                    batches_used = self.apply_fifo_withdrawal(
                        inventory_item, 
                        item_data['quantity']
                    )
                    
                    # Criar item de venda
                    sale_item = SaleItem.objects.create(
                        sale=sale,
                        product=product,
                        quantity=item_data['quantity'],
                        unit_price=item_data['unit_price'],
                        total_price=item_data['quantity'] * item_data['unit_price']
                    )
                    
                    # Registrar transações para cada lote usado
                    for batch_info in batches_used:
                        StockTransaction.objects.create(
                            store=store,
                            product=product,
                            batch_id=batch_info['batch_id'],
                            transaction_type='VENDA',
                            quantity=-batch_info['quantity_used'],
                            unit_cost=inventory_item.cost_price,
                            unit_price=item_data['unit_price'],
                            description=f"Venda FIFO - Lote {batch_info['expiration_date']}",
                            notes=f"Venda #{sale.id}"
                        )
                    
                    total_sale += sale_item.total_price
                
                sale.total_amount = total_sale
                sale.save()
                
                return Response({
                    'message': 'Venda registrada com sucesso',
                    'sale_id': sale.id,
                    'total_amount': total_sale
                })
                
        except Exception as e:
            print(f"❌ Erro na venda: {e}")
            return Response({
                'error': 'Erro ao processar venda',
                'message': str(e)
            }, status=500)
    
    def apply_fifo_withdrawal(self, inventory_item, quantity_to_withdraw):
        """✅ NOVO: Aplica baixa FIFO automática nos lotes"""
        print(f"🎯 Aplicando FIFO: {quantity_to_withdraw} unidades de {inventory_item.product.name}")
        
        # Buscar lotes ordenados por validade (FIFO)
        available_batches = inventory_item.batches.filter(
            quantity__gt=0
        ).order_by('expiration_date', 'id')
        
        if not available_batches.exists():
            raise ValueError("Não há lotes disponíveis")
        
        total_available = sum(batch.quantity for batch in available_batches)
        if total_available < quantity_to_withdraw:
            raise ValueError(f"Estoque insuficiente. Disponível: {total_available}, Solicitado: {quantity_to_withdraw}")
        
        # Aplicar baixas nos lotes (FIFO)
        remaining_to_withdraw = quantity_to_withdraw
        batches_used = []
        
        for batch in available_batches:
            if remaining_to_withdraw <= 0:
                break
            
            qty_from_batch = min(remaining_to_withdraw, batch.quantity)
            
            print(f"📦 Lote {batch.id} (Val: {batch.expiration_date}): {batch.quantity} → {batch.quantity - qty_from_batch}")
            
            # Aplicar baixa
            batch.quantity -= qty_from_batch
            batch.save()
            
            # Se lote zerou, pode ser removido
            if batch.quantity == 0:
                print(f"🗑️ Lote {batch.id} zerado - removendo")
                batch.delete()
            
            batches_used.append({
                'batch_id': batch.id,
                'quantity_used': qty_from_batch,
                'expiration_date': batch.expiration_date
            })
            
            remaining_to_withdraw -= qty_from_batch
        
        # Recalcular total do inventário
        total_real = inventory_item.batches.aggregate(
            total=Sum('quantity')
        )['total'] or 0
        
        inventory_item.total_quantity = total_real
        inventory_item.save()
        
        print(f"📊 Total atualizado: {inventory_item.total_quantity}")
        
        return batches_used
# ==========================================
# 3. BUSCA INTELIGENTE (SCRAPER)
# ==========================================

@api_view(['GET'])
@permission_classes([AllowAny])   

def lookup_product(request):
    """
    Busca produto no banco local ou na internet via RPA.
    Suporta busca por EAN exato, SKU exato ou Nome parcial (autocomplete).
    """
    query = request.query_params.get('ean') or request.query_params.get('q')
    force_remote = request.query_params.get('force_remote') == 'true'
    
    print(f"\n🔍 [DEBUG] Nova busca API: '{query}'")

    if not query:
        return Response({"error": "Parâmetro de busca obrigatório"}, status=400)
    
    # --- 1. SE FOR BUSCA POR NOME (NÃO É NÚMERO) ---
    # Isso atende ao ProductSearchModal perfeitamente
    if not query.isdigit():
        print(f"   ↳ Busca Textual detectada. Procurando no Catálogo Global...")
        
        # Faz uma busca case-insensitive no catálogo global (Product)
        candidates = Product.objects.filter(name__icontains=query).order_by('name')[:10]
        
        if candidates.exists():
            print(f"   ✅ Retornando {candidates.count()} candidatos.")
            return Response({
                "found": True,
                "source": "suggestion",
                "google_name": query,
                "candidates": ProductSerializer(candidates, many=True).data,
                "message": "Candidatos encontrados."
            })
        else:
            # Se não achou no banco, pode tentar jogar no Google (opcional) ou só retornar falso
            return Response({"found": False, "message": "Nenhum produto encontrado com este nome na base."})

    # --- 2. SE FOR BUSCA POR EAN / SKU (NÚMERO) ---
    print(f"   ↳ Busca Numérica detectada. Verificando base local...")
    
    if not force_remote:
        local = Product.objects.filter(Q(bar_code=query) | Q(natura_sku=query)).first()
        if local:
            print(f"   ✅ Encontrado no banco local (Match Exato): {local.name}")
            return Response({"found": True, "source": "local", "data": ProductSerializer(local).data})
            
    # Se não achou local ou forçou remoto, vai pros Scrapers (Google/Natura/Cosmos)
    if len(query) > 5:
        print(f"   ↳ Não achou EAN localmente. Iniciando Scraper para {query}...")
        
        online_data = search_google_shopping(query)
        
        if online_data:
            sku_found = online_data.get('natura_sku')
            name_found = online_data.get('name')
            
            # Salvar resultados adicionais (se a busca trouxe vários)
            all_results = online_data.get('all_results', [])
            for p in all_results:
                Product.objects.update_or_create(
                    natura_sku=p['natura_sku'],
                    defaults={'name': p['name'], 'official_price': p.get('sale_price', 0), 'category': p.get('category', 'Geral'), 'last_checked_at': timezone.now()}
                )
            
            # CASO 1: TEM SKU (Google ou Natura achou)
            if sku_found:
                try:
                    product = Product.objects.get(natura_sku=sku_found)
                    product.bar_code = query
                    product.save()
                    print(f"   🧠 APRENDIZADO: Vinculado EAN {query} ao SKU existente {sku_found}")
                except Product.DoesNotExist:
                    product = Product.objects.create(
                        natura_sku=sku_found, bar_code=query, name=name_found,
                        official_price=online_data.get('sale_price', 0), category=online_data.get('category', 'Geral'), description=online_data.get('description', '')
                    )
                    print(f"   🧠 APRENDIZADO: Novo produto criado (SKU {sku_found})")
                
                return Response({"found": True, "source": "remote_learned", "data": ProductSerializer(product).data})
                
            # CASO 2: SÓ TEM NOME (Ex: Cosmos achou)
            elif name_found:
                return Response({
                    "found": True, "source": "remote_partial", "data": online_data,
                    "message": "Produto achado, mas sem código Natura oficial."
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
    

@api_view(["GET"])
@permission_classes([AllowAny])
def feature_gates_view(request):
    """
    Fornece lista de feature gates para o frontend.
    Pode ser substituída futuramente por regras dinâmicas.
    """
    gates = [
        {"feature_key": "barcode_scanner", "label": "Scanner de Código", "description": None, "requires_pro": True},
        {"feature_key": "ocr_expiry", "label": "Leitor de Validade (IA)", "description": None, "requires_pro": True},
        {"feature_key": "dashboard_charts", "label": "Gráficos Avançados", "description": None, "requires_pro": True},
        {"feature_key": "dashboard_kpi_advanced", "label": "Lucro e Rentabilidade", "description": None, "requires_pro": True},
        {"feature_key": "ai_insights", "label": "Insights com Inteligência Artificial", "description": None, "requires_pro": True},
        {"feature_key": "storefront", "label": "Vitrine Digital", "description": None, "requires_pro": True},
        {"feature_key": "chat_assistant", "label": "Assistente de Estoque", "description": None, "requires_pro": True},
        {"feature_key": "unlimited_products", "label": "Produtos Ilimitados", "description": None, "requires_pro": True},
    ]
    return Response(gates)

@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def profile_view(request):
    """
    Retorna ou atualiza as informações da loja (perfil da consultora).
    """
    # Cada usuário tem uma Store vinculada; cria se não existir
    store, _ = Store.objects.get_or_create(user=request.user)

    if request.method == "GET":
        serializer = ProfileSerializer(store)
        return Response(serializer.data)

    if request.method == "PATCH":
        serializer = ProfileSerializer(store, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

from rest_framework.permissions import IsAdminUser

# ==========================================
# 5. PAINEL ADMIN (Gestão de Assinaturas)
# ==========================================

class AdminUserListView(APIView):
    """Lista todos os usuários e dados de suas lojas para o painel admin."""
    permission_classes = [IsAuthenticated, IsAdminUser] # 🔒 Apenas Administradores!

    def get(self, request):
        users = CustomUser.objects.select_related('store').all()
        data = []
        for u in users:
            store = getattr(u, 'store', None)
            
            # Conta quantos produtos diferentes essa loja tem em estoque
            product_count = InventoryItem.objects.filter(store=store).count() if store else 0
            
            data.append({
                "id": u.id,
                "email": u.email,
                "display_name": getattr(store, 'name', u.name),
                "plan": getattr(store, 'plan', 'free'),
                "store_slug": getattr(store, 'slug', None),
                "storefront_enabled": getattr(store, 'storefront_enabled', False),
                "whatsapp_number": getattr(store, 'whatsapp', None),
                "product_count": product_count,
                "created_at": getattr(store, 'created_at', u.last_login),
                "last_sign_in": u.last_login,
                "subscription_started_at": getattr(store, 'subscription_started_at', None),
                "subscription_expires_at": getattr(store, 'subscription_expires_at', None),
                "payment_provider": getattr(store, 'payment_provider', None),
                "payment_external_id": getattr(store, 'payment_external_id', None),
            })
        return Response(data)

class AdminUpdatePlanView(APIView):
    """Muda o plano de um usuário rapidamente (Toggle Free/Pro)."""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def patch(self, request, pk):
        try:
            store = Store.objects.get(user__id=pk)
            new_plan = request.data.get("plan")
            if new_plan in ["free", "pro"]:
                store.plan = new_plan
                store.save()
                return Response({"message": f"Plano alterado para {new_plan}", "plan": store.plan})
            return Response({"error": "Plano inválido"}, status=400)
        except Store.DoesNotExist:
            return Response({"error": "Loja não encontrada para este usuário"}, status=404)

class AdminUpdateSubscriptionView(APIView):
    """Salva os dados completos de uma assinatura (Gateway, Datas, etc)."""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def patch(self, request, pk):
        try:
            store = Store.objects.get(user__id=pk)
            data = request.data
            
            store.payment_provider = data.get("provider", store.payment_provider)
            store.payment_external_id = data.get("external_id", store.payment_external_id)
            store.subscription_started_at = data.get("started_at", store.subscription_started_at)
            store.subscription_expires_at = data.get("expires_at", store.subscription_expires_at)
            
            if data.get("plan"):
                store.plan = data.get("plan")
                
            store.save()
            return Response({"message": "Assinatura e plano atualizados com sucesso!"})
        except Store.DoesNotExist:
            return Response({"error": "Loja não encontrada para este usuário"}, status=404)
        

# inventory/views.py - ADICIONAR
class SessionControlView(APIView):
    """Controla sessão de cadastro"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Status da sessão atual"""
        store = get_current_store(request.user)
        session = RegistrationSession.objects.filter(
            store=store, is_active=True
        ).first()
        
        if not session:
            return Response({'has_session': False})
            
        return Response({
            'has_session': True,
            'session_id': session.id,
            'products_count': session.products_count,
            'total_estimated_cost': session.total_estimated_cost,
            'duration_minutes': int((timezone.now() - session.started_at).total_seconds() / 60)
        })
    
    def post(self, request):
        """Inicia ou finaliza sessão"""
        action = request.data.get('action')  # 'start' ou 'finish'
        store = get_current_store(request.user)
        
        if action == 'start':
            # Finaliza sessão anterior se existir
            RegistrationSession.objects.filter(
                store=store, is_active=True
            ).update(is_active=False, finished_at=timezone.now())
            
            # Cria nova
            session = RegistrationSession.objects.create(store=store)
            return Response({
                'session_id': session.id,
                'message': 'Sessão iniciada'
            })
            
        elif action == 'finish':
            session = RegistrationSession.objects.filter(
                store=store, is_active=True
            ).first()
            
            if not session:
                return Response({'error': 'Nenhuma sessão ativa'}, status=400)
                
            session.is_active = False
            session.finished_at = timezone.now()
            session.save()
            
            return Response({
                'session_summary': {
                    'products_count': session.products_count,
                    'total_estimated_cost': session.total_estimated_cost,
                    'session_id': session.id
                }
            })

class SessionSummaryView(APIView):
    """Confirma investimento da sessão"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        session_id = request.data.get('session_id')
        
        try:
            session = RegistrationSession.objects.get(id=session_id)
            
            # Salva dados financeiros
            session.payment_method = request.data.get('payment_method')
            session.total_paid = request.data.get('total_paid')
            session.installments = request.data.get('installments', 1)
            session.save()
            
            return Response({
                'message': 'Investimento registrado!',
                'total_paid': session.total_paid
            })
            
        except RegistrationSession.DoesNotExist:
            return Response({'error': 'Sessão não encontrada'}, status=404)
        
# inventory/views.py - ADICIONE esta nova view


from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
# inventory/views.py - SUBSTITUA a função existente por esta versão completa

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import Store, InventoryItem
from django.shortcuts import get_object_or_404

@api_view(['GET'])
@permission_classes([AllowAny])
def public_storefront_view(request, slug=None, brand=None):
    """
    Endpoint público para vitrine - não requer autenticação
    Suporta filtro por marca: /vitrine/{slug}/marca/{brand}
    """
    try:
        # ✅ CORREÇÃO: Validar e buscar a loja de forma mais segura
        if slug:
            store = get_object_or_404(Store, slug=slug)
        else:
            store_id = request.GET.get('seller')
            if not store_id:
                return Response({'error': 'Slug ou seller ID obrigatório'}, status=400)
            store = get_object_or_404(Store, id=store_id)
        
        # ✅ Filtro por marca
        brand_filter = brand or request.GET.get('brand')
        
        # ✅ Base query com relacionamentos corretos
        items_query = InventoryItem.objects.filter(
            store=store,
            total_quantity__gt=0
        ).select_related('product')
        
        # ✅ Aplicar filtro por marca se especificado
        if brand_filter:
            brand_filter = brand_filter.strip()
            items_query = items_query.filter(
                product__brand__icontains=brand_filter
            )
        
        items = items_query.order_by('product__brand', 'product__category', 'product__name')
        
        # ✅ CORREÇÃO: Coletar marcas disponíveis de forma mais segura
        available_brands_query = InventoryItem.objects.filter(
            store=store,
            total_quantity__gt=0,
            product__brand__isnull=False
        ).exclude(
            product__brand__exact=''
        ).values_list('product__brand', flat=True).distinct()
        
        available_brands = sorted(set(available_brands_query))
        
        # ✅ CORREÇÃO: Mapear dados com verificações de segurança
        items_data = []
        for item in items:
            try:
                # Verificações de segurança
                if not item.product:
                    continue
                    
                product_name = item.product.name or "Produto sem nome"
                image_url = getattr(item.product, 'image_url', None)
                
                # ✅ CORREÇÃO: Tratamento seguro de preços
                sale_price = 0
                if item.sale_price:
                    sale_price = float(item.sale_price)
                elif hasattr(item.product, 'official_price') and item.product.official_price:
                    sale_price = float(item.product.official_price)
                
                # ✅ CORREÇÃO: Verificação segura da marca
                brand_name = getattr(item.product, 'brand', None)
                category = getattr(item.product, 'category', 'Geral')
                
                # Estratégia de urgência
                stock_info = {
                    'quantity': item.total_quantity,
                    'is_urgent': item.total_quantity <= 3,
                    'display_text': 'Em estoque' if item.total_quantity > 3 else f'Restam apenas {item.total_quantity}!'
                }
                
                items_data.append({
                    'id': str(item.id),
                    'product_name': product_name,
                    'display_name': product_name,
                    'category': category,
                    'brand': brand_name,
                    'sale_price': sale_price,
                    'total_quantity': item.total_quantity,
                    'stock_info': stock_info,
                    'image_url': image_url,
                })
                
            except Exception as item_error:
                print(f"❌ Erro ao processar item {item.id}: {item_error}")
                continue
        
        # ✅ CORREÇÃO: Dados da loja com verificações seguras
        store_data = {
            'name': getattr(store, 'name', 'Consultora'),
            'whatsapp': getattr(store, 'whatsapp', ''),
            'slug': getattr(store, 'slug', slug or '')
        }
        
        # Response final
        response_data = {
            'store': store_data,
            'items': items_data,
            'brands': {
                'available': available_brands,
                'current_filter': brand_filter,
                'total_brands': len(available_brands),
                'total_products': len(items_data)
            },
            'meta': {
                'total_items': len(items_data),
                'urgent_items': len([item for item in items_data if item['stock_info']['is_urgent']]),
                'brands_count': len(available_brands)
            }
        }
        
        return Response(response_data)
        
    except Exception as e:
        print(f"❌ Erro no endpoint público: {e}")
        import traceback
        traceback.print_exc()
        return Response({'error': 'Erro interno do servidor'}, status=500)
    
class StockTransactionViewSet(viewsets.ModelViewSet):
    serializer_class = StockTransactionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    
    # ✅ Agora o campo transaction_type existirá
    filterset_fields = ['transaction_type', 'product', 'created_at']
    
    def get_queryset(self):
        store = get_current_store(self.request.user)
        return StockTransaction.objects.filter(store=store).select_related('product', 'batch')   
    
# inventory/views.py - ADICIONAR esta view

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def inventory_item_batches_view(request, item_id):
    """Lista lotes de um item específico do inventário"""
    try:
        store = get_current_store(request.user)
        
        # Buscar item do inventário
        inventory_item = InventoryItem.objects.get(
            id=item_id, 
            store=store
        )
        
        # Buscar lotes ativos ordenados por validade (FIFO)
        batches = inventory_item.batches.filter(
            quantity__gt=0
        ).order_by('expiration_date', 'id')
        
        # Serializar lotes com informações extras
        batches_data = []
        today = timezone.now().date()
        
        for batch in batches:
            # Calcular status de validade
            is_expired = False
            days_to_expire = None
            status = 'valid'
            
            if batch.expiration_date:
                is_expired = batch.expiration_date < today
                if is_expired:
                    status = 'expired'
                else:
                    days_to_expire = (batch.expiration_date - today).days
                    if days_to_expire <= 30:
                        status = 'near_expiry'
            
            batches_data.append({
                'id': batch.id,
                'batch_code': batch.batch_code or 'S/N',
                'expiration_date': batch.expiration_date,
                'quantity': batch.quantity,
                'formatted_date': batch.expiration_date.strftime('%d/%m/%Y') if batch.expiration_date else 'Sem validade',
                'is_expired': is_expired,
                'is_near_expiry': status == 'near_expiry',
                'days_to_expire': days_to_expire,
                'status': status
            })
        
        return Response({
            'item_id': inventory_item.id,
            'product_name': inventory_item.product.name,
            'total_quantity': inventory_item.total_quantity,
            'batches': batches_data,
            'batch_stats': {
                'total_batches': len(batches_data),
                'expired_batches': len([b for b in batches_data if b['is_expired']]),
                'near_expiry_batches': len([b for b in batches_data if b['status'] == 'near_expiry']),
                'valid_batches': len([b for b in batches_data if b['status'] == 'valid'])
            }
        })
        
    except InventoryItem.DoesNotExist:
        return Response({'error': 'Item não encontrado'}, status=404)
    except Exception as e:
        print(f"❌ Erro ao buscar lotes: {e}")
        return Response({'error': 'Erro interno'}, status=500)
    



    # inventory/views.py - IMPLEMENTAR FIFO AUTOMÁTICO

from django.db.models import Sum, F
from django.db import transaction
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from datetime import datetime

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def apply_fifo_withdrawal(request):
    """Aplicar baixa FIFO automática nos lotes"""
    try:
        store = get_current_store(request.user)
        data = request.data
        
        product_id = data.get('product_id')
        quantity_to_withdraw = int(data.get('quantity', 0))
        transaction_type = data.get('transaction_type', 'SAIDA')
        unit_price = data.get('unit_price', 0)
        notes = data.get('notes', '')
        
        print(f"🎯 Iniciando FIFO: {quantity_to_withdraw} unidades do produto {product_id}")
        
        # Buscar produto e item do inventário
        product = Product.objects.get(id=product_id)
        inventory_item = InventoryItem.objects.get(store=store, product=product)
        
        # ✅ CONSOLIDAR lotes com mesma validade primeiro
        inventory_item = consolidate_batches_by_expiry(inventory_item)
        
        # Buscar lotes ordenados por validade (FIFO)
        available_batches = inventory_item.batches.filter(
            quantity__gt=0
        ).order_by('expiration_date', 'id')
        
        if not available_batches.exists():
            return Response({
                'error': 'Não há lotes disponíveis para este produto'
            }, status=400)
        
        # Verificar estoque total
        total_available = sum(batch.quantity for batch in available_batches)
        if total_available < quantity_to_withdraw:
            return Response({
                'error': f'Estoque insuficiente. Disponível: {total_available}, Solicitado: {quantity_to_withdraw}'
            }, status=400)
        
        # ✅ APLICAR FIFO AUTOMÁTICO
        with transaction.atomic():
            remaining_to_withdraw = quantity_to_withdraw
            batches_used = []
            transactions_created = []
            
            for batch in available_batches:
                if remaining_to_withdraw <= 0:
                    break
                
                qty_from_batch = min(remaining_to_withdraw, batch.quantity)
                
                print(f"📦 Lote {batch.id} (Val: {batch.expiration_date}): {batch.quantity} → {batch.quantity - qty_from_batch}")
                
                # Aplicar baixa no lote
                batch.quantity -= qty_from_batch
                batch.save()
                
                # Registrar transação para este lote
                stock_transaction = StockTransaction.objects.create(
                    store=store,
                    product=product,
                    batch=batch,
                    transaction_type=transaction_type,
                    quantity=-qty_from_batch,  # Negativo para saída
                    unit_cost=inventory_item.cost_price,
                    unit_price=unit_price,
                    description=f"Saída FIFO - Lote vencimento {batch.expiration_date}",
                    notes=notes
                )
                transactions_created.append(stock_transaction)
                
                # Se lote zerou, remover
                if batch.quantity == 0:
                    print(f"🗑️ Lote {batch.id} zerado - removendo")
                    batch.delete()
                
                batches_used.append({
                    'batch_id': batch.id,
                    'quantity_used': qty_from_batch,
                    'expiration_date': batch.expiration_date,
                    'remaining_quantity': batch.quantity
                })
                
                remaining_to_withdraw -= qty_from_batch
            
            # ✅ RECALCULAR TOTAL CONSOLIDADO
            total_real = inventory_item.batches.aggregate(
                total=Sum('quantity')
            )['total'] or 0
            
            inventory_item.total_quantity = total_real
            inventory_item.save()
            
            print(f"📊 Total atualizado: {inventory_item.total_quantity}")
            
            return Response({
                'message': 'Baixa FIFO aplicada com sucesso',
                'product_name': product.name,
                'quantity_withdrawn': quantity_to_withdraw,
                'new_total_quantity': inventory_item.total_quantity,
                'batches_used': batches_used,
                'transactions_created': len(transactions_created)
            })
            
    except Exception as e:
        print(f"❌ Erro no FIFO: {e}")
        import traceback
        traceback.print_exc()
        return Response({
            'error': 'Erro interno do servidor',
            'message': str(e)
        }, status=500)

def consolidate_batches_by_expiry(inventory_item):
    """Consolida lotes com a mesma data de validade"""
    from collections import defaultdict
    
    print(f"🔄 Consolidando lotes para {inventory_item.product.name}")
    
    # Agrupar lotes por data de validade
    batches_by_date = defaultdict(list)
    
    for batch in inventory_item.batches.filter(quantity__gt=0):
        date_key = batch.expiration_date.isoformat() if batch.expiration_date else 'no_date'
        batches_by_date[date_key].append(batch)
    
    # Consolidar lotes duplicados
    consolidated_count = 0
    for date_key, batches in batches_by_date.items():
        if len(batches) > 1:
            print(f"🔄 Consolidando {len(batches)} lotes com validade {date_key}")
            
            # Manter o primeiro lote e somar as quantidades
            main_batch = batches[0]
            total_quantity = sum(batch.quantity for batch in batches)
            
            # Atualizar quantidade do lote principal
            main_batch.quantity = total_quantity
            main_batch.save()
            
            # Remover lotes duplicados
            for batch in batches[1:]:
                print(f"🗑️ Removendo lote duplicado {batch.id}")
                batch.delete()
            
            consolidated_count += 1
    
    if consolidated_count > 0:
        print(f"✅ Consolidados {consolidated_count} grupos de lotes")
        
        # Recalcular total
        total_real = inventory_item.batches.aggregate(
            total=Sum('quantity')
        )['total'] or 0
        
        inventory_item.total_quantity = total_real
        inventory_item.save()
    
    return inventory_item
