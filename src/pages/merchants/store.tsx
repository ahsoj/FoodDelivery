import React, { useEffect, useState } from 'react';
import ProductCard from '../../components/StoreCard';
import BaseLayout from '@layout/dashboardLayout';
import {
  Divider,
  Typography,
  Button,
  Empty,
  Skeleton,
  Card,
  Space,
} from 'antd';
import { useGetRestaurantMenuQuery } from '@sdk/redux/api/apiStore';
import Authentication from '@sdk/Authentication';
import { User } from '../types/type';

const { Title } = Typography;
function range(start: number, end: number) {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

type UserID = string;

function MenuStore() {
  const [userId, setUser] = useState<UserID>('');
  useEffect(() => {
    const user: any = Authentication.getUser();
    if (user !== null) {
      setUser(user.user_id);
    }
  }, []);
  const {
    data,
    isLoading: isGetLoading,
    isSuccess: isGetSuccess,
    isError: isGetError,
    error: getError,
  } = useGetRestaurantMenuQuery(userId, { skip: !userId });

  if (isGetSuccess) console.log(data);
  if (isGetLoading) {
    return (
      <BaseLayout>
        <Space size={[8, 16]} wrap>
          {range(0, 8).map((value) => (
            <SkeletonCard key={value} />
          ))}
        </Space>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout>
      {data?.length === 0 ? (
        <EmptyStore />
      ) : (
        <>
          <Divider orientation="left" orientationMargin="0">
            <Title style={{ fontWeight: 700 }} level={3}>
              Your Products
            </Title>
          </Divider>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1em',
              justifyContent: 'center',
            }}
          >
            {data?.map((items, index: number) => (
              <ProductCard key={index} products={items} />
            ))}
          </div>
        </>
      )}
    </BaseLayout>
  );
}

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

const SkeletonCard: React.FC = () => (
  <Card
    style={{ width: 240 }}
    cover={<Skeleton.Image style={{ width: 240, height: '200px' }} active />}
    actions={[
      <Skeleton.Button
        key={1}
        style={{ maxWidth: '50px' }}
        active
        size="small"
        block
      />,
      <Skeleton.Button
        key={2}
        style={{ maxWidth: '50px' }}
        active
        size="small"
        block
      />,
      <Skeleton.Button
        key={3}
        style={{ maxWidth: '50px' }}
        active
        size="small"
        block
      />,
    ]}
  >
    <Skeleton.Input active size="small" block />
  </Card>
);

export default MenuStore;
