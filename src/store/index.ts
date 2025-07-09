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

const reducer = combineReducers({
  [examplesApi.reducerPath]: examplesApi.reducer,
  [usersApi.reducerPath]: usersApi.reducer,
  account: accountSlice,
});

export const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(examplesApi.middleware)
      .concat(usersApi.middleware)
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
