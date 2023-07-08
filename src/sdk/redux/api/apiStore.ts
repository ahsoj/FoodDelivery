import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  Restaurant,
  RestaurantMenu,
  Cart,
  CartItems,
  Favorite,
  Rating,
  OrderItem,
} from '../../../pages/types/type';

export const apiSlice = createApi({
  reducerPath: 'apiSlice',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://127.0.0.1:8888/api/v1',
  }),
  tagTypes: [
    'Restaurant',
    'RestaurantMenu',
    'Cart',
    'CartItems',
    'Favorite',
    'OrderItem',
    'Rating',
  ],
  endpoints: (builder) => ({
    // get the restaurant with owner
    getRestaurants: builder.query<Restaurant, string>({
      query: (id) => `/restaurant/${id}/`,
      providesTags: (result, error, arg) =>
        result
          ? [
              ...result.map(({ oid }) => ({
                type: 'Restaurant' as const,
                oid: 'LIST',
              })),
              'Restaurant',
            ]
          : ['Restaurant'],
    }),

    // get menuitems of a signle restaurants with owner
    getRestaurantMenu: builder.query<RestaurantMenu[], number | string>({
      query: (rid) => `/restaurantmenu/?rid=${rid}`,
      providesTags: (result, error, arg) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: 'RestaurantMenu' as const,
                id: 'LIST',
              })),
              'RestaurantMenu',
            ]
          : ['RestaurantMenu'],
    }),

    // create new menuitems from restaurants
    createRestaurantMenu: builder.mutation<RestaurantMenu, FormData | object>({
      query: (payload) => ({
        url: `/restaurantmenu/`,
        method: 'POST',
        body: payload,
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
      }),
      invalidatesTags: ['RestaurantMenu'],
    }),

    // delete menuitems from restaurants
    deleteRestaurantMenu: builder.mutation<object, number | string>({
      query: (rid) => ({
        url: `/restaurantmenu-change/${rid}/`,
        method: 'DELETE',
        body: rid,
      }),
      invalidatesTags: ['RestaurantMenu'],
    }),

    // get menuitems for customers
    getMenuItems: builder.query<RestaurantMenu[], void>({
      query: () => `/restaurantmenu/`,
      providesTags: [{ type: 'RestaurantMenu', id: 'LIST' }],
    }),

    retrieveMenuItems: builder.query<RestaurantMenu, number | string>({
      query: (id) => `/restaurantmenu/${id}/`,
      providesTags: [{ type: 'RestaurantMenu', id: 'LIST' }],
    }),

    // get single user carts
    getCarts: builder.query<Cart[], string | number>({
      query: (id) => `/cart/?foruser=${id}`,
      providesTags: [{ type: 'Cart', id: 'LIST' }],
    }),

    // get single user cartitems
    getCartItems: builder.query<CartItems[], string | number>({
      query: (cart) => `/cartitems/?for=${cart}`,
      providesTags: [{ type: 'CartItems', id: 'LIST' }],
    }),

    // create single user carts
    createCarts: builder.mutation<Cart, string | number>({
      query: (user) => ({
        url: `/cart/`,
        method: 'POST',
        body: user,
      }),
      invalidatesTags: ['Cart'],
    }),

    //create cartitems
    createCartItems: builder.mutation<CartItems, object>({
      query: (cart) => ({
        url: `/cartitems/`,
        method: 'POST',
        body: cart,
      }),
      invalidatesTags: ['CartItems'],
    }),

    //update cartitems
    updateCartItems: builder.mutation<CartItems, any>({
      query: ({ cartItemId, quantity }) => ({
        url: `/cartitems/${cartItemId}/`,
        method: quantity > 0 ? 'PATCH' : 'DELETE',
        body: { quantity: quantity },
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      invalidatesTags: ['CartItems'],
    }),

    //remove cartItems
    removeCartItems: builder.mutation<CartItems, any>({
      query: (cartItemId) => ({
        url: `/cartitems/${cartItemId}/`,
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      invalidatesTags: ['CartItems'],
    }),

    //get Favorites
    getFavorite: builder.query<Favorite[], string | number>({
      query: (userId) => `/favorite/?foruser=${userId}`,
      providesTags: ['Favorite'],
    }),

    //get Favorites
    createFavorite: builder.mutation<Favorite[], any>({
      query: (favorite) => ({
        url: `/favorite/`,
        method: 'POST',
        body: favorite,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      invalidatesTags: ['Favorite'],
    }),

    //delete favorites
    removeFavorite: builder.mutation<Favorite[], string | number>({
      query: (favId) => ({
        url: `/favorite/${favId}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Favorite'],
    }),

    // get rating
    getRating: builder.query<Rating[], any>({
      query: (info) => `/rating/?for=${info.for}&id=${info.id}`,
    }),

    // get orders for customer
    getOrders: builder.query({
      query: (id) => `/order/${id}/`,
      providesTags: [{ type: 'OrderItem', id: 'LIST' }],
    }),

    // get orders for customer
    getOrderItems: builder.query<OrderItem[], string | number>({
      query: (orderId) => `/orderitem/?orderId=${orderId}`,
      providesTags: [{ type: 'OrderItem', id: 'LIST' }],
    }),

    //create order for customer
    createOrderItems: builder.mutation<Object[], any>({
      query: (orderitem) => ({
        url: `/orderitem/`,
        method: 'POST',
        body: orderitem,
      }),
      invalidatesTags: ['OrderItem', 'CartItems'],
    }),

    // delete the order
    removeOrderItems: builder.mutation({
      query: (orderItemId) => ({
        url: `/orderitem/${orderItemId}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['OrderItem'],
    }),
  }),
});

export const {
  //get carts hook
  useGetCartsQuery,
  // get order info
  useGetOrdersQuery,
  // get rating values and comments
  useGetRatingQuery,
  // get favorite hook
  useGetFavoriteQuery,
  // get cartitems hook
  useGetCartItemsQuery,
  // get menuItems hook
  useGetMenuItemsQuery,
  //get orders
  useGetOrderItemsQuery,
  // create cart hook
  useCreateCartsMutation,
  // get restaurants
  useGetRestaurantsQuery,
  // create favorites hook
  useCreateFavoriteMutation,
  // retrieve single menu item hook
  useRetrieveMenuItemsQuery,
  // get restaurantmenu hook
  useGetRestaurantMenuQuery,
  // remove favorite hook
  useRemoveFavoriteMutation,
  // update catitems hook
  useUpdateCartItemsMutation,
  // create cartitems hook
  useCreateCartItemsMutation,
  // remove cartitems hook
  useRemoveCartItemsMutation,
  // create order for customer
  useCreateOrderItemsMutation,
  // remove items from order
  useRemoveOrderItemsMutation,
  // create restaurants menu hook
  useCreateRestaurantMenuMutation,
  // delete restaurants menu
  useDeleteRestaurantMenuMutation,
} = apiSlice;
