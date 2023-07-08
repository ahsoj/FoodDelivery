import React, { useState } from 'react';
import { Rate, Card, Button } from 'antd';
import {
  MdFavoriteBorder,
  MdOutlineAddShoppingCart,
  MdFavorite,
  MdDone,
} from 'react-icons/md';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import {
  useCreateCartItemsMutation,
  useCreateFavoriteMutation,
} from '@sdk/redux/api/apiStore';
import { Favorite, CartItems } from '../pages/types/type';
import Image from 'next/image';
// rateData = { rate };
// rateSuccess = { isRateSuccess };

const ProductCard = ({ ...props }) => {
  const {
    products,
    favorite,
    cartItem,
    user,
    isFav,
    isCart,
    rateData,
    rateSuccess,
  } = props;
  const [loadings, setLoadings] = useState<boolean[]>([]);
  const router = useRouter();
  const [addCartitem] = useCreateCartItemsMutation();
  const [createFavorite] = useCreateFavoriteMutation();

  let favList: (string | number)[] = [];
  let cartItemList: (string | number)[] = [];

  if (isFav) {
    favorite.map((fav: Favorite) => favList.push(fav.product));
  }
  if (isCart) {
    cartItem.map((cart: CartItems) => cartItemList.push(cart.product));
  }

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
    }, 1000);
  };

  const addTocart = () => {
    const cartId = Cookies.get('cartId');
    const cartItem = {
      quantity: 1,
      cart: cartId,
      product: products?.id,
    };
    addCartitem(cartItem);
  };

  const addToFavorite = () => {
    createFavorite({
      user: user?.user_id,
      product: products?.id,
    });
  };

  return (
    <Card
      style={{ width: 240, maxHeight: 340, position: 'relative' }}
      hoverable
      cover={
        <Image
          width={240}
          height={150}
          onClick={() => router.push(`/home/${products?.id}/`)}
          style={{ objectFit: 'contain' }}
          alt={products?.menu_name}
          src={products.menu_image}
        />
      }
    >
      <div>
        <div>
          <h3 style={{ color: '#0099ff' }}>
            <code>$ {products?.price}</code>
          </h3>
          <h2>{`${products.menu_name.slice(0, 15)}...`}</h2>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>
            <Rate
              disabled
              allowHalf
              style={{ fontSize: 14 }}
              defaultValue={rateSuccess ? rateData.rate : 1.5}
            />
            <span>({rateSuccess ? rateData.length : 0})</span>
          </span>
          <Button
            type="primary"
            style={{ backgroundColor: '#00ff64' }}
            loading={loadings[Number(products.id) + 1]}
            onClick={() => {
              enterLoading(Number(products.id) + 1);
              cartItemList.includes(products.id) ? null : addTocart();
            }}
            icon={
              cartItemList.includes(products.id) ? (
                <MdDone />
              ) : (
                <MdOutlineAddShoppingCart fontSize={20} />
              )
            }
          />
        </div>
        <Button
          type="dashed"
          style={{ position: 'absolute', top: 10, left: 10 }}
          loading={loadings[Number(products.id)]}
          onClick={() => {
            enterLoading(Number(products.id));
            favList.includes(products.id) ? null : addToFavorite();
          }}
          icon={
            favList.includes(products.id) ? (
              <MdFavorite color="#ff4747" fontSize={20} />
            ) : (
              <MdFavoriteBorder color="#ff4747" fontSize={20} />
            )
          }
        />
      </div>
    </Card>
  );
};

export default ProductCard;

// actions={[
//         <Title level={4}>${products?.price}</Title>,
//         <Button
//           icon={<BiHeart />}
//           loading={loadings[1]}
//           onClick={() => enterLoading(1)}
//         />,
//         <Button
//           icon={<MdAddShoppingCart fontSize={15} />}
//           loading={loadings[2]}
//           onClick={() => enterLoading(2)}
//         />,
//       ]}
