import { createApi } from '@reduxjs/toolkit/query/react';
import { fetchCompatBaseQuery } from '@/util/fetchCompatBaseQuery';
import { MakePrimitiveRequiredWithObject, FilteredPropertiesOnlyPrimitiveAndEnum, DeepPartial } from '@/util/types';
import { CafeInfo } from '@/data/prisma-client';

// NOTE Api 이름은 무조건 복수명으로 한다. (NestJS와 동일)
export const cafeInfosApi = createApi({
    // reducerPath 이름은 파일명과 동일하게 맞춘다.
    reducerPath: 'cafeInfosApi',
    // baseQuery 인자는 Nest의 컨트롤러 이름처럼 모든 요청 url의 첫마디를 결정한다.
    baseQuery: fetchCompatBaseQuery('places'),
    // FIXME 태그 이름은 fetch반환된 데이터 interface명과 같게 하기
    tagTypes: ['CafeInfos', 'CafeInfo', 'CafeThumbnailImages'],
    endpoints: (builder) => ({
        // NOTE endpoint 함수의 이름은 find, create, update, remove 로 무조건 시작한다
        findAllPlacesBySearch: builder.mutation<
            { count: number; data: CafeInfoResult[]; },
            {
                skip: number;
                take: number;
                searchText?: string;
                regionCategoryId?: number;
            }
        >({
            query: (arg) => ({
                method: 'GET',
                url: `search?skip=${arg.skip}&take=${arg.take}&searchText=${arg.searchText}&regionCategoryId=${arg.regionCategoryId}`,
            }),
        }),
        findOnePlace: builder.query<CafeInfoResult, { id: number }>({
            query: (arg) => ({
                method: 'GET',
                url: `${arg.id}`,
            }),
            providesTags: (result) => result ? [
                { type: "CafeInfo", id: result.id },
                { type: 'CafeThumbnailImages', id: result.id }
            ] : [
                "CafeInfo",
                { type: 'CafeThumbnailImages', id: 'LIST' }
            ],
        }),

        // s:admin
        createPlaceByAdmin: builder.mutation<CafeInfoResult, { body: CafeInfoCreateInput }>({
            query: (arg) => ({
                method: 'POST',
                url: `admin/create`,
                body: arg.body
            })
        }),
        updatePlaceByAdmin: builder.mutation<CafeInfoResult, { id: number, body: CafeInfoUpdateInput }>({
            query: (arg) => ({
                method: 'PATCH',
                url: `admin/update/${arg.id}`,
                body: arg.body
            })
        }),
        updateDisablePlaceByAdmin: builder.mutation<CafeInfoResult, { id: number, isDisable: boolean }>({
            query: (arg) => ({
                method: 'PATCH',
                url: `admin/disable/${arg.id}?isDisable=${arg.isDisable ? 'true' : 'false'}`
            })
        }),
        findPlaceByAdmin: builder.query<CafeInfoResult, { id: number }>({
            query: (arg) => ({
                method: 'GET',
                url: `admin/${arg.id}`
            }),
            providesTags: (result) => result ? [
                { type: "CafeInfo", id: result.id },
                { type: 'CafeThumbnailImages', id: result.id }
            ] : [
                "CafeInfo",
                { type: 'CafeThumbnailImages', id: 'LIST' }
            ],
        }),
        findAllPlacesByAdmin: builder.mutation<
            { count: number; data: CafeInfoResult[]; },
            {
                page: number;
                take: number;
                searchType?: string;
                searchText?: string;
                regionCategoryId?: string;
                isDisable?: boolean
            }
        >({
            query: (arg) => ({
                method: 'GET',
                url: `admin?page=${arg.page}&take=${arg.take}&searchType=${arg.searchType}&searchText=${arg.searchText}&regionCategoryId=${arg.regionCategoryId}&isDisable=${arg.isDisable}`,
            })
        }),
        deletePlaceByAdmin: builder.mutation<CafeInfoResult, { id: number }>({
            query:(arg) => ({
                method:'DELETE',
                url:`admin/delete/${arg.id}`
            })
        })
    }),
});

export const {
    useCreatePlaceByAdminMutation,
    useFindAllPlacesByAdminMutation,
    useFindAllPlacesBySearchMutation,
    useFindPlaceByAdminQuery,
    useUpdateDisablePlaceByAdminMutation,
    useUpdatePlaceByAdminMutation,
    useFindOnePlaceQuery,
    useDeletePlaceByAdminMutation
} = cafeInfosApi;

export type CafeInfoResult = MakePrimitiveRequiredWithObject<CafeInfo>;

export type CafeInfoUpdateInput = Omit<DeepPartial<FilteredPropertiesOnlyPrimitiveAndEnum<CafeInfo>>, "id">;

export type CafeInfoCreateInput = Omit<Omit<Omit<Required<FilteredPropertiesOnlyPrimitiveAndEnum<CafeInfo>>, "id">, "createdAt">, "isDisable">;