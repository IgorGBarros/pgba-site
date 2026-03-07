from rest_framework import serializers
from django.contrib.auth.models import User  # ✅ Usa o User padrão para evitar erros
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from rest_framework.exceptions import AuthenticationFailed

# Importa seus modelos de negócio
from .models import Product, InventoryItem, InventoryBatch, Store, Sale, SaleItem

# ==========================================
# 1. SERIALIZERS DE AUTENTICAÇÃO
# ==========================================

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Adiciona claims personalizados ao token
        token['email'] = user.email
        # Como o User padrão não tem 'name', usamos o nome completo ou username
        token['name'] = user.get_full_name() or user.username
        token['is_staff'] = user.is_staff
        
        return token

class CustomUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User  # ✅ Ajustado para User padrão
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'password']

    def create(self, validated_data):
        # Cria o usuário usando o método seguro do Django
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
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
            'category', 'description', 'official_price', 'min_quantity'
        ]

class InventoryBatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryBatch
        fields = ['id', 'batch_code', 'expiration_date', 'quantity']

class InventoryItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    batches = InventoryBatchSerializer(many=True, read_only=True)
    
    # Campo calculado (Preço da consultora ou oficial)
    display_price = serializers.SerializerMethodField()
    
    class Meta:
        model = InventoryItem
        fields = [
            'id', 'product', 'sale_price', 'cost_price', 
            'total_quantity', 'min_quantity', 'batches', 'display_price'
        ]
    
    def get_display_price(self, obj):
        # Se a consultora definiu preço, usa ele. Se não, usa o oficial do produto.
        return obj.sale_price if obj.sale_price > 0 else obj.product.official_price

# ==========================================
# 3. SERIALIZER DE ENTRADA (SCAN)
# ==========================================

class StockEntrySerializer(serializers.Serializer):
    bar_code = serializers.CharField()
    quantity = serializers.IntegerField()
    cost_price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    sale_price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    batch_code = serializers.CharField(required=False, allow_blank=True)
    expiration_date = serializers.DateField(required=False, allow_null=True)
    
    # Campos de criação de produto
    name = serializers.CharField(required=False, allow_blank=True)
    category = serializers.CharField(required=False, allow_blank=True)
    natura_sku = serializers.CharField(required=False, allow_blank=True) # <--- ADICIONAR ISTO
# ==========================================
# 4. SERIALIZERS DE VENDA (PDV)
# ==========================================

class SaleItemInputSerializer(serializers.Serializer):
    bar_code = serializers.CharField()
    quantity = serializers.IntegerField(min_value=1)
    batch_id = serializers.IntegerField(required=False) # ID do lote específico (opcional)
    price_sold = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)

class SaleSerializer(serializers.Serializer):
    items = SaleItemInputSerializer(many=True)
    client_name = serializers.CharField(required=False, allow_blank=True)
    payment_method = serializers.CharField(default="DINHEIRO")
    transaction_type = serializers.CharField(default="VENDA") # VENDA, PRESENTE, ETC
    notes = serializers.CharField(required=False, allow_blank=True)

    # Em backend/core/inventory/serializers.py

from rest_framework import serializers
from .models import StockTransaction  # Certifique-se de importar o modelo

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
            'batch_code'
        ]