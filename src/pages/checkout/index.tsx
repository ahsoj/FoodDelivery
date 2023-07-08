import HomeLayout from '@layout/homeLayout';
import { skipToken } from '@reduxjs/toolkit/dist/query';
import {
  useGetOrderItemsQuery,
  useGetOrdersQuery,
  useRemoveOrderItemsMutation,
  useRetrieveMenuItemsQuery,
} from '@sdk/redux/api/apiStore';
import { Elements } from '@stripe/react-stripe-js';
import { StripePaymentElementOptions, loadStripe } from '@stripe/stripe-js';
import { PaymentElement, AddressElement } from '@stripe/react-stripe-js';
import { useEffect, useState } from 'react';
import { Button, Card, Typography, Form, Row, Col, Divider } from 'antd';
import axios from 'axios';
import Cookies from 'js-cookie';
import Image from 'next/image';
import Link from 'next/link';
import { OrderItem } from '../types/type';
import { MdOutlineKeyboardBackspace } from 'react-icons/md';
import ISOConvertor from '../../utils/iso_convertor';

const { Title } = Typography;

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(
  'pk_test_51N9kVvD2mdHSXYTgRYYJ9Jnr3gYE49iet5FU3PDQMJ9I2n1lA0mk3DfBwB3xGLdDKByUQPlfYg8Vv37TdeXLnCqS00bZkfCsqp'
);

const CheckoutForm = ({ ...props }) => {
  const { t_price, t_qty } = props;
  const [complete, setComplete] = useState<boolean>(true);
  const order_id = Cookies.get('order-id');
  const addressFillChange = (event: any) => {
    if (event.complete) {
      setComplete(false);
      const address = event.value.address;
    }
    setComplete(true);
  };

  const { data: order } = useGetOrdersQuery(order_id ?? skipToken);

  const handleCheckoutFinished = (values: any) => {
    console.log(values);
  };

  return (
    <Form onFinish={handleCheckoutFinished}>
      <h3 style={{ color: '#ff4747', textAlign: 'right' }}>
        <sup>!!! Dont put your real information.</sup>
      </h3>
      <PaymentElement id="payment-element" options={paymentElementOptions} />
      <AddressElement
        onChange={addressFillChange}
        options={{ mode: 'shipping' }}
      />
      <div style={{ marginBlock: '1em' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Title level={5}>Order Code:</Title>
          <code style={{ fontSize: 20 }}>{order?.order_code}</code>
        </div>
        <Divider />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Title level={5}>Total Qty:</Title>
          <code style={{ fontSize: 20 }}>{t_qty || 0}</code>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Title level={5}>Total Price:</Title>
          <code style={{ fontSize: 20 }}>${t_price || 0.0}</code>
        </div>
      </div>
      <Button
        type="primary"
        disabled={complete}
        style={{ width: '100%', marginBlock: '2em' }}
        block
      >
        Pay now<b> $ {t_price || 0.0}</b>
      </Button>
    </Form>
  );
};

console.log('mom');

const PayForm = ({ ...props }) => {
  const { items } = props;
  const [clientSecret, setClientSecret] = useState('');

  let t_price = 0;
  let t_qty = 0;
  items?.map((data: OrderItem) => {
    t_price += Number(data.price);
    t_qty += Number(data.quantity);
  });
  useEffect(() => {
    axios
      .post(
        'http://127.0.0.1:8888/api/v1/create-payment-intent/',
        {
          body: JSON.stringify({
            name: 'food delivery service',
            description: 'some description',
            currency: 'usd',
            amount: t_price,
            token: '',
          }),
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      .then((res: any) => {
        setClientSecret(res.data.client_secret);
      })
      .catch((err) => console.log(err));
  }, [t_price]);

  const options = {
    clientSecret,
  };

  return (
    <>
      {clientSecret && (
        <Card>
          <Elements stripe={stripePromise} options={options}>
            <CheckoutForm t_price={t_price} t_qty={t_qty} />
          </Elements>
        </Card>
      )}
    </>
  );
};

const paymentElementOptions: StripePaymentElementOptions = {
  layout: 'tabs',
};

export const CheckoutItems = ({ ...props }) => {
  const { product } = props;
  const [loadings, setLoadings] = useState<boolean[]>([]);

  const { data: items } = useRetrieveMenuItemsQuery(product?.item ?? skipToken);

  const [removeOrderItem] = useRemoveOrderItemsMutation();

  const enterLoading = (index: number) => {
    setLoadings((prevLoadings) => {
      const newLoadings = [...prevLoadings];
      newLoadings[index] = true;
      return newLoadings;
    });

    setTimeout(() => {
      setLoadings((prevLoadings) => {
        const newLoadings = [...prevLoadings];
        newLoadings[index] = false;
        return newLoadings;
      });
    }, 6000);
  };

  return (
    <>
      <Card style={{ margin: '10px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1em' }}>
            {items && (
              <Image width={50} height={50} src={items.menu_image} alt="" />
            )}
            <div>
              <Title level={4}>
                {items?.menu_name}{' '}
                <sup style={{ fontSize: 12 }}>
                  <code>{ISOConvertor(product.order_created)}</code>
                </sup>
              </Title>
              <span>
                <code style={{ fontSize: '1.2em' }}>
                  T_price: ${product?.price}
                </code>
                <code> . </code>
                <code style={{ fontSize: '1.2em' }}>
                  S_price: ${items?.price}
                </code>
                <code> . </code>
                <code style={{ fontSize: '1.2em' }}>
                  qty: {product?.quantity}
                </code>
              </span>
            </div>
          </div>
          <div>
            <Button
              danger
              type="dashed"
              loading={loadings[product?.id]}
              onClick={() => {
                enterLoading(product?.id);
                removeOrderItem(product?.id);
              }}
            >
              Remove
            </Button>
          </div>
        </div>
      </Card>
    </>
  );
};

export default function Checkout() {
  const order_id = Cookies.get('order-id');
  const { data: orderItems } = useGetOrderItemsQuery(order_id ?? skipToken);

  return (
    <>
      <HomeLayout>
        <Link href="/home">
          <Button
            icon={<MdOutlineKeyboardBackspace fontSize={20} />}
            type="dashed"
          >
            Continue Shopping
          </Button>
        </Link>
        <Row gutter={[16, 16]}>
          <Col flex="1 1 600px">
            {orderItems?.map((data, index) => (
              <CheckoutItems key={index} product={data} />
            ))}
          </Col>
          <Col flex="1 1 400px">
            <PayForm items={orderItems} />
          </Col>
        </Row>
      </HomeLayout>
    </>
  );
}
