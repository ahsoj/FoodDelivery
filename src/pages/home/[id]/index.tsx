import {
  Space,
  Image,
  Typography,
  Button,
  Tooltip,
  Tag,
  Rate,
  Divider,
} from 'antd';
import { useRouter } from 'next/router';
import HomeLayout from '@layout/homeLayout';
import { MdAddShoppingCart, MdFavoriteBorder } from 'react-icons/md';
import React from 'react';
import {
  useCreateCartItemsMutation,
  useRetrieveMenuItemsQuery,
  useCreateFavoriteMutation,
  useGetMenuItemsQuery,
  useGetCartItemsQuery,
  useGetFavoriteQuery,
  useGetRatingQuery,
} from '@sdk/redux/api/apiStore';
import Cookies from 'js-cookie';
import Authentication from '@sdk/Authentication';
import { SkeletonCard } from '..';
import ProductCard from '@components/ProductCard';
import { CartItems, Favorite, Rating, RestaurantMenu } from '../../types/type';
import { skipToken } from '@reduxjs/toolkit/dist/query';

const { Title } = Typography;
const ButtonGroup = Button.Group;

function calculate_rate(rateData: Rating[]) {
  let totalLoadTime = 0;
  let totalResources = 0;
  for (var i = 0; i < rateData.length; i++) {
    totalLoadTime += Number(rateData[i].rate);
    totalResources++;
  }
  const avgRate = totalLoadTime / totalResources;
  return avgRate > 5 ? 5 : avgRate;
}

const ItemDetail: React.FC = () => {
  const router = useRouter();

  const detailId = router.query.id ? router.query.id[0] : 1;
  const { data: product, isSuccess: isGetSuccess } =
    useRetrieveMenuItemsQuery(detailId);

  const [addCartitem] = useCreateCartItemsMutation();
  const [createFavorite] = useCreateFavoriteMutation();

  const cartId = Cookies.get('cartId');
  const user = Authentication.getUser();

  const { data: rate, isSuccess: isRateSuccess } = useGetRatingQuery(
    {
      for: 'menuitems',
      id: detailId,
    } ?? skipToken
  );

  const addTocart = () => {
    const cartItem = {
      quantity: 1,
      cart: cartId,
      product: product?.id,
    };
    addCartitem(cartItem);
  };

  return (
    <>
      {isGetSuccess ? (
        <HomeLayout>
          <Space
            size={'middle'}
            style={{
              alignItems: 'start',
              justifyContent: 'center',
              width: '100%',
            }}
            wrap
          >
            <Image width={300} alt="" src={product?.menu_image} />
            <div style={{ marginLeft: '1.1em' }}>
              <Title style={{ fontWeight: 900 }} level={2}>
                {product?.menu_name}
              </Title>
              <Tag color="#87d068">{product?.category}</Tag>
              <span>
                <Rate
                  disabled
                  allowHalf
                  style={{ fontSize: 14 }}
                  defaultValue={rate ? calculate_rate(rate) : 0}
                />
                <span>({isRateSuccess ? rate?.length : 0})</span>
              </span>
              <Title level={5}>
                <b>Description:</b>
                <br />
                <p style={{ fontSize: 13, maxWidth: 300, marginLeft: 25 }}>
                  {product?.description}
                </p>
              </Title>
              <Title level={5}>
                <b>Ingredients:</b>
                <br />
                <p style={{ fontSize: 13, maxWidth: 300, marginLeft: 25 }}>
                  {product?.ingredients}
                </p>
              </Title>
              <Title style={{ fontWeight: 800 }} level={4}>
                $ {product?.price}
              </Title>
              <div
                style={{ gap: '2em', display: 'flex', alignItems: 'center' }}
              >
                <Button
                  type="primary"
                  onClick={addTocart}
                  icon={<MdAddShoppingCart />}
                >
                  Add to Cart
                </Button>
                <Tooltip title="Add to Wishlist">
                  <Button
                    onClick={() =>
                      createFavorite({
                        user: user?.user_id,
                        product: product?.id,
                      })
                    }
                    shape="default"
                    icon={<MdFavoriteBorder />}
                  />
                </Tooltip>
              </div>
            </div>
          </Space>
          <Divider />
          <RelatedProducts
            product={product}
            isRateSuccess={isRateSuccess}
            rate={rate}
          />
        </HomeLayout>
      ) : (
        <h1>Loading ...</h1>
      )}
    </>
  );
};

function range(start: number, end: number) {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

const RelatedProducts = ({ ...props }) => {
  const { product, isRateSuccess, rate } = props;

  const {
    data,
    isLoading: isGetLoading,
    isSuccess: isGetSuccess,
  } = useGetMenuItemsQuery();

  const user = Authentication.getUser();

  const cartId = Cookies.get('cartId');

  const { data: favorite, isSuccess: isFavSuccess } = useGetFavoriteQuery(
    user?.user_id ?? skipToken
  );

  const { data: cartItem, isSuccess: isCartSuccess } = useGetCartItemsQuery(
    cartId ?? skipToken
  );

  const related = data?.filter(
    (item: RestaurantMenu) => item.owner === product.owner
  );

  //owner <>
  return (
    <Space
      size={'middle'}
      style={{
        alignItems: 'start',
        justifyContent: 'center',
        width: '100%',
      }}
      wrap
    >
      {related?.map((items: RestaurantMenu, index: number) => (
        <ProductCard
          key={index}
          user={user}
          rateData={rate}
          products={items}
          favorite={favorite}
          cartItem={cartItem}
          isFav={isFavSuccess}
          isCart={isCartSuccess}
          rateSuccess={isRateSuccess}
        />
      ))}
    </Space>
  );
};

export default ItemDetail;
