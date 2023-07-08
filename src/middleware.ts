import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { User } from './pages/types/type';

export function middleware(req: NextRequest) {
  let cookie: any = req.cookies.get('token')?.value;
  let _user: User | null = cookie ? JSON.parse(cookie) : null;
  if (
    (req.nextUrl.pathname.startsWith('/signin/') && _user !== null) ||
    (req.nextUrl.pathname.startsWith('/create_new/') && _user !== null)
  ) {
    return NextResponse.redirect(
      new URL(`/${_user.role === 'merchants' ? 'merchants' : 'home'}/`, req.url)
    );
  }
  if (_user === null) {
    return NextResponse.redirect(new URL(`/signin/`, req.url));
  }
  if (
    req.nextUrl.pathname.endsWith('/merchants') &&
    _user &&
    _user.role === 'merchants'
  ) {
    return NextResponse.redirect(new URL('/merchants/dashboard', req.url));
  } else if (
    req.nextUrl.pathname.endsWith('/merchants') &&
    _user &&
    _user.role !== 'merchant'
  ) {
    return NextResponse.redirect(new URL(`/home/`, req.url));
  }
  if (req.nextUrl.pathname.startsWith('/home') && _user.role === 'merchant') {
    return NextResponse.redirect(new URL(`/merchants/dashboard`, req.url));
  }
}

export const config = {
  matcher: ['/home/:path*', '/merchants/:path*'],
};
