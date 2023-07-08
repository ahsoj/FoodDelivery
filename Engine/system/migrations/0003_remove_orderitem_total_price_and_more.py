# Generated by Django 4.2.2 on 2023-07-01 09:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("system", "0002_orderitem_total_price_orderitem_total_quantity_and_more"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="orderitem",
            name="total_price",
        ),
        migrations.RemoveField(
            model_name="orderitem",
            name="total_quantity",
        ),
        migrations.AlterField(
            model_name="order",
            name="order_code",
            field=models.CharField(default="11554090", max_length=10),
        ),
    ]
