from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

from django.db import models
from django.contrib.auth.models import (
    AbstractBaseUser, BaseUserManager, PermissionsMixin, Permission
)
from django.utils import timezone
from django.conf import settings

# ==========================================
# 1. CAMADA PÚBLICA (CATÁLOGO GLOBAL)
# ==========================================
# Alimentada pelos Robôs. Todas as consultoras "leem" daqui.

class Product(models.Model):
    name = models.CharField(max_length=255, verbose_name="Nome do Produto")
    
    # Identificadores
    bar_code = models.CharField(max_length=50, unique=True, null=True, blank=True, verbose_name="Código de Barras")
    natura_sku = models.CharField(max_length=50, unique=True, null=True, blank=True, verbose_name="SKU Natura")
    
    # Detalhes
    category = models.CharField(max_length=100, default="Geral")
    description = models.TextField(null=True, blank=True)
    image_url = models.URLField(max_length=500, null=True, blank=True)
    min_quantity = models.PositiveIntegerField(default=5)
    # Preço Oficial (Referência)
    official_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, verbose_name="Preço Site")
    
    # Controle do Robô
    last_checked_price = models.DecimalField(max_digits=10, decimal_places=2, null=True) # Preço na última checagem
    last_checked_at = models.DateTimeField(null=True, blank=True, verbose_name="Última Checagem de Preço")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class PriceHistory(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="price_history")
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Preço Coletado")
    captured_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.product.name}: R$ {self.price} em {self.captured_at.strftime('%d/%m/%Y')}"

class CrawlerLog(models.Model):
    sku = models.CharField(max_length=50, db_index=True)
    status_code = models.IntegerField(null=True, blank=True)
    error_message = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    retry_count = models.IntegerField(default=0)

    def __str__(self):
        return f"Erro SKU {self.sku}: {self.error_message}"


# ==========================================
# 2. CAMADA PRIVADA (DADOS DA CONSULTORA)
# ==========================================

class Store(models.Model):
    """
    Representa o negócio da Consultora.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="store")
    name = models.CharField(max_length=100, default="Minha Loja Natura")
    slug = models.SlugField(unique=True, blank=True) # Para a Vitrine Digital (ex: app.com/maria)
    whatsapp = models.CharField(max_length=20, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Loja de {self.user.username}"

class InventoryItem(models.Model):
    """
    O vínculo entre a Loja e o Produto Global.
    Define o preço que ELA cobra e o resumo do estoque DELA.
    """
    store = models.ForeignKey(Store, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.PROTECT) # Se deletar prod global, não quebra estoque
    
    # Preços personalizados da consultora
    cost_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, verbose_name="Custo Médio")
    sale_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, verbose_name="Preço Venda")
    
    # Estoque consolidado (Soma dos lotes)
    total_quantity = models.IntegerField(default=0)
    min_quantity = models.IntegerField(default=5)
    
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('store', 'product') # Evita duplicidade do mesmo produto na loja

    def __str__(self):
        return f"{self.product.name} ({self.total_quantity})"

class InventoryBatch(models.Model):
    """
    Lotes físicos (Validade e Quantidade específica).
    """
    item = models.ForeignKey(InventoryItem, on_delete=models.CASCADE, related_name="batches")
    quantity = models.IntegerField()
    batch_code = models.CharField(max_length=50, blank=True, null=True, verbose_name="Lote")
    expiration_date = models.DateField(null=True, blank=True, verbose_name="Validade")
    entry_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Lote {self.batch_code} - Val: {self.expiration_date}"


# ==========================================
# 3. CAMADA DE SAÍDA (VENDAS E BAIXAS)
# ==========================================

class Sale(models.Model):
    SALE_TYPES = [
        ('VENDA', 'Venda'),
        ('PRESENTE', 'Presente Pessoal'),
        ('BRINDE', 'Brinde Cliente'),
        ('PERDA', 'Perda/Avaria'),
        ('USO_PROPRIO', 'Uso Próprio')
    ]

    store = models.ForeignKey(Store, on_delete=models.CASCADE, related_name="sales")
    transaction_type = models.CharField(max_length=20, choices=SALE_TYPES, default='VENDA')
    
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    client_name = models.CharField(max_length=100, blank=True, null=True)
    payment_method = models.CharField(max_length=50, default="DINHEIRO", blank=True)
    
    notes = models.TextField(blank=True, null=True, verbose_name="Observações")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"#{self.id} - {self.transaction_type} - R$ {self.total_amount}"

class SaleItem(models.Model):
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    batch = models.ForeignKey(InventoryBatch, on_delete=models.SET_NULL, null=True, blank=True)
    
    quantity = models.IntegerField()
    unit_price_sold = models.DecimalField(max_digits=10, decimal_places=2) # Preço no momento da venda
    unit_cost_at_time = models.DecimalField(max_digits=10, decimal_places=2, default=0) # Para relatório de lucro



class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("O usuário deve ter um email")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if not extra_fields.get('is_staff'):
            raise ValueError("Superuser deve ter is_staff=True.")
        if not extra_fields.get('is_superuser'):
            raise ValueError("Superuser deve ter is_superuser=True.")

        return self.create_user(email, password, **extra_fields)

    def create_user_with_firebase(self, firebase_token, **extra_fields):
        try:
            from firebase_admin import auth as firebase_auth
            decoded_token = firebase_auth.verify_id_token(firebase_token)
            email = decoded_token.get('email')
            if not email:
                raise ValueError("Token do Firebase não contém email.")

            uid = decoded_token.get('uid')
            name = extra_fields.get('name') or uid

            user, created = self.get_or_create(
                email=email,
                defaults={'name': name, **extra_fields}
            )

            if created:
                user.set_unusable_password()
                user.save(using=self._db)

            return user

        except Exception as e:
            raise ValueError(f"Erro ao criar usuário com Firebase: {str(e)}")