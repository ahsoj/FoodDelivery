import { Skeleton, Card, Space, Tooltip, Typography, Empty } from 'antd';
import { Favorite, RestaurantMenu } from '../pages/types/type';
import {
  useCreateCartItemsMutation,
  useRemoveFavoriteMutation,
  useRetrieveMenuItemsQuery,
} from '@sdk/redux/api/apiStore';
import { MdDelete, MdAddShoppingCart } from 'react-icons/md';
import Cookies from 'js-cookie';
import Image from 'next/image';

const { Title } = Typography;

export default function FavoriteContent({ ...props }) {
  const { favorites } = props;
  const [removeFavorite] = useRemoveFavoriteMutation();

  const deleteFav = (id: string | number) => {
    const favItem = favorites.find((item: any) => item.product === id);
    removeFavorite(favItem.id);
  };

  return (
    <>
      {favorites ? (
        <Space
          direction="vertical"
          size="middle"
          style={{
            display: 'flex',
          }}
        >
          {favorites.map((fav: Favorite) => (
            <Favorite deleteFav={deleteFav} d={fav.product} key={fav.id} />
          ))}
        </Space>
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
    </>
  );
}

function Favorite({ ...props }) {
  const { d, deleteFav } = props;
  const { data: fav, isSuccess } = useRetrieveMenuItemsQuery(d);
  const [createCartItem] = useCreateCartItemsMutation();
  const cartId = Cookies.get('cartId');

  return (
    <>
      {isSuccess ? (
        <div>
          <Card>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Image
                width={80}
                height={50}
                style={{ objectFit: 'cover' }}
                src={fav.menu_image}
                alt=""
              />
              <div>
                <Title level={4}>{`${fav.menu_name.slice(0, 50)}...`}</Title>
                <Title level={5}>{`${fav.description.slice(0, 80)}...`}</Title>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '1.1em',
                }}
              >
                <Tooltip title="add to cart">
                  <MdAddShoppingCart
                    onClick={() =>
                      createCartItem({
                        quantity: 1,
                        cart: cartId,
                        product: fav.id,
                      })
                    }
                    style={{
                      color: '#00ff64',
                      fontSize: 20,
                      cursor: 'pointer',
                    }}
                  />
                </Tooltip>
                <Tooltip title="delete">
                  <MdDelete
                    onClick={() => deleteFav(fav.id)}
                    style={{
                      color: '#ff4747',
                      fontSize: 20,
                      cursor: 'pointer',
                    }}
                  />
                </Tooltip>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <Skeleton active />
      )}
    </>
  );
}
