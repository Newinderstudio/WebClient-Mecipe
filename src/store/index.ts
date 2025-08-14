"use client"

import { configureStore, ThunkAction } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
// import { setupListeners 
import {
  connect,
  Connect,
  TypedUseSelectorHook,
  useSelector,
} from 'react-redux';
import { Action, combineReducers } from 'redux';
import { examplesApi } from '../api/examplesApi';
import accountSlice from './slices/accountSlice';
import { usersApi } from '../api/usersApi';
import { cafeInfosApi } from '@/api/cafeInfosApi';
import { cafeRealImagesApi } from '@/api/cafeRealImagesApi';
import { cafeThumbnailImagesApi } from '@/api/cafeThumbnailImagesApi';
import { cafeVirtualImagesApi } from '@/api/cafeVirtualImagesApi';
import { cafeVirtualLinksApi } from '@/api/cafeVirtualLinksApi';
import { regionCategoriesApi } from '@/api/regionCategoriesApi';
import { couponsApi } from '@/api/couponsApi';
import { boardsApi } from '@/api/boardsApi';

const reducer = combineReducers({
  [examplesApi.reducerPath]: examplesApi.reducer,
  [usersApi.reducerPath]: usersApi.reducer,
  [cafeInfosApi.reducerPath]: cafeInfosApi.reducer,
  [cafeRealImagesApi.reducerPath]: cafeRealImagesApi.reducer,
  [cafeThumbnailImagesApi.reducerPath]: cafeThumbnailImagesApi.reducer,
  [cafeVirtualImagesApi.reducerPath]: cafeVirtualImagesApi.reducer,
  [cafeVirtualLinksApi.reducerPath]: cafeVirtualLinksApi.reducer,
  [regionCategoriesApi.reducerPath]: regionCategoriesApi.reducer,
  [couponsApi.reducerPath]: couponsApi.reducer,
  [boardsApi.reducerPath]: boardsApi.reducer,
  account: accountSlice,
});

export const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(examplesApi.middleware)
      .concat(usersApi.middleware)
      .concat(cafeInfosApi.middleware)
      .concat(cafeRealImagesApi.middleware)
      .concat(cafeThumbnailImagesApi.middleware)
      .concat(cafeVirtualImagesApi.middleware)
      .concat(cafeVirtualLinksApi.middleware)
      .concat(regionCategoriesApi.middleware)
      .concat(couponsApi.middleware)
      .concat(boardsApi.middleware)
  ,
  devTools: process.env.NODE_ENV !== 'production',
});
setupListeners(store.dispatch);

export type AppState =  ReturnType<typeof store.getState>;
export type AppThunk<Return = void> = ThunkAction<
  Return,
  AppState,
  unknown,
  Action
>;
export type AppDispatch = typeof store.dispatch;
export const useTypedSelector: TypedUseSelectorHook<AppState> = useSelector;
export const typedConnect: Connect<AppState> = connect;
