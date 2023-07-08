from rest_framework import serializers
from django.core.exceptions import ObjectDoesNotExist
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.settings import api_settings
from django.contrib.auth.models import update_last_login
from system.models import (
    Customer,
    DeliveringDriver,
    GlobalUser,
    PasswordResetToken,
    Restaurant,
    RestaurantMenu,
    Order,
    Cart,
    CartItem,
    Favorite,
    Transaction,
    Payment,
    Rating,
    OrderItem,
    DeliveringOrder,
)
from api.bese64image import Base64ImageField


class GlobalUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = GlobalUser
        fields = [
            "id",
            "email",
            "password",
            "phone_number",
            "createdAt",
            "role",
            "updatedAt",
        ]
        read_only_field = ["id", "createdAt", "updatedAt", "role"]


class LoginSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        refresh = self.get_token(self.user)
        infos = GlobalUserSerializer(self.user).data

        data["uid"] = infos["id"]
        data["role"] = infos["role"]
        data["refresh"] = str(refresh)
        data["access"] = str(refresh.access_token)
        if infos["role"] == "customer":
            user = Customer.objects.get(id=infos["id"])
            cart, created = Cart.objects.get_or_create(user=user)
            if not created:
                print("not_created", cart)
            else:
                print("created", created)

        if api_settings.UPDATE_LAST_LOGIN:
            update_last_login(None, self.user)

        return data


class PasswordResetTokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = PasswordResetToken
        fields = ["id", "user", "token", "created_at"]


class CustomerAccountSerilizer(serializers.ModelSerializer):
    # profilePic = serializers.ImageField()
    # address = AddressSerializer()

    class Meta:
        model = Customer
        fields = "__all__"


class CustomerRegisterSerializer(CustomerAccountSerilizer):
    password = serializers.CharField(
        max_length=125,
        min_length=8,
        write_only=True,
        required=True,
    )

    class Meta:
        model = Customer
        fields = [
            "role",
            "email",
            "password",
            "profilePic",
            "phone_number",
        ]
        read_only_fields = ["id", "is_active", "role"]

    def create(self, validated_data):
        try:
            user = GlobalUser.objects.get(email=validated_data["email"])
        except ObjectDoesNotExist:
            validated_data["role"] = "customer"
            user = Customer.objects.create_user(**validated_data)
        return user


class DeliveryDriverAccountSerilizer(serializers.ModelSerializer):
    profilePic = serializers.ImageField(allow_empty_file=True)
    driverLicense = serializers.ImageField(allow_empty_file=True)

    class Meta:
        model = DeliveringDriver
        fields = "__all__"


class DeliveryDriverRegisterSerializer(DeliveryDriverAccountSerilizer):
    profilePic = serializers.ImageField(allow_empty_file=True)
    driverLicense = serializers.ImageField(allow_empty_file=True)
    password = serializers.CharField(
        max_length=125,
        min_length=8,
        write_only=True,
        required=True,
    )

    class Meta:
        model = DeliveringDriver
        fields = [
            "role",
            "email",
            "password",
            "profilePic",
            "phone_number",
            "driverLicense",
        ]
        read_only_fields = ["id", "is_active", "role"]

    def create(self, validated_data):
        try:
            user = GlobalUser.objects.get(email=validated_data["email"])
        except ObjectDoesNotExist:
            validated_data["role"] = "driver"
            user = DeliveringDriver.objects.create_user(**validated_data)
        return user


class RestaurantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Restaurant
        fields = [
            "email",
            "password",
            "phone_number",
            "r_name",
            "address",
            "restaurant_logo",
            "business_permit",
        ]
        read_only_fields = ["is_approved"]

    def create(self, validated_data):
        try:
            user = GlobalUser.objects.get(email=validated_data["email"])
        except ObjectDoesNotExist:
            validated_data["role"] = "merchant"
            user = Restaurant.objects.create_user(**validated_data)
        return user


class RestaurantMenuSerializer(serializers.ModelSerializer):
    menu_image = Base64ImageField(
        max_length=None,
        use_url=True,
    )

    class Meta:
        model = RestaurantMenu
        fields = "__all__"


class RatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rating
        fields = "__all__"


class CartSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cart
        fields = "__all__"
        read_only_fields = ["total"]


class CartItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = CartItem
        fields = "__all__"

    def update(self, instance, validated_data):
        quantity = validated_data.pop("quantity", None)
        if quantity is not None:
            instance.quantity = quantity
        return super().update(instance, validated_data)


class FavoeriteSerialiser(serializers.ModelSerializer):
    class Meta:
        model = Favorite
        fields = "__all__"


class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = "__all__"
        read_only_fields = ["order_code"]

    # def create(self, validated_data):
    #     driver_data = validated_data.pop("driver")
    #     order = Order.objects.create(**validated_data)
    #     driver = DeliveringDriver.objects.get(id=driver_data["id"])
    #     DeliveringOrder.objects.create(order=order, driver=driver)
    #     return order
    def create(self, validated_data):
        user = validated_data["for_customer"]
        try:
            order = Order.objects.get(for_customer=user)
        except ObjectDoesNotExist:
            order = Order.objects.create(**validated_data)
        return order


class DriverSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveringOrder
        fields = "__all__"


class OrderItemsSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = "__all__"


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = "__all__"


class PaymentSerialiser(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = "__all__"
