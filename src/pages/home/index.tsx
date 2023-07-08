import ProductCard from '@components/ProductCard';
import HomeLayout from '@layout/homeLayout';
import { skipToken } from '@reduxjs/toolkit/dist/query';
import Authentication from '@sdk/Authentication';
import {
  useGetMenuItemsQuery,
  useGetFavoriteQuery,
  useGetCartItemsQuery,
} from '@sdk/redux/api/apiStore';
import {
  Divider,
  Typography,
  Button,
  Empty,
  Skeleton,
  Card,
  Space,
} from 'antd';
import { Rating, RestaurantMenu } from '../types/type';
import Cookies from 'js-cookie';

const { Title } = Typography;
function range(start: number, end: number) {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export default function Homepage() {
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

  if (isGetLoading) {
    return (
      <HomeLayout>
        <Space size={'middle'} style={{ justifyContent: 'center' }} wrap>
          {range(0, 8).map((value) => (
            <SkeletonCard key={value} />
          ))}
        </Space>
      </HomeLayout>
    );
  }

  return (
    <div>
      <HomeLayout>
        {/* <Categories product={data} /> */}
        <Divider orientation="left" orientationMargin="0">
          <Title style={{ fontWeight: 700 }} level={3}>
            Special menu for you
          </Title>
        </Divider>
        <Space size={'middle'} style={{ justifyContent: 'center' }} wrap>
          {data?.map((items: RestaurantMenu, index: number) => (
            <ProductCard
              key={index}
              user={user}
              isCart={isCartSuccess}
              isFav={isFavSuccess}
              favorite={favorite}
              cartItem={cartItem}
              products={items}
            />
          ))}
        </Space>
      </HomeLayout>
    </div>
  );
}

export const Categories = ({ ...props }) => {
  const { product } = props;
  return (
    <>
      <Divider orientation="left" orientationMargin="0">
        <Title style={{ fontWeight: 700 }} level={3}>
          Special menu for you
        </Title>
      </Divider>
      <Space size={[8, 16]} wrap>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((_, index) => (
          <ProductCard key={index} />
        ))}
      </Space>
    </>
  );
};

// export const SpecialMenu = ({ ...props }) => {
//   const { product } = props;
//   return (
//     <>
//       <Divider orientation="left" orientationMargin="0">
//         <Title style={{ fontWeight: 700 }} level={3}>
//           Special menu for you
//         </Title>
//       </Divider>
//       <Space size={[8, 16]} wrap>
//         {product?.map((items, index: number) => (
//           <ProductCard key={index} products={items} />
//         ))}
//       </Space>
//     </>
//   );
// };

const EmptyStore: React.FC = () => (
  <div
    style={{
      height: '70vh',
      margin: 'auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <Empty
      image="/empty.svg"
      imageStyle={{ height: 60 }}
      description={
        <span style={{ fontSize: '1.1em' }}>You have any product yet</span>
      }
    >
      <Button type="primary">Create Now</Button>
    </Empty>
  </div>
);

export const SkeletonCard: React.FC = () => (
  <Card
    style={{ width: 240 }}
    cover={<Skeleton.Image style={{ width: 240, height: '200px' }} active />}
    actions={[
      <Skeleton.Button
        style={{ maxWidth: '50px' }}
        active
        size="small"
        block
        key={1}
      />,
      <Skeleton.Button
        style={{ maxWidth: '50px' }}
        active
        size="small"
        block
        key={2}
      />,
      <Skeleton.Button
        style={{ maxWidth: '50px' }}
        active
        size="small"
        block
        key={3}
      />,
    ]}
  >
    <Skeleton.Input active size="small" block />
  </Card>
);
