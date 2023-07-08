export interface User {
  role: string;
  user_id: number | string;
}

export interface UserInfo {
  exp: number | string;
  iat: number | string;
  jti: string;
  token_type: string;
  user_id: string | number;
}

export interface CartCounter {
  value?: number;
  fav?: number;
  quantity: number;
  cartItem: CartItems[];
  isOpen?: boolean;
  whoIsOpen?: string | number;
}

export interface Restaurant {
  map(arg0: (data: any) => any): any;
  id: 1;
  owner: string;
  r_name: string;
  address: string;
  is_approved: boolean;
  restaurant_logo: string;
  business_permit: string;
}

export interface RestaurantMenu {
  price: string;
  category: string;
  menu_name: string;
  menu_image: string;
  is_active: boolean;
  id: number | string;
  description: string;
  ingredients: string;
  owner: number | string;
}

export interface Cart {
  user: string;
  id: string | number;
}

export interface Rating {
  id: number | string;
  rate: number;
  comment: string;
  from_custoemr?: string | number;
  to_restaurant?: string | number;
  to_menu?: string | number;
  to_driver?: string | number;
}

export interface Favorite {
  id: number | string;
  user: string | number;
  product: number | string;
  createdAt: string | number;
}

export interface CartItems {
  id: number | string;
  cart: number | string;
  product: number | string;
  quantity: number;
}

export interface OrderItem {
  id: number | string;
  quantity: number;
  price: number;
  order_created: string;
  order: number | string;
  item: number | string;
}
