queryset = Cart.objects.all()
    serializer_class = CartSerializer

    def create(self, request):
        product_id = request.data.get('product_id')
        quantity = request.data.get('quantity')
        cart = self.get_cart(request.user)

        # Check if a CartItem with the same product already exists in the cart
        cart_item = get_object_or_404(CartItem, cart=cart, product_id=product_id)
        if cart_item:
            # Update the quantity of the existing CartItem
            cart_item.quantity += quantity
            cart_item.save()
        else:
            # Create a new CartItem
            product = get_object_or_404(Product, pk=product_id)
            item_price = product.price
            cart_item = CartItem.objects.create(cart=cart, product=product, quantity=quantity, item_price=item_price)

        serializer = CartSerializer(cart)
        return Response(serializer.data)

    def get_cart(self, user):
        try:
            return user.cart
        except Cart.DoesNotExist:
            return Cart.objects.create(owner=user)