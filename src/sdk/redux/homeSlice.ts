import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { CartCounter, CartItems } from "../../pages/types/type";

const initialState = {
  value: 0,
  quantity: 0,
  cartItem: [],
  isOpen: false,
  whoIsOpen: "",
  fav: 0,
} as CartCounter;

export const homeSlice = createSlice({
  name: "homeSlice",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const itemCart = state.cartItem.find(
        (item) => item.id === action.payload.id
      );
      if (itemCart) {
        itemCart.quantity++;
      } else {
        state.cartItem.push({ ...action.payload, quantity: 1 });
      }
    },
    getQty: (state, action: PayloadAction<number>) => {
      if (action.payload <= 1) {
        state.quantity = 1;
      } else {
        state.quantity = action.payload;
      }
    },

    incrQuantity: (state, action) => {
      const item = state.cartItem.find((item) => item.id === action.payload);
      if (item) item.quantity++;
    },

    decrQuantity: (state, action) => {
      const item = state.cartItem.find((item) => item.id === action.payload);
      if (item) {
        if (item.quantity === 1) {
          item.quantity = 1;
        } else {
          item.quantity--;
        }
      }
    },
    removeFromCart: (state, action) => {
      const removeItem = state.cartItem.filter(
        (item) => item.cart !== action.payload
      );
      state.cartItem = removeItem;
    },
    openSider: (state, action: PayloadAction<any>) => {
      state.isOpen = action.payload.isOpen;
      state.whoIsOpen = action.payload.whois;
    },
    closeSider: (state, action: PayloadAction<boolean>) => {
      state.isOpen = action.payload;
      // state.whoIsOpen = action.payload.whois;
    },
  },
});

export const {
  openSider,
  closeSider,
  addToCart,
  getQty,
  removeFromCart,
  incrQuantity,
  decrQuantity,
} = homeSlice.actions;
// export default homeSlice.reducer;
