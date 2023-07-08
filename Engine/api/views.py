from django.http import Http404
from django.shortcuts import get_object_or_404, render
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status, views, permissions, viewsets, generics
from rest_framework.permissions import AllowAny
from rest_framework.decorators import action
from rest_framework.viewsets import ModelViewSet, ViewSet
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.utils.crypto import get_random_string
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth import login
from rest_framework_simplejwt.settings import api_settings
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from django.conf import settings
from django.urls import reverse
from django.core.mail import send_mail
from rest_framework.response import Response
import stripe

# from django.contrib.gis.geoip2 import GeoIP2
# from django.contrib.gis.geos import Point
from system.models import (
    GlobalUser,
    PasswordResetToken,
    Customer,
    DeliveringDriver,
    Restaurant,
    RestaurantMenu,
    Order,
    Cart,
    CartItem,
    Favorite,
    Transaction,
    Payment,
    Rating,
    DeliveringOrder,
    OrderItem,
)

from api.serializers import (
    CustomerAccountSerilizer,
    CustomerRegisterSerializer,
    DeliveryDriverRegisterSerializer,
    DeliveryDriverAccountSerilizer,
    RestaurantSerializer,
    LoginSerializer,
    CartSerializer,
    OrderSerializer,
    CartItemSerializer,
    RestaurantMenuSerializer,
    FavoeriteSerialiser,
    TransactionSerializer,
    PaymentSerialiser,
    RatingSerializer,
    DriverSerializer,
    OrderItemsSerializer,
)

# Create your views here.
from twilio.rest import Client

stripe.api_key = settings.STRIPE["SECRET_KEY"]

# class MessageHandler:
#     phone_number = None
#     otp = None

#     def __init__(self, phone_number, otp) -> None:
#         self.phone_number = phone_number
#         self.otp = otp

#     def send_otp_via_message(self):
#         client = Client(settings.TWILIO_SECRET, settings.TWILIO_TOKEN)
#         message = client.messages.create(
#             body=f"your verification code is {self.otp}",
#             from_=f"{settings.TWILIO_PHONE_NUMBER}",
#             to=f"{self.phone_number}",
#         )


class RegisterView(views.APIView):
    def post(self, request):
        email = request.data.get("email")
        phone_number = request.data.get("phone_number")
        if (
            GlobalUser.objects.filter(email=email).exists()
            or GlobalUser.objects.filter(phone_number=phone_number).exists()
        ):
            return Response({"email_exists": True, "phone_number_exists": True})
        else:
            return Response({"email_exists": False, "phone_number_exists": False})


class LoginViewSet(ModelViewSet, TokenObtainPairView):
    serializer_class = LoginSerializer
    permission_classes = (AllowAny,)
    http_method_names = ["post"]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])
        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class CustomerAccountViewSets(viewsets.ModelViewSet):
    serializer_class = CustomerAccountSerilizer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    def get_queryset(self):
        uid = self.request.query_params.get("uid")
        if self.request.user.is_superuser:
            return Customer.objects.all()
        elif uid is not None:
            return DeliveringDriver.objects.filter(id=uid)


class CustomerRegisterViewSet(ModelViewSet, TokenObtainPairView):
    serializer_class = CustomerRegisterSerializer
    permission_classes = (AllowAny,)
    http_method_names = ["post"]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        res = {"refresh": str(refresh), "access": str(refresh.access_token)}

        return Response(
            {
                "user": serializer.data,
                "refresh": res["refresh"],
                "token": res["access"],
            },
            status=status.HTTP_201_CREATED,
        )


class DriversAccountViewSets(viewsets.ModelViewSet):
    serializer_class = DeliveryDriverAccountSerilizer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    def get_queryset(self):
        uid = self.request.query_params.get("uid")
        if self.request.user.is_superuser:
            return DeliveringDriver.objects.all()
        elif uid is not None:
            return DeliveringDriver.objects.filter(id=uid)


class DriversRegisterViewSet(ModelViewSet, TokenObtainPairView):
    serializer_class = DeliveryDriverRegisterSerializer
    permission_classes = (AllowAny,)
    http_method_names = ["post"]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        res = {"refresh": str(refresh), "access": str(refresh.access_token)}

        return Response(
            {
                "user": serializer.data,
                "refresh": res["refresh"],
                "token": res["access"],
            },
            status=status.HTTP_201_CREATED,
        )


class RefreshViewSet(ViewSet, TokenRefreshView):
    permission_classes = (AllowAny,)
    http_method_names = ["post"]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])

        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class CreatePasswordResetTokenView(views.APIView):
    def post(self, request):
        email = request.data.get("email")
        user = GlobalUser.objects.get(email=email)
        token = get_random_string(length=50)
        PasswordResetToken.objects.create(user=user, token=token)
        reset_url = settings.FRONTEND_URL + reverse(
            "password_reset_confirm", args=[token]
        )
        subject = "Password Reset"
        message = f"Please click the following link to reset your password: {reset_url}"
        from_email = settings.DEFAULT_FROM_EMAIL
        recipient_list = [email]
        send_mail(subject, message, from_email, recipient_list)
        return Response({"success": "Password reset token created and email sent"})


class RestaurantViewset(ModelViewSet):
    serializer_class = RestaurantSerializer

    def get_queryset(self):
        queryset = Restaurant.objects.all()
        owner_rid = self.request.query_params.get("owner_rid")
        if self.request.user.is_superuser:
            return queryset
        elif owner_rid is not None:
            return queryset.filter(owner__id=owner_rid)


class RestaurantMenuViewset(ModelViewSet):
    serializer_class = RestaurantMenuSerializer

    def get_queryset(self):
        queryset = RestaurantMenu.objects.all()
        pk = self.kwargs.get("pk")
        rid = self.request.query_params.get("rid")
        if rid is not None:
            return queryset.filter(owner=rid)
        elif pk is not None:
            return queryset.filter(id=pk)
        return queryset


class CustomMenuViewset(ModelViewSet):
    queryset = RestaurantMenu.objects.all()
    serializer_class = RestaurantMenuSerializer

    def perform_update(self, serializer):
        return super().perform_update(serializer)

    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)

    def perform_destroy(self, instance):
        return super().perform_destroy(instance)


class CartViewset(ModelViewSet):
    serializer_class = CartSerializer

    def get_queryset(self):
        queryset = Cart.objects.all()
        pk = self.kwargs.get("pk")
        user = self.request.query_params.get("foruser")
        if user is not None:
            return queryset.filter(user=user)
        if pk is not None:
            return queryset.filter(id=pk)
        return queryset

    def perform_destroy(self, instance):
        if instance.ordered:
            instance.delete()
        return super().perform_destroy(instance)


class CartItemViewset(ModelViewSet):
    serializer_class = CartItemSerializer

    def get_queryset(self):
        queryset = CartItem.objects.all()
        cartId = self.request.query_params.get("for")
        if cartId is not None:
            return queryset.filter(cart=cartId)
        return queryset

    def perform_create(self, serializer):
        cart_id = self.request.data.get("cart")
        product_id = self.request.data.get("product")
        quantity = self.request.data.get("quantity", 1)
        cart = Cart.objects.get(id=cart_id)
        print(cart)
        product = RestaurantMenu.objects.get(id=product_id)
        cart_item = CartItem.objects.filter(cart=cart, product=product)
        if cart_item:
            for item in cart_item:
                item.quantity += int(quantity)
                item.save()
            total_price = 0
            for item in cart.cartitem_set.all():
                total_price += item.product.price * item.quantity
            cart.total = total_price
            cart.save()
        else:
            serializer.save(cart=cart)

    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)

    def perform_destroy(self, instance):
        return super().perform_destroy(instance)


class FavoriteViewset(viewsets.ModelViewSet):
    serializer_class = FavoeriteSerialiser

    def get_queryset(self):
        queryset = Favorite.objects.all()
        pk = self.kwargs.get("pk")
        userId = self.request.query_params.get("foruser")
        if userId is not None:
            return queryset.filter(user=userId)
        if pk is not None:
            return queryset.filter(id=pk)
        return queryset

    def perform_destroy(self, instance):
        return super().perform_destroy(instance)


class RatingViewSet(viewsets.ModelViewSet):
    serializer_class = RatingSerializer

    def get_queryset(self):
        queryset = Rating.objects.all()
        pk = self.kwargs.get("pk")
        _for = self.request.query_params.get("for")
        rating_id = self.request.query_params.get("id")
        print(_for, rating_id)
        if _for is not None:
            if _for == "restaurants":
                return queryset.filter(to_restaurant=rating_id)
            elif _for is not None and _for == "menuitems":
                return queryset.filter(to_menu=rating_id)
            elif _for is not None and _for == "drivers":
                return queryset.filter(to_driver=rating_id)
        if pk is not None:
            return queryset.filter(id=pk)
        return queryset

    def perform_destroy(self, instance):
        return super().perform_destroy(instance)


class OrderViewset(ModelViewSet):
    serializer_class = OrderSerializer

    def get_queryset(self):
        queryset = Order.objects.all()
        pk = self.kwargs.get("pk")
        if pk is not None:
            return queryset.filter(id=pk)
        return queryset

    # def post(self, request, cart_id):
    #     cartitem = CartItem.objects.get(id=cart_id)
    #     if cartitem.items.count() === 0:
    #         return Response({"error": "Cart is empty"}, status=status.HTTP_404_NOT_FOUND)
    #     order = Order.objects.create(for_customer=request.POST.get('customer'))
    #     for item in cartitem.items

    # def perform_create(self, serializer):
    #     serializer.save(pay_status=True)
    #     order = serializer.instance
    #     driver = order.driver
    #     order.pay_status = True
    #     order.save()
    #     driver.orders.add(order)
    # return super().perform_create(serializer)


# {'quantity': 3, 'price': '249.99', 'order': 2, 'item': 1}


class OrderItemViewSet(ModelViewSet):
    serializer_class = OrderItemsSerializer

    def get_queryset(self):
        queryset = OrderItem.objects.all().order_by("-order_created")
        order_id = self.request.query_params.get("order-id")
        if order_id is not None:
            queryset = OrderItem.objects.filter(order=order_id)
        return queryset

    def create(self, request, *args, **kwargs):
        item = request.data
        request.session["order-id"] = item["order"]
        orderID = Order.objects.get(id=item["order"])
        for order in item["cartItems"]:
            menuitem = RestaurantMenu.objects.get(id=order["product"])
            _, created = OrderItem.objects.get_or_create(
                quantity=order["quantity"],
                price=(int(menuitem.price) * int(order["quantity"])),
                order=orderID,
                item=menuitem,
            )
            if created:
                cartItem = CartItem.objects.get(id=order["id"])
                cartItem.delete()
        return Response(data={"success": True}, status=status.HTTP_201_CREATED)


class PaymentViewset(viewsets.ModelViewSet):
    serializer_class = PaymentSerialiser

    def get_queryset(self):
        queryset = Payment.objects.all()
        pk = self.kwargs.get("pk")
        if pk is not None:
            return queryset.filter(id=pk)
        return queryset


class TransactionViewset(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer

    def get_queryset(self):
        queryset = Transaction.objects.all()
        pk = self.kwargs.get("pk")
        if pk is not None:
            return queryset.filter(id=pk)
        return queryset


class AssignOrderToDriverView(generics.UpdateAPIView):
    serializer_class = OrderSerializer
    queryset = Order.objects.all()

    def update(self, request, *args, **kwargs):
        order = self.get_object()
        driver = request.data.get("driver")
        if driver:
            driver_order = DeliveringOrder.objects.create(order=order, driver=driver)
            order.pay_status = True
            order.save()
            driver_order.save()
            return Response({"message": "Order assigned to driver"})
        else:
            return Response({"message": "Driver not specified"})


class PasswordResetView(views.APIView):
    def post(self, request):
        token = request.data.get("token")
        uidb64 = request.data.get("uidb64")
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = GlobalUser.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, GlobalUser.DoesNotExist):
            user = None
        if user is not None and default_token_generator.check_token(user, token):
            new_password = request.data.get("new_password")
            user.set_password(new_password)
            user.save()
            login(request, user)
            jwt_payload_handler = api_settings.JWT_PAYLOAD_HANDLER
            # jwt_encode


# class GetNearestDriverView(generics.ListAPIView):
#     serializer_class = DriverSerializer

#     def get_queryset(self):
#         customer_lat = self.request.query_params.get("customer_lat")
#         customer_lon = self.request.query_params.get("customer_lon")
#         restaurant_lat = self.request.query_params.get("restaurant_lat")
#         restaurant_lon = self.request.query_params.get("restaurant_lon")

#         if (
#             not customer_lat
#             or not customer_lon
#             or not restaurant_lat
#             or not restaurant_lon
#         ):
#             return Driver.objects.none()

#         customer_point = Point(float(customer_lon), float(customer_lat), srid=4326)
#         restaurant_point = Point(
#             float(restaurant_lon), float(restaurant_lat), srid=4326
#         )

#         drivers = Del.objects.annotate(
#             distance=Distance("location", customer_point)
#         ).order_by("distance")

#         return drivers
