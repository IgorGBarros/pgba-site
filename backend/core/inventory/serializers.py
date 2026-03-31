from django.utils import timezone
from datetime import timedelta

from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.exceptions import AuthenticationFailed

# Importa seus modelos de negócio
from .models import CustomUser, Product, InventoryItem, InventoryBatch, Store, Sale, SaleItem, StockTransaction

# 🚀 CORREÇÃO 1: Usar o modelo de usuário ativo (CustomUser) dinamicamente
User = get_user_model()

# ==========================================
# 1. SERIALIZERS DE AUTENTICAÇÃO
# ==========================================

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Permite login com email e senha."""
    username_field = User.USERNAME_FIELD  # "email"
    
    def validate(self, attrs):
        credentials = {
            "email": attrs.get("email"),
            "password": attrs.get("password"),
        }
        user = authenticate(email=credentials["email"], password=credentials["password"])
        if not user:
            raise serializers.ValidationError("Invalid credentials.")
        
        # retoma validação padrão do JWT
        data = super().validate(attrs)
        data["email"] = user.email
        data["name"] = getattr(user, 'name', user.email)
        return data
        
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["email"] = user.email
        token["name"] = getattr(user, 'name', user.email)
        return token

class CustomUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'password']
        
    def create(self, validated_data):
        # Cria o usuário usando o método seguro do Django adaptado pro CustomUser
        user = User.objects.create_user(
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            name=validated_data.get('name', '')
        )
        return user

# ==========================================
# 2. SERIALIZERS DE PRODUTO E ESTOQUE
# ==========================================

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'bar_code', 'natura_sku', 'image_url', 
            'category','brand', 'description', 'official_price', 'min_quantity'
        ]

# inventory/serializers.py - CORRIGIR InventoryBatchSerializer

# inventory/serializers.py - ATUALIZAR InventoryBatchSerializer

class InventoryBatchSerializer(serializers.ModelSerializer):
    formatted_date = serializers.SerializerMethodField()
    is_expired = serializers.SerializerMethodField()
    is_near_expiry = serializers.SerializerMethodField()
    days_to_expire = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    
    class Meta:
        model = InventoryBatch
        fields = [
            'id', 'batch_code', 'expiration_date', 'quantity', 
            'formatted_date', 'is_expired', 'is_near_expiry', 
            'days_to_expire', 'status'
        ]
    
    def get_formatted_date(self, obj):
        if obj.expiration_date:
            return obj.expiration_date.strftime('%d/%m/%Y')
        return 'Sem validade'
    
    def get_is_expired(self, obj):
        if obj.expiration_date:
            return obj.expiration_date < timezone.now().date()
        return False
    
    def get_is_near_expiry(self, obj):
        if obj.expiration_date and not self.get_is_expired(obj):
            days_diff = (obj.expiration_date - timezone.now().date()).days
            return days_diff <= 30
        return False
    
    def get_days_to_expire(self, obj):
        if obj.expiration_date and not self.get_is_expired(obj):
            return (obj.expiration_date - timezone.now().date()).days
        return None
    
    def get_status(self, obj):
        if self.get_is_expired(obj):
            return 'expired'
        elif self.get_is_near_expiry(obj):
            return 'near_expiry'
        else:
            return 'valid'

# inventory/serializers.py - ATUALIZAR InventoryItemSerializer

# inventory/serializers.py - ATUALIZAR InventoryItemSerializer

class InventoryItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    batches = serializers.SerializerMethodField()
    batch_stats = serializers.SerializerMethodField()
    display_price = serializers.SerializerMethodField()
    
    class Meta:
        model = InventoryItem
        fields = [
            'id', 'product', 'sale_price', 'cost_price', 
            'total_quantity', 'min_quantity', 'batches', 
            'batch_stats', 'display_price'
        ]
    
    def get_batches(self, obj):
        from collections import defaultdict
        from django.utils import timezone
        
        # ✅ CORREÇÃO: Consolidar lotes por data de validade
        active_batches = obj.batches.filter(quantity__gt=0).order_by('expiration_date', 'id')
        
        # Agrupar por data de validade
        consolidated_batches = defaultdict(lambda: {
            'total_quantity': 0,
            'batch_codes': [],
            'ids': []
        })
        
        for batch in active_batches:
            # ✅ FILTRO: Remover lotes vencidos automaticamente
            if batch.expiration_date and batch.expiration_date < timezone.now().date():
                continue
                
            key = batch.expiration_date or 'no_date'
            consolidated_batches[key]['total_quantity'] += batch.quantity
            consolidated_batches[key]['batch_codes'].append(batch.batch_code or 'S/N')
            consolidated_batches[key]['ids'].append(batch.id)
        
        # Converter para lista ordenada
        result = []
        for exp_date, data in sorted(consolidated_batches.items(), 
                                   key=lambda x: x[0] if x[0] != 'no_date' else timezone.now().date() + timedelta(days=9999)):
            
            # Calcular informações de validade
            is_expired = False
            days_to_expire = None
            
            if exp_date != 'no_date':
                today = timezone.now().date()
                is_expired = exp_date < today
                if not is_expired:
                    days_to_expire = (exp_date - today).days
            
            # Consolidar códigos de lote
            unique_codes = list(set(data['batch_codes']))
            batch_code_display = unique_codes[0] if len(unique_codes) == 1 else f"{len(unique_codes)} lotes"
            
            result.append({
                'id': f"consolidated_{data['ids'][0]}",  # ID do primeiro lote para referência
                'batch_code': batch_code_display,
                'expiration_date': exp_date if exp_date != 'no_date' else None,
                'quantity': data['total_quantity'],
                'formatted_date': exp_date.strftime('%d/%m/%Y') if exp_date != 'no_date' else 'Sem validade',
                'is_expired': is_expired,
                'is_near_expiry': days_to_expire is not None and days_to_expire <= 30,
                'days_to_expire': days_to_expire,
                'status': 'expired' if is_expired else ('near_expiry' if days_to_expire is not None and days_to_expire <= 30 else 'valid'),
                'consolidated_ids': data['ids']  # IDs dos lotes que foram consolidados
            })
        
        return result


# ==========================================
# 3. SERIALIZER DE ENTRADA (SCAN)
# ==========================================

class StockEntrySerializer(serializers.Serializer):
    # 🚀 CORREÇÃO 2: Permitir null e blindar contra erros 400
    bar_code = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    quantity = serializers.IntegerField()
    cost_price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, allow_null=True)
    sale_price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, allow_null=True)
    batch_code = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    expiration_date = serializers.DateField(required=False, allow_null=True)
    
    # Campos de criação de produto
    name = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    category = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    natura_sku = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    image_url = serializers.CharField(required=False, allow_blank=True, allow_null=True)

# ==========================================
# 4. SERIALIZERS DE VENDA E TRANSAÇÕES
# ==========================================

class SaleItemInputSerializer(serializers.Serializer):
    bar_code = serializers.CharField()
    quantity = serializers.IntegerField(min_value=1)
    batch_id = serializers.IntegerField(required=False, allow_null=True) 
    price_sold = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, allow_null=True)

class SaleSerializer(serializers.Serializer):
    items = SaleItemInputSerializer(many=True)
    client_name = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    payment_method = serializers.CharField(default="DINHEIRO")
    transaction_type = serializers.CharField(default="VENDA") 
    notes = serializers.CharField(required=False, allow_blank=True, allow_null=True)

class StockTransactionSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    batch_code = serializers.CharField(source='batch.batch_code', read_only=True)
    
    class Meta:
        model = StockTransaction
        fields = [
            'id', 
            'transaction_type', 
            'quantity', 
            'unit_price', 
            'unit_cost', 
            'description', 
            'created_at', 
            'product_name', 
            'batch_code',
            'product',
            'batch'
        ]

# ==========================================
# 5. SERIALIZERS DE PERFIL / LOJA
# ==========================================

class UserNestedSerializer(serializers.ModelSerializer):
    """Dados básicos do usuário (email, nome)"""
    class Meta:
        model = CustomUser
        fields = ["id", "email", "name"]

class ProfileSerializer(serializers.ModelSerializer):
    """
    Serializador de Perfil — baseado na Store vinculada ao usuário.
    """
    user = UserNestedSerializer(read_only=True)
    
    # Aliases
    display_name = serializers.CharField(source='name', required=False, allow_blank=True, allow_null=True)
    whatsapp_number = serializers.CharField(source='whatsapp', required=False, allow_blank=True, allow_null=True)
    store_slug = serializers.CharField(source='slug', required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = Store
        fields = [
            "id", "user", "display_name", "store_slug", "whatsapp_number", 
            "storefront_enabled", "created_at", "plan"
        ]
        read_only_fields = ["id", "user", "created_at", "plan"]

    # 🚀 CORREÇÃO 3: BLINDAGEM CONTRA O ERRO 500
    # Se o frontend enviar null nessas chaves, o serializer converte para string vazia
    # protegendo o banco de dados de quebrar.
    def validate_display_name(self, value):
        return value if value is not None else ""
        
    def validate_store_slug(self, value):
        return value if value is not None else ""