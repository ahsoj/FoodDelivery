from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.decorators import api_view
from api.serializers import PaymentSerialiser
from system.models import Customer, Restaurant
from system.models import Order, Payment, Transaction
import stripe, json
from api.serializers import TransactionSerializer

stripe.api_key = "sk_test_51N9kVvD2mdHSXYTgdmgJrbIYyAY8ds3RPkWiu7901I6CAxlUn2Fq78KhkmhVpGnleHKBVfmunqg86ERRiSabaXC9004zHLi0SM"


def calculate_order_amount(items):
    return 400


@api_view(["POST"])
def create_payment(request):
    print(request.data)
    try:
        test_payment_intent = stripe.PaymentIntent.create(
            amount=1400,
            currency="usd",
            receipt_email="josh@gmail.com",
            automatic_payment_methods={"enabled": True},
        )
        return Response(status=status.HTTP_200_OK, data=test_payment_intent)
    except Exception as e:
        return Response(status=status.HTTP_403_FORBIDDEN, data=str(e))


class CreatePaymentViewSet(APIView):
    def post(self, request):
        amount = request.data.get("amount")
        payment_method = request.data.get("payment_method")
        customer_id = request.data.get("customer_id")
        restaurant_id = request.data.get("restaurant_id")

        customer = Customer.objects.get(id=customer_id)
        restaurant = Restaurant.objects.get(id=restaurant_id)

        if payment_method == "card":
            token = request.data.get("token")
            charge = stripe.Charge.create(
                amount=int(amount * 100),
                currency="usd",
                source=token,
                description="Food delivery payment",
            )
            transaction_id = charge.id
        elif payment_method == "cash":
            transaction_id = "cash"

        payment = Payment.objects.create(
            amount=amount,
            payment_method=payment_method,
            transaction_id=transaction_id,
            customer=customer,
            restaurant=restaurant,
        )
        serializer = PaymentSerialiser(payment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CreateOrderView(APIView):
    def post(self, request):
        order_number = request.data.get("order_number")
        total_price = request.data.get("total_price")
        status = "pending"
        order = Order.objects.create(
            order_number=order_number, total_price=total_price, status=status
        )
        return Response(
            {"order_number": order_number, "total_price": total_price, "tatus": status},
            status=status.HTTP_201_CREATED,
        )


class CreatePaymentView(APIView):
    def post(self, request):
        amount = request.data.get("amount")
        payment_method = request.data.get("payment_method")
        status = "pending"
        payment = Payment.objects.create(
            amount=amount, payment_method=payment_method, status=status
        )
        return Response(
            {"amount": amount, "payment_method": payment_method, "tatus": status},
            status=status.HTTP_201_CREATED,
        )


class CreateTransactionView(APIView):
    def post(self, request):
        order_number = request.data.get("order_number")
        payment_id = request.data.get("payment_id")
        order = Order.objects.get(order_number=order_number)
        payment = Payment.objects.get(id=payment_id)
        transaction_id = "txn_" + order_number
        status = "pending"
        transaction = Transaction.objects.create(
            order=order, payment=payment, transaction_id=transaction_id, status=status
        )
        return Response(
            {
                "order_number": order_number,
                "payment_id": payment_id,
                "transaction_id": transaction_id,
                "tatus": status,
            },
            status=status.HTTP_201_CREATED,
        )


class ReceivePaymentView(APIView):
    def post(self, request):
        payment_id = request.data.get("payment_id")
        payment = Payment.objects.get(id=payment_id)
        amount = request.data.get("amount")
        payment_method = request.data.get("payment_method")
        status = "completed"
        payment.status = status
        payment.save()
        transaction = Transaction.objects.get(payment=payment)
        transaction.status = status
        transaction.save()
        return Response(
            {
                "payment_id": payment_id,
                "amount": amount,
                "payment_method": payment_method,
                "tatus": status,
            },
            status=status.HTTP_200_OK,
        )
