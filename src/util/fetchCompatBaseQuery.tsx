import {
  BaseQueryFn,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query';
import { AppState } from '@/store';
import { rootUrl } from '@/util/constants/app';

export const fetchCompatBaseQuery =
  (
    resourceName: string,
  ): BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> =>
    async (args, api, extraOptions) => {
      const baseUrl = `${rootUrl}/${resourceName}/`;
      // TODO token 받는곳 커스텀해야 사용가능..
      const token = (api.getState() as AppState).account.accessToken;
      const result = await fetchBaseQuery({
        baseUrl,
        prepareHeaders: (headers: Headers) => {
          if (token) {
            headers.set('Authorization', 'Bearer ' + token);
          }
          // headers.set('Access-Control-Allow-Origin', '*');
          return headers;
        },
      })(args, api, extraOptions);
      // Logging
      if (process.env.NODE_ENV === 'development') {
        console.log(
          'fetchCompatBaseQuery status : ' +
          result.meta?.request.method +
          ' ' +
          result.meta?.request.url +
          ' ' +
          result.meta?.response?.status +
          ' ' +
          result.meta?.response?.statusText,
          '\n',
          'response body : ',
          result.data,
          '\n',
          'request body : ',
          typeof args === 'string' ? args : args.body,
        );
      }

      if (result.error && process.env.NODE_ENV === 'development') {
        const err = new Error('Network Error:\n ' + JSON.stringify(result.error));
        console.warn(
          'http fetch error\n' +
          'request : ' +
          JSON.stringify(
            {
              method: result.meta?.request.method,
              path: result.meta?.request.url,
              token: token,
              body: typeof args === 'string' ? args : args.body,
            },
            null,
            2,
          ) +
          '\n\n' +
          'url : ' +
          result.meta?.response?.url +
          ' ' +
          result.meta?.response?.status +
          ' ' +
          result.meta?.response?.statusText +
          '\n\n' +
          err,
        );
      }
      return result;
    };
