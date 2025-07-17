import { createApi } from '@reduxjs/toolkit/query/react';
import { fetchCompatBaseQuery } from '@/util/fetchCompatBaseQuery';
import { CafeRealImage } from '@/data/prisma-client';
import { DeepPartial, FilteredPropertiesOnlyPrimitiveAndEnum, MakePrimitiveRequired, MakePrimitiveRequiredWithObject } from '@/util/types';

// NOTE Api 이름은 무조건 복수명으로 한다. (NestJS와 동일)
export const cafeRealImagesApi = createApi({
    // reducerPath 이름은 파일명과 동일하게 맞춘다.
    reducerPath: 'cafeRealImagesApi',
    // baseQuery 인자는 Nest의 컨트롤러 이름처럼 모든 요청 url의 첫마디를 결정한다.
    baseQuery: fetchCompatBaseQuery('caferealimages'),
    // FIXME 태그 이름은 fetch반환된 데이터 interface명과 같게 하기
    tagTypes: ['CafeRealImages'],
    endpoints: (builder) => ({
        // NOTE endpoint 함수의 이름은 find, create, update, remove 로 무조건 시작한다
        uploadCafeRealImagesByAdmin: builder.mutation<CafeRealImagePrimitiveResult[], { cafeId: number, body: UpsertCafeRealImageListDto}>({
            query: (arg) => ({
                method: 'POST',
                url: `admin/upload/${arg.cafeId}`,
            }),
        }),
        findAllCafeRealImagesByAdmin: builder.query<CafeRealImagePrimitiveResult[], void>({
            query: () => ({
                method: 'GET',
                url: `admin`,
            }),
            providesTags: (result) => result && result.length > 0? [{ type: 'CafeRealImages', id: result[0].cafeInfoId}] : [{ type: 'CafeRealImages', id: 'LIST' }]
        }),
    }),
});

export const {
    useFindAllCafeRealImagesByAdminQuery,
    useUploadCafeRealImagesByAdminMutation
} = cafeRealImagesApi;

export type CafeRealImageResult = MakePrimitiveRequiredWithObject<CafeRealImage>;
export type CafeRealImagePrimitiveResult = MakePrimitiveRequired<CafeRealImage>;

export type CafeRealImageUpdateInput = DeepPartial<FilteredPropertiesOnlyPrimitiveAndEnum<CafeRealImage>> & {id:number}

export type CafeRealImageCreateInput = Omit<Omit<Omit<Required<FilteredPropertiesOnlyPrimitiveAndEnum<CafeRealImage>>, "id">, "createdAt">, "isDisable">;

export type UpsertCafeRealImageListDto = {create:CafeRealImageCreateInput[],update:CafeRealImageUpdateInput[]};
