from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CustomUserCreateView,
    FirebaseLoginView,
    ProductViewSet, 
    InventoryViewSet,
    SessionControlView,
    SessionSummaryView,
    feature_gates_view, 
    lookup_product, 
    StockEntryView, 
    SaleCheckoutView,
    CustomTokenObtainPairView,
    StockTransactionViewSet,
    profile_view,
    AdminUserListView,
    AdminUpdatePlanView,
    AdminUpdateSubscriptionView,
    public_storefront
    # FirebaseLoginView e CustomUserCreateView foram removidos daqui pois estão comentados na view
)
from rest_framework_simplejwt.views import TokenRefreshView

router = DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'inventory', InventoryViewSet, basename='inventory')
router.register(r'transactions', StockTransactionViewSet, basename='stock-transaction')


urlpatterns = [
    # --- Rotas de Negócio ---
    path('admin/feature-gates/', feature_gates_view),
    path("profile/", profile_view, name="profile"),
    path('products/lookup/', lookup_product, name='product-lookup'),
    path('stock/entry/', StockEntryView.as_view(), name='stock-entry'),
    path('sales/checkout/', SaleCheckoutView.as_view(), name='sale-checkout'),
    
    # --- Rotas de Autenticação (JWT) ---
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/register/', CustomUserCreateView.as_view(), name='register'), 
    path('auth/firebase/', FirebaseLoginView.as_view(), name='firebase_login'),

    path('admin/users/', AdminUserListView.as_view(), name='admin-users-list'),
    path('admin/users/<int:pk>/plan/', AdminUpdatePlanView.as_view(), name='admin-update-plan'),
    path('admin/users/<int:pk>/subscription/', AdminUpdateSubscriptionView.as_view(), name='admin-update-sub'),

    path('session-control/', SessionControlView.as_view(), name='session-control'),
    path('session-summary/', SessionSummaryView.as_view(), name='session-summary'),

    path('public/storefront/<str:slug>/', public_storefront, name='public_storefront'),
    path('public/storefront/', public_storefront, name='public_storefront_by_id'),

    # --- Rotas Automáticas (Router) ---
    path('', include(router.urls)),
]