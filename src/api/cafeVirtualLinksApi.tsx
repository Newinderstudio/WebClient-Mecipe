import { createApi } from '@reduxjs/toolkit/query/react';
import { fetchCompatBaseQuery } from '@/util/fetchCompatBaseQuery';
import { DeepPartial, FilteredPropertiesOnlyPrimitiveAndEnum, MakePrimitiveRequired, MakePrimitiveRequiredWithObject } from '@/util/types';
import { CafeVirtualLink, CafeVirtualLinkThumbnailImage } from '@/data/prisma-client';

// NOTE Api 이름은 무조건 복수명으로 한다. (NestJS와 동일)
export const cafeVirtualLinksApi = createApi({
    // reducerPath 이름은 파일명과 동일하게 맞춘다.
    reducerPath: 'cafeVirtualLinksApi',
    // baseQuery 인자는 Nest의 컨트롤러 이름처럼 모든 요청 url의 첫마디를 결정한다.
    baseQuery: fetchCompatBaseQuery('cafevirtuallinks'),
    // FIXME 태그 이름은 fetch반환된 데이터 interface명과 같게 하기
    tagTypes: ['VirtualLinks'],
    endpoints: (builder) => ({
        // NOTE endpoint 함수의 이름은 find, create, update, remove 로 무조건 시작한다
        findAllCafeVirtualLinksByAdmin: builder.query<CafeVirtualLinkResult[], void>({
            query: () => ({
                method: 'GET',
                url: `admin`,
            }),
            providesTags: [{ type: 'VirtualLinks', id: 'LIST' }]
        }),
        createCafeVirtualLinkByAdmin: builder.mutation<CafeVirtualLinkResult[], { cafeId: number, body: CreateCafeVirtualLinkWithImageListDto }>({
            query: (arg) => ({
                method: 'POST',
                url: `admin/create/${arg.cafeId}`,
                body: arg.body
            })
        }),
        updateCafeVirtualLinkByAdmin: builder.mutation<CafeVirtualLinkPrimitiveResult, { id: number, body: CafeVirtualLinkUpdateInput }>({
            query: (arg) => ({
                method: 'PATCH',
                url: `admin/update/${arg.id}`,
                body: arg.body
            })
        }),
        updateCafeVirtualLinkThumbnailImageByAdmin: builder.mutation<Required<CafeVirtualLinkThumbnailImagePrimitiveResult>, { imageId: number, body: CafeVirtualLinkThumbnailImageUpdateInput }>({
            query: (arg) => ({
                method: 'PATCH',
                url: `admin/update/image/${arg.imageId}`,
                body: arg.body
            })
        })
    }),
});

export const {
    useCreateCafeVirtualLinkByAdminMutation,
    useFindAllCafeVirtualLinksByAdminQuery,
    useUpdateCafeVirtualLinkByAdminMutation,
    useUpdateCafeVirtualLinkThumbnailImageByAdminMutation
} = cafeVirtualLinksApi;

export type CafeVirtualLinkResult = MakePrimitiveRequiredWithObject<CafeVirtualLink>;
export type CafeVirtualLinkThumbnailImageResult = MakePrimitiveRequiredWithObject<CafeVirtualLinkThumbnailImage>;

export type CafeVirtualLinkPrimitiveResult = MakePrimitiveRequired<CafeVirtualLink>;
export type CafeVirtualLinkThumbnailImagePrimitiveResult = MakePrimitiveRequired<CafeVirtualLinkThumbnailImage>;

export type CafeVirtualLinkUpdateInput = DeepPartial<Omit<FilteredPropertiesOnlyPrimitiveAndEnum<CafeVirtualLink>, "id" | "cafeInfoId">>
export type CafeVirtualLinkCreateInput = Omit<Required<FilteredPropertiesOnlyPrimitiveAndEnum<CafeVirtualLink>>, "id" | "createdAt" | "isDisable" | "cafeInfoId">;

export type CafeVirtualLinkThumbnailImageUpdateInput = DeepPartial<Omit<FilteredPropertiesOnlyPrimitiveAndEnum<CafeVirtualLinkThumbnailImage>, "id" | "cafeVirtualLinkId">>
export type CafeVirtualLinkThumbnailImageCreateInput = Omit<Required<FilteredPropertiesOnlyPrimitiveAndEnum<CafeVirtualLinkThumbnailImage>>, "id" | "createdAt" | "cafeVirtualLinkId">;

export type CreateCafeVirtualLinkWithImageListDto = {
    create: {
        link: CafeVirtualLinkCreateInput,
        thumbnailImage: CafeVirtualLinkThumbnailImageCreateInput
    }[]
}