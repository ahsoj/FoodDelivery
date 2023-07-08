import decimal
from django.db import models
from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
from uuid import uuid4
import random, string
from django.utils import timezone

# Create your models here.


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if email is None:
            return "User must have Email address"
        user = self.model(email=self.normalize_email(email), **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        if email is None:
            return "User must have Email address"
        user = self.create_user(email, password, **extra_fields)
        user.is_superuser = True
        user.save(using=self._db)
        return user


class GlobalUser(AbstractBaseUser, PermissionsMixin):
    objects = UserManager()
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    email = models.EmailField(
        unique=True, db_index=True, max_length=255, verbose_name="Email Address"
    )
    phone_number = models.CharField(unique=True, max_length=15, null=True, blank=True)
    # otp = models.CharField(max_length=100, null=True, blank=True)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)
    role = models.CharField(max_length=10)
    is_active = models.BooleanField(default=True)
    is_superuser = models.BooleanField(default=False)
    USERNAME_FIELD = "email"

    def __str__(self) -> str:
        return self.email.rsplit("@")[0]

    def has_perm(self, perm, obj=None):
        return True

    def has_module_perms(self, app_label):
        return True

    @property
    def is_staff(self):
        return self.is_superuser

    @property
    def is_customer(self):
        return self.role == "customer"

    @property
    def is_driver(self):
        return self.role == "driver"

    @property
    def is_merchant(self):
        return self.role == "merchant"

    class Meta:
        indexes = [
            models.Index(fields=["role", "email", "phone_number"]),
        ]


class Customer(GlobalUser):
    profilePic = models.ImageField(upload_to="profile/", null=True, blank=True)

    def create_user(self, email, password, **extra_fields):
        extra_fields.setdefault("role", "customer")
        return super().create_user(email, password, **extra_fields)


class DeliveringDriver(GlobalUser):
    profilePic = models.ImageField(upload_to="profile/", null=True, blank=True)
    driverLicense = models.ImageField(
        upload_to="dirver_license/", null=True, blank=True
    )

    def create_user(self, email, password, **extra_fields):
        extra_fields.setdefault(
            "role", "driver"
        ) if "role" not in extra_fields else extra_fields["role"]
        return super().create_user(email, password, **extra_fields)


class Restaurant(GlobalUser):
    r_name = models.CharField(max_length=128, null=True, blank=True)
    address = models.CharField(max_length=255, null=True, blank=True)
    is_approved = models.BooleanField(default=True)
    restaurant_logo = models.ImageField(
        upload_to="restaurants/logo/", null=True, blank=True
    )
    business_permit = models.ImageField(
        upload_to="restaurants/permit/", null=True, blank=True
    )

    def create_user(self, email, password, **extra_fields):
        extra_fields.setdefault(
            "role", "merchant"
        ) if "role" not in extra_fields else extra_fields["role"]
        return super().create_user(email, password, **extra_fields)

    # def __str__(self):
    #     return self.r_name


class RestaurantMenu(models.Model):
    id = models.BigAutoField(primary_key=True, unique=True)
    description = models.TextField()
    ingredients = models.TextField()
    category = models.CharField(max_length=100)
    menu_name = models.CharField(max_length=255)
    is_active = models.BooleanField(default=False)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    owner = models.ForeignKey(Restaurant, on_delete=models.CASCADE)
    menu_image = models.ImageField(upload_to="restaurants/menu/", null=True, blank=True)

    def __str__(self):
        return self.menu_name


class Cart(models.Model):
    id = models.BigAutoField(primary_key=True, unique=True)
    user = models.OneToOneField(Customer, on_delete=models.CASCADE)
    total = models.DecimalField(default=0.00, max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    ordered = models.BooleanField(default=False)

    def __str__(self):
        return self.user.email


class CartItem(models.Model):
    id = models.BigAutoField(primary_key=True, unique=True)
    quantity = models.PositiveIntegerField(default=1)
    createdAt = models.DateTimeField(auto_now_add=True)
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE)
    product = models.ForeignKey(RestaurantMenu, on_delete=models.CASCADE)


class Favorite(models.Model):
    createdAt = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(Customer, on_delete=models.CASCADE)
    product = models.ForeignKey(RestaurantMenu, on_delete=models.CASCADE)


class Order(models.Model):
    id = models.BigAutoField(primary_key=True, unique=True)
    uts = models.DateTimeField(auto_now=True)
    cts = models.DateTimeField(auto_now_add=True)
    pay_status = models.BooleanField(default=False)
    food_ready = models.BooleanField(default=True)
    for_customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    order_code = models.CharField(max_length=10, default=str(uuid4().int)[:8])

    @property
    def get_cart_total(self):
        orderItems = self.orderitem_set.all()
        total = sum([item.get_total() for item in orderItems])
        return total


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    item = models.ForeignKey(
        RestaurantMenu,
        related_name="order_items",
        on_delete=models.CASCADE,
        blank=True,
        null=True,
    )
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    order_created = models.DateTimeField(auto_now_add=True)
    # total_price = models.DecimalField(default=0.00, max_digits=20, decimal_places=2)
    # total_quantity = models.PositiveIntegerField(default=1)

    @property
    def get_total(self):
        return self.price * self.quantity

    def __str__(self):
        return self.item.menu_name


class DeliveringOrder(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    driver = models.ForeignKey(DeliveringDriver, on_delete=models.CASCADE)
    assigned_at = models.DateTimeField(auto_now_add=True)
    arrival_time = models.DateTimeField()
    status = models.CharField(max_length=20, default="pending")
    is_active = models.BooleanField(default=True)


class Payment(models.Model):
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    payment_method = models.CharField(max_length=100)
    status = models.CharField(max_length=100)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now_add=True)


class Transaction(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE)
    address = models.CharField(max_length=255, null=True, blank=True)
    city = models.CharField(max_length=255, null=True, blank=True)
    state = models.CharField(max_length=255, null=True, blank=True)
    zip_code = models.CharField(max_length=10, null=True, blank=True)
    transaction_id = models.CharField(max_length=100)
    status = models.CharField(max_length=100)
    createdAt = models.DateTimeField(auto_now_add=True)


class Address(models.Model):
    user = models.OneToOneField(Customer, unique=True, on_delete=models.CASCADE)
    address = models.CharField(max_length=255, null=True, blank=True)
    city = models.CharField(max_length=255, null=True, blank=True)
    state = models.CharField(max_length=255, null=True, blank=True)
    zip_code = models.CharField(max_length=10, null=True, blank=True)
    longitude = models.CharField(max_length=50, null=True, blank=True)
    latitude = models.CharField(max_length=50, null=True, blank=True)


class Rating(models.Model):
    rate = models.DecimalField(max_digits=3, decimal_places=1, default=0.0)
    comment = models.TextField(null=True, blank=True)
    from_customer = models.ForeignKey(
        Customer, on_delete=models.CASCADE, null=True, blank=True
    )
    to_restaurant = models.ForeignKey(
        Restaurant, on_delete=models.CASCADE, null=True, blank=True
    )
    to_menu = models.ForeignKey(
        RestaurantMenu, on_delete=models.CASCADE, null=True, blank=True
    )
    to_driver = models.ForeignKey(
        DeliveringDriver, on_delete=models.CASCADE, null=True, blank=True
    )

    def __str__(self):
        return self.rate


class PasswordResetToken(models.Model):
    token = models.CharField(max_length=50)
    created_at = models.DateTimeField(default=timezone.now)
    user = models.ForeignKey(GlobalUser, on_delete=models.CASCADE)
