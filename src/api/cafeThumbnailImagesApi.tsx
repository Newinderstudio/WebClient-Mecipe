import { createApi } from '@reduxjs/toolkit/query/react';
import { fetchCompatBaseQuery } from '@/util/fetchCompatBaseQuery';
import { CafeThumbnailImage } from '@/data/prisma-client';
import { DeepPartial, FilteredPropertiesOnlyPrimitiveAndEnum, MakePrimitiveRequired, MakePrimitiveRequiredWithObject } from '@/util/types';

// NOTE Api 이름은 무조건 복수명으로 한다. (NestJS와 동일)
export const cafeThumbnailImagesApi = createApi({
    // reducerPath 이름은 파일명과 동일하게 맞춘다.
    reducerPath: 'cafeThumbnailImagesApi',
    // baseQuery 인자는 Nest의 컨트롤러 이름처럼 모든 요청 url의 첫마디를 결정한다.
    baseQuery: fetchCompatBaseQuery('cafethumbnailimages'),
    // FIXME 태그 이름은 fetch반환된 데이터 interface명과 같게 하기
    tagTypes: ['CafeThumbnailImages'],
    endpoints: (builder) => ({
        // NOTE endpoint 함수의 이름은 find, create, update, remove 로 무조건 시작한다
        uploadCafeThumbnailImagesByAdmin: builder.mutation<CafeThumbnailImagePrimitiveResult[], { cafeId: number, body: UpsertCafethumbnailImageListDto}>({
            query: (arg) => ({
                method: 'POST',
                url: `admin/upload/${arg.cafeId}`,
                body: arg.body
            }),
        }),
        findAllCafeThumbnailImagesByAdmin: builder.query<CafeThumbnailImagePrimitiveResult[], void>({
            query: () => ({
                method: 'GET',
                url: `admin`,
            }),
            providesTags: (result) => result && result.length > 0? [{ type: 'CafeThumbnailImages', id: result[0].cafeInfoId}] : [{ type: 'CafeThumbnailImages', id: 'LIST' }]
        }),
    }),
});

export const {
    useFindAllCafeThumbnailImagesByAdminQuery,
    useUploadCafeThumbnailImagesByAdminMutation
} = cafeThumbnailImagesApi;

export type CafeThumbnailImageResult = MakePrimitiveRequiredWithObject<CafeThumbnailImage>;
export type CafeThumbnailImagePrimitiveResult = MakePrimitiveRequired<CafeThumbnailImage>;

export type CafeThumbnailImageUpdateInput = DeepPartial<FilteredPropertiesOnlyPrimitiveAndEnum<CafeThumbnailImage>> & {id:number}

export type CafeThumbnailImageCreateInput = Omit<Omit<Omit<Required<FilteredPropertiesOnlyPrimitiveAndEnum<CafeThumbnailImage>>, "id">, "createdAt">, "isDisable">;

export type UpsertCafethumbnailImageListDto = {create:CafeThumbnailImageCreateInput[],update:CafeThumbnailImageUpdateInput[]};
