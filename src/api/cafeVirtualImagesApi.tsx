import { createApi } from '@reduxjs/toolkit/query/react';
import { fetchCompatBaseQuery } from '@/util/fetchCompatBaseQuery';
import { CafeVirtualImage } from '@/data/prisma-client';
import { DeepPartial, FilteredPropertiesOnlyPrimitiveAndEnum, MakePrimitiveRequired, MakePrimitiveRequiredWithObject } from '@/util/types';

// NOTE Api 이름은 무조건 복수명으로 한다. (NestJS와 동일)
export const cafeVirtualImagesApi = createApi({
    // reducerPath 이름은 파일명과 동일하게 맞춘다.
    reducerPath: 'cafeVirtualImagesApi',
    // baseQuery 인자는 Nest의 컨트롤러 이름처럼 모든 요청 url의 첫마디를 결정한다.
    baseQuery: fetchCompatBaseQuery('cafevirtualimages'),
    // FIXME 태그 이름은 fetch반환된 데이터 interface명과 같게 하기
    tagTypes: ['CafeVirtualImages'],
    endpoints: (builder) => ({
        // NOTE endpoint 함수의 이름은 find, create, update, remove 로 무조건 시작한다
        uploadCafeVirtualImagesByAdmin: builder.mutation<CafeVirtualImagePrimitiveResult[], { cafeId: number, body: UpsertCafeVirtualImageListDto}>({
            query: (arg) => ({
                method: 'POST',
                url: `admin/upload/${arg.cafeId}`,
                body: arg.body
            }),
        }),
        findAllCafeVirtualImagesByAdmin: builder.query<CafeVirtualImagePrimitiveResult[], void>({
            query: () => ({
                method: 'GET',
                url: `admin`,
            }),
            providesTags: (result) => result && result.length > 0? [{ type: 'CafeVirtualImages', id: result[0].cafeInfoId}] : [{ type: 'CafeVirtualImages', id: 'LIST' }]
        }),
    }),
});

export const {
    useFindAllCafeVirtualImagesByAdminQuery,
    useUploadCafeVirtualImagesByAdminMutation
} = cafeVirtualImagesApi;

export type CafeVirtualImageResult = MakePrimitiveRequiredWithObject<CafeVirtualImage>;
export type CafeVirtualImagePrimitiveResult = MakePrimitiveRequired<CafeVirtualImage>;

export type CafeVirtualImageUpdateInput = DeepPartial<FilteredPropertiesOnlyPrimitiveAndEnum<CafeVirtualImage>> & {id:number}

export type CafeVirtualImageCreateInput = Omit<Omit<Omit<Required<FilteredPropertiesOnlyPrimitiveAndEnum<CafeVirtualImage>>, "id">, "createdAt">, "isDisable">;

export type UpsertCafeVirtualImageListDto = {create:CafeVirtualImageCreateInput[],update:CafeVirtualImageUpdateInput[]};
