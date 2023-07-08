import '@styles/globals.css';
import type { AppProps } from 'next/app';
// import { ApiProvider } from "@reduxjs/toolkit/dist/query/react";
// import { apiSlice } from "@sdk/redux/api/apiStore";
import { Provider } from 'react-redux';
import { store } from '@sdk/redux/store';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Provider store={store}>
        <Component {...pageProps} />
      </Provider>
    </>
  );
}
