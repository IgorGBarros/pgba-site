from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProductViewSet, 
    InventoryViewSet, 
    lookup_product, 
    StockEntryView, 
    SaleCheckoutView,
    CustomTokenObtainPairView,
    StockTransactionViewSet,
    # FirebaseLoginView e CustomUserCreateView foram removidos daqui pois estão comentados na view
)
from rest_framework_simplejwt.views import TokenRefreshView

router = DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'inventory', InventoryViewSet, basename='inventory')
router.register(r'transactions', StockTransactionViewSet, basename='stock-transaction')

urlpatterns = [
    # --- Rotas de Negócio ---
    path('products/lookup/', lookup_product, name='product-lookup'),
    path('stock/entry/', StockEntryView.as_view(), name='stock-entry'),
    path('sales/checkout/', SaleCheckoutView.as_view(), name='sale-checkout'),
    
    # --- Rotas de Autenticação (JWT) ---
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # path('auth/firebase/', FirebaseLoginView.as_view(), name='firebase-login'),

    # --- Rotas Automáticas (Router) ---
    path('', include(router.urls)),
]