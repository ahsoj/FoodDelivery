import React, { useEffect, useState } from 'react';
import {
  Badge,
  Drawer,
  Layout,
  Dropdown,
  Avatar,
  Tooltip,
  theme,
  Input,
  MenuProps,
} from 'antd';
import { UserOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { MdOutlineFavoriteBorder, MdShoppingCart } from 'react-icons/md';
import { useAppDispatch, useAppSelector } from '@sdk/redux/hooks';
import { RootState } from '@sdk/redux/rootReducer';
import { closeSider, openSider } from '@sdk/redux/homeSlice';
import {
  useGetCartItemsQuery,
  useGetCartsQuery,
  useGetFavoriteQuery,
} from '@sdk/redux/api/apiStore';
import Image from 'next/image';
import { skipToken } from '@reduxjs/toolkit/dist/query';
import { CartItems, User } from '../pages/types/type';
import Authentication from '@sdk/Authentication';
import Cookies from 'js-cookie';
import CartContent from '@components/CartContent';
import FavoriteContent from '@components/FavoriteContent';
import SearchBar from '@components/SearchBar';
const { Header, Content } = Layout;

const items: MenuProps['items'] = [
  {
    label: <Link href="/profile">Profile</Link>,
    key: '0',
  },
  {
    label: <Link href="/checkout">My Order</Link>,
    key: '1',
  },
  {
    label: <Link href="/profile/logout">LogOut</Link>,
    key: '2',
  },
];

const HomeLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const [cartQuantity, setCartQuantity] = useState<number>(0);

  const _user = Authentication.getUser();
  const control = useAppSelector((state: RootState) => state.controlCart);
  const { data: cart, isSuccess: isGetSuccess } = useGetCartsQuery(
    _user?.user_id ?? skipToken
  );
  const { data: favorite, isSuccess: isGetFavSuccess } = useGetFavoriteQuery(
    _user?.user_id ?? skipToken
  );

  const dispatch = useAppDispatch();
  const cartId = cart && cart[0].id;
  const { data: cartItem } = useGetCartItemsQuery(cartId ?? skipToken);

  useEffect(() => {
    if (window !== undefined) {
      window.addEventListener('loadstart', function (event) {
        // var resourceUrl = event.target.href;
        // var resourceType = event.target.tagName;
        var startTime = performance.now();

        window.addEventListener('loadend', function (event) {
          var endTime = performance.now();
          var loadTime = endTime - startTime;
          console.log(loadTime);
          // Update the progress bar for the resource
          // var progressBar = document.getElementById(
          //   "progress-bar-" + resourceUrl
          // );
          // progressBar.style.width = loadTime + "s";
        });
      });
    }
    let quantity = 0;
    if (isGetSuccess) Cookies.set('cartId', cartId as string);
    cartItem?.map((item: any) => {
      quantity += Number(item.quantity);
    });
    setCartQuantity(quantity);
    // dispatch(addToCart({ cartItem }));
  }, [cartItem, cartId, isGetSuccess]);

  return (
    <Layout>
      <Header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          padding: '0 30px',
          background: colorBgContainer,
        }}
      >
        <Link href="/" style={{ marginTop: '25px', marginInline: '20px' }}>
          <Image src="/logo.png" alt="" width={60} height={40} />
        </Link>
        <nav
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            width: '100%',
            gap: '3em',
          }}
        >
          <SearchBar />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2em',
            }}
          >
            <Badge count={cartQuantity} overflowCount={9}>
              <Tooltip title="Your Cart">
                <MdShoppingCart
                  onClick={() =>
                    dispatch(openSider({ isOpen: true, whois: 'cart' }))
                  }
                  fontSize={25}
                />
              </Tooltip>
            </Badge>
            <Badge count={favorite?.length} overflowCount={9}>
              <Tooltip title="Your Favorite">
                <MdOutlineFavoriteBorder
                  fontSize={25}
                  onClick={() =>
                    dispatch(openSider({ isOpen: true, whois: 'fav' }))
                  }
                />
              </Tooltip>
            </Badge>
            <Dropdown menu={{ items }} trigger={['click']}>
              <a onClick={(e) => e.preventDefault()}>
                <Badge dot>
                  <Avatar
                    style={{ cursor: 'pointer', backgroundColor: '#87d068' }}
                    icon={<UserOutlined />}
                  />
                </Badge>
              </a>
            </Dropdown>
          </div>
        </nav>
      </Header>
      <Content className="site-layout" style={{ padding: '20px' }}>
        <div
          style={{ padding: 24, minHeight: 380, background: colorBgContainer }}
        >
          {children}
        </div>
      </Content>
      <Drawer
        placement={'right'}
        width={450}
        onClose={() => dispatch(closeSider(false))}
        open={control.isOpen}
      >
        {control.whoIsOpen === 'cart' ? (
          <CartContent cartItem={cartItem} />
        ) : (
          <FavoriteContent favorites={favorite} />
        )}
      </Drawer>
    </Layout>
  );
};

export default HomeLayout;
