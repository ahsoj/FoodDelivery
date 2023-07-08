import Cookies from 'js-cookie';
import { useRouter } from 'next/router';

export default function LogoutView() {
  const router = useRouter();
  setTimeout(() => {
    router.push('/');
    Cookies.remove('token');
    Cookies.remove('cartId');
    Cookies.remove('order-id');
  }, 2000);
  return (
    <>
      <h1>You are successfully logged out redirecting ...</h1>
    </>
  );
}
