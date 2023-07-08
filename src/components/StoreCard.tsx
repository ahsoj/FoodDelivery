import React from 'react';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Popconfirm, Card, Typography, Badge } from 'antd';
import { useDeleteRestaurantMenuMutation } from '@sdk/redux/api/apiStore';
import Image from 'next/image';

const { Meta } = Card;
const { Title } = Typography;

const ProductCard = ({ ...props }) => {
  const [deleteMenu, response] = useDeleteRestaurantMenuMutation();
  const { products } = props;

  return (
    <Badge.Ribbon
      text={products.is_active ? 'ACTIVE' : 'PENDING'}
      color={products.is_active ? 'green' : 'red'}
    >
      <Card
        style={{ width: 300 }}
        cover={
          <Image
            width={300}
            height={150}
            style={{ objectFit: 'contain' }}
            alt={products.menu_name}
            src={products.menu_image}
          />
        }
        actions={[
          <Title key={1} level={4}>
            ${products.price}
          </Title>,
          <EditOutlined style={{ color: '#0099ff' }} key="edit" />,
          <Popconfirm
            key={3}
            title="Are you sure delete this Menu?"
            okText="Yes"
            cancelText="No"
            onConfirm={() => deleteMenu(products.id)}
          >
            <DeleteOutlined style={{ color: '#ff4747' }} key="delete" />,
          </Popconfirm>,
        ]}
      >
        <Meta title={products.menu_name} description={products.description} />
      </Card>
    </Badge.Ribbon>
  );
};

export default ProductCard;
