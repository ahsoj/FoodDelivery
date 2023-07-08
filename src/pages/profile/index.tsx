import { Button } from 'antd';
import Link from 'next/link';
export default function Profile() {
  return (
    <>
      <h1>We actively developing your profile page</h1>
      <Link href="/home">
        <Button>Back to Home</Button>
      </Link>
    </>
  );
}
