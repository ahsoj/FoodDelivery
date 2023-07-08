import { Space, Card, Row, Typography } from 'antd';
import { useRouter } from 'next/router';
import Image from 'next/image';
const { Title } = Typography;

export default function OnboardingNew() {
  const router = useRouter();

  return (
    <div
      style={{
        height: '90vh',
        alignItems: 'center',
        display: 'flex',
        margin: 'auto',
        width: '100%',
        justifyContent: 'center',
        textAlign: 'center',
        flexDirection: 'column',
      }}
    >
      <Title>You can Create Account as ..</Title>
      <Space>
        <Card
          cover={
            <Image
              style={{ objectFit: 'contain' }}
              src="/as_customer.svg"
              alt=""
              width={80}
              height={150}
            />
          }
          onClick={() => router.push('/create_new/customer')}
          hoverable
        >
          <h1>.. Customer</h1>
        </Card>
        <Card
          cover={
            <Image
              style={{ objectFit: 'contain' }}
              src="/res_owner.svg"
              alt=""
              width={80}
              height={150}
            />
          }
          onClick={() => router.push('/create_new/merchants')}
          hoverable
        >
          <h1>.. Restaurant Owner</h1>
        </Card>
        <Card
          cover={
            <Image
              style={{ objectFit: 'contain' }}
              src="/as_driver.svg"
              alt=""
              width={80}
              height={150}
            />
          }
          hoverable
        >
          <h1>.. Delivery Driver</h1>
        </Card>
      </Space>
    </div>
  );
}
// onClick={() => router.push("/create_new/drivers")}
