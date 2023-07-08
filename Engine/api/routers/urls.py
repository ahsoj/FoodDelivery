from django.urls import path, re_path
from rest_framework.routers import DefaultRouter
from api.views import (
    CartViewset,
    OrderViewset,
    LoginViewSet,
    RegisterView,
    RatingViewSet,
    RefreshViewSet,
    PaymentViewset,
    FavoriteViewset,
    CartItemViewset,
    RestaurantViewset,
    CustomMenuViewset,
    TransactionViewset,
    RestaurantMenuViewset,
    DriversRegisterViewSet,
    DriversAccountViewSets,
    CustomerRegisterViewSet,
    CustomerAccountViewSets,
    OrderItemViewSet,
    AssignOrderToDriverView,
)

from system.transaction import (
    create_payment,
    CreatePaymentViewSet,
    # CreateOrderView,
    # CreatePaymentView,
    # CreateTransactionView,
    # ReceivePaymentView,
)

from api.documents import SearchEngine

router = DefaultRouter()

router.register(r"auth/login/user", LoginViewSet, basename="login_user")
router.register(
    r"auth/register/customer", CustomerRegisterViewSet, basename="register_user"
)
router.register(
    r"auth/register/drivers", DriversRegisterViewSet, basename="register_drivers"
)
router.register(r"auth/refresh/user", RefreshViewSet, basename="refresh")

router.register(
    r"customer_account", CustomerAccountViewSets, basename="customer_account"
)
router.register(r"driver_account", DriversAccountViewSets, basename="driver_account")
router.register(r"restaurant", RestaurantViewset, basename="restaurant")

router.register(r"restaurantmenu", RestaurantMenuViewset, basename="menu")
router.register(r"restaurantmenu-change", CustomMenuViewset, basename="change-menu")

router.register(r"order", OrderViewset, basename="order")
router.register(r"orderitem", OrderItemViewSet, basename="orderitems")
router.register(r"payment", PaymentViewset, basename="payment")
router.register(r"transaction", TransactionViewset, basename="transaction")

router.register(r"cart", CartViewset, basename="cart")
router.register(r"cartitems", CartItemViewset, basename="cartitems")
router.register(r"favorite", FavoriteViewset, basename="favorite")
router.register(r"rating", RatingViewSet, basename="rating")

# path("orders/", CreateOrderView.as_view(), name="orders"),
# path("payments/", CreatePaymentView.as_view(), name="payments"),
# path("transactions/", CreateTransactionView.as_view(), name="transaction"),
# path("payments/receive/", ReceivePaymentView.as_view(), "payment-recieve"),

urlpatterns = [
    path("validate_credentials/", RegisterView.as_view(), name="validate"),
    path("create-payment-intent/", create_payment, name="create-payment"),
    path("search/menuitems/", SearchEngine.as_view(), name="search"),
    *router.urls,
]
