from django.contrib import admin

from system.models import (
    Cart,
    Order,
    Payment,
    CartItem,
    Customer,
    Restaurant,
    GlobalUser,
    Transaction,
    RestaurantMenu,
    DeliveringDriver,
    PasswordResetToken,
    Favorite,
    OrderItem,
    DeliveringOrder,
)

# Register your models here.

admin.site.register(GlobalUser)
admin.site.register(PasswordResetToken)
admin.site.register(Customer)
admin.site.register(DeliveringDriver)
admin.site.register(Restaurant)
admin.site.register(RestaurantMenu)
admin.site.register(Order)
admin.site.register(OrderItem)
admin.site.register(Payment)
admin.site.register(Transaction)
admin.site.register(Cart)
admin.site.register(Favorite)
admin.site.register(CartItem)
