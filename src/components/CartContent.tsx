import React, { useEffect, useState } from 'react';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Typography,
  Space,
  Card,
  Divider,
  Skeleton,
  Empty,
} from 'antd';
import { CartItems } from '../pages/types/type';
import Image from 'next/image';
import {
  useRetrieveMenuItemsQuery,
  useUpdateCartItemsMutation,
  useRemoveCartItemsMutation,
  useCreateOrderItemsMutation,
} from '@sdk/redux/api/apiStore';
import Authentication from '@sdk/Authentication';
import axios from 'axios';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';

const ButtonGroup = Button.Group;

const { Title } = Typography;

function CartContent({ ...props }) {
  const { cartItem } = props;
  return (
    <>
      <Space
        direction="vertical"
        size="middle"
        style={{
          display: 'flex',
          maxHeight: 650,
          overflow: 'auto',
        }}
      >
        {cartItem?.map((item: CartItems) => (
          <CartItem key={item.id} cartId={item.id} product={item} />
        ))}
      </Space>
      <div>
        <Divider orientation="center" plain>
          Checkcout
        </Divider>
        <TotalCheckoutPrice cartItem={cartItem} />
      </div>
    </>
  );
}
let totalPrice: any = [];

const CartItem = ({ ...props }) => {
  const { product, cartId } = props;
  const {
    data: menuItem,
    isLoading: isGetLoading,
    isSuccess: isGetSuccess,
  } = useRetrieveMenuItemsQuery(product.product);

  const [updateCartQty] = useUpdateCartItemsMutation();

  if (isGetSuccess) {
    console.log(menuItem?.price);
    totalPrice.push(Number(menuItem?.price));
  }

  if (isGetLoading) return <Skeleton active />;

  return (
    <>
      {menuItem ? (
        <Card>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'start',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Image
                width={75}
                height={50}
                src={menuItem.menu_image}
                alt="food"
              />
              <div>
                <Title level={5}>{`${menuItem.menu_name.slice(
                  0,
                  15
                )}...`}</Title>
                <h4 style={{ opacity: 0.7 }}>$ {menuItem?.price}</h4>
              </div>
            </div>
            <div>
              <Title level={5}>Qty</Title>
              <ButtonGroup>
                <Button
                  onClick={() => {
                    updateCartQty({
                      cartItemId: cartId,
                      quantity:
                        Number(product.quantity) > 0
                          ? Number(product.quantity) - 1
                          : 0,
                    });
                  }}
                  icon={<MinusOutlined />}
                />
                <Button>{product?.quantity}</Button>
                <Button
                  onClick={() =>
                    updateCartQty({
                      cartItemId: cartId,
                      quantity: Number(product.quantity) + 1,
                    })
                  }
                  icon={<PlusOutlined />}
                />
              </ButtonGroup>
            </div>
          </div>
        </Card>
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
    </>
  );
};

const TotalCheckoutPrice = ({ ...props }) => {
  const { cartItem } = props;
  const [disabled, setDisable] = useState<boolean>(true);
  const user = Authentication.getUser();
  const router = useRouter();

  const [createOrderItems] = useCreateOrderItemsMutation();

  useEffect(() => {
    if (cartItem && cartItem.length > 0) {
      setDisable(false);
    } else {
      setDisable(true);
    }
  }, [cartItem]);

  const handleOrderCreation = async () => {
    await axios
      .post(`http://127.0.0.1:8888/api/v1/order/`, {
        for_customer: user?.user_id,
      })
      .then((res: any) => {
        try {
          Cookies.set('order-id', res.data.id);
          createOrderItems({ cartItems: cartItem, order: res.data.id });
          router.push('/checkout');
        } catch (err) {
          console.log(err);
        }
      })
      .catch((err) => console.log(err));
  };

  return (
    <div>
      <Button
        disabled={disabled}
        onClick={handleOrderCreation}
        style={{ flexGrow: 1, width: '100%' }}
      >
        Checkout
      </Button>
    </div>
  );
};

export default CartContent;
