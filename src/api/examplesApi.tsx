import { createApi } from '@reduxjs/toolkit/query/react';
import { fetchCompatBaseQuery } from '@/util/fetchCompatBaseQuery';

// NOTE Api 이름은 무조건 복수명으로 한다. (NestJS와 동일)
export const examplesApi = createApi({
  // reducerPath 이름은 파일명과 동일하게 맞춘다.
  reducerPath: 'examplesApi',
  // baseQuery 인자는 Nest의 컨트롤러 이름처럼 모든 요청 url의 첫마디를 결정한다.
  baseQuery: fetchCompatBaseQuery('examples'),
  // FIXME 태그 이름은 fetch반환된 데이터 interface명과 같게 하기
  tagTypes: ['TestDatas'],
  endpoints: (builder) => ({
    // NOTE endpoint 함수의 이름은 find, create, update, remove 로 무조건 시작한다
    getTest: builder.query<{text:string}, void>({
      query: () => ({
        method: 'GET',
        url: 'test',
      }),
    }),
  }),
});

export const { useGetTestQuery } = examplesApi;
