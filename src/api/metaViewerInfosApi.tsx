import { fetchCompatBaseQuery } from "@/util/fetchCompatBaseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import { MakePrimitiveRequiredWithObject } from "@/util/types";
import { MetaViewerInfo, MetaViewerMap, MetaViewerActiveMap } from "@/data/prisma-client";
import {
    CreateMetaViewerInfoDto,
    CreateMetaViewerMapDto,
    CreateMetaViewerActiveMapDto,
    UpdateMetaViewerActiveMapDto,
    SearchMetaViewerInfoDto
} from "./dto/metaViwerInfosApiDto";

export const metaViewerInfosApi = createApi({
    // reducerPath 이름은 파일명과 동일하게 맞춘다.
    reducerPath: 'metaViewerInfosApi',
    // baseQuery 인자는 Nest의 컨트롤러 이름처럼 모든 요청 url의 첫마디를 결정한다.
    baseQuery: fetchCompatBaseQuery('meta-viewer-infos'),
    // FIXME 태그 이름은 fetch반환된 데이터 interface명과 같게 하기
    tagTypes: ['MetaViewerInfos', 'MetaViewerInfo', 'MetaViewerMap', 'MetaViewerActiveMap'],
    endpoints: (builder) => ({
        // ==================== 1. MetaViewerInfo 관리 ====================

        // 1.1 MetaViewerInfo 생성
        createMetaViewerInfo: builder.mutation<MetaViewerInfoResult, { body: CreateMetaViewerInfoDto }>({
            query: (arg) => ({
                method: 'POST',
                url: 'admin',
                body: arg.body,
            }),
            invalidatesTags: ['MetaViewerInfos'],
        }),

        // 1.2 MetaViewerInfo 수정
        updateMetaViewerInfo: builder.mutation<MetaViewerInfoResult, { id: number; body: Partial<CreateMetaViewerInfoDto> }>({
            query: (arg) => ({
                method: 'PATCH',
                url: `admin/${arg.id}`,
                body: arg.body,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'MetaViewerInfo', id },
                { type: 'MetaViewerInfos', id: 'LIST' },
            ],
        }),

        // 1.3 MetaViewerInfo 페이징 조회
        findAllMetaViewerInfos: builder.mutation<MetaViewerInfoListResponse, SearchMetaViewerInfoDto>({
            query: (searchDto = {}) => {
                const queryParams = new URLSearchParams();

                if (searchDto.page) queryParams.append('page', searchDto.page.toString());
                if (searchDto.limit) queryParams.append('limit', searchDto.limit.toString());
                if (searchDto.cafeInfoId) queryParams.append('cafeInfoId', searchDto.cafeInfoId.toString());
                if (searchDto.isDisable !== undefined) queryParams.append('isDisable', searchDto.isDisable.toString());
                if (searchDto.searchText) queryParams.append('searchText', searchDto.searchText);
                if (searchDto.searchType) queryParams.append('searchType', searchDto.searchType);

                const url = 'admin' + (queryParams.toString() ? `?${queryParams.toString()}` : '');
                return {
                    method: 'GET',
                    url,
                };
            },
            invalidatesTags: (result) => result?.metaViewerInfos.map(info => ({ type: 'MetaViewerInfo' as const, id: info.id })) || [],
        }),

        // 1.4 MetaViewerInfo 단건 조회
        findOneMetaViewerInfo: builder.query<MetaViewerInfoResult, { id: number }>({
            query: (arg) => ({
                method: 'GET',
                url: `admin/${arg.id}`,
            }),
            providesTags: (result) => result ? [
                { type: "MetaViewerInfo", id: result.id },
                { type: 'MetaViewerActiveMap', id: result.id }
            ] : [
                "MetaViewerInfo",
            ],
        }),

        // 1.5 MetaViewerInfo 삭제
        removeMetaViewerInfo: builder.mutation<DeleteResponse, { id: number }>({
            query: (arg) => ({
                method: 'DELETE',
                url: `admin/${arg.id}`,
            }),
            invalidatesTags: [{ type: 'MetaViewerInfos', id: 'LIST' }],
        }),

        // ==================== 2. MetaViewerMap 관리 ====================

        // 2.1 MetaViewerMap 등록
        createMetaViewerMap: builder.mutation<MetaViewerMapResult, { metaViewerInfoId: number; body: CreateMetaViewerMapDto }>({
            query: (arg) => ({
                method: 'POST',
                url: `admin/${arg.metaViewerInfoId}/maps`,
                body: arg.body,
            }),
            invalidatesTags: (result, error, { metaViewerInfoId }) => [
                { type: 'MetaViewerInfo', id: metaViewerInfoId },
                { type: 'MetaViewerMap', id: 'LIST' },
            ],
        }),

        // 2.2 MetaViewerMap 수정
        updateMetaViewerMap: builder.mutation<MetaViewerMapResult, { mapId: number; body: Partial<CreateMetaViewerMapDto> }>({
            query: (arg) => ({
                method: 'PATCH',
                url: `admin/maps/${arg.mapId}`,
                body: arg.body,
            }),
            invalidatesTags: (result, error, { mapId }) => [
                { type: 'MetaViewerMap', id: mapId },
                { type: 'MetaViewerMap', id: 'LIST' },
            ],
        }),

        // 2.3 MetaViewerMap 삭제
        removeMetaViewerMap: builder.mutation<DeleteResponse, { mapId: number }>({
            query: (arg) => ({
                method: 'DELETE',
                url: `admin/maps/${arg.mapId}`,
            }),
            invalidatesTags: [{ type: 'MetaViewerMap', id: 'LIST' }],
        }),

        // 2.4 MetaViewerMap 목록 조회
        findAllMetaViewerMaps: builder.query<MetaViewerMapResult[], { metaViewerInfoId: number }>({
            query: (arg) => ({
                method: 'GET',
                url: `admin/${arg.metaViewerInfoId}/maps`,
            }),
            providesTags: (result) => result ? result.map(map => ({ type: 'MetaViewerMap', id: map.id })) : [
                { type: 'MetaViewerMap', id: 'LIST' },
            ],
        }),

        // ==================== 3. MetaViewerActiveMap 관리 ====================

        // 3.1 MetaViewerActiveMap 등록
        createMetaViewerActiveMap: builder.mutation<MetaViewerActiveMapResult, { body: CreateMetaViewerActiveMapDto }>({
            query: (arg) => ({
                method: 'POST',
                url: 'admin/active-maps',
                body: arg.body,
            }),
            invalidatesTags: (result, error, { body }) => [
                { type: 'MetaViewerInfo', id: body.metaViewerInfoId },
                { type: 'MetaViewerActiveMap', id: 'LIST' },
            ],
        }),

        // 3.2 MetaViewerActiveMap 수정
        updateMetaViewerActiveMap: builder.mutation<MetaViewerActiveMapResult, { activeMapId: number; body: UpdateMetaViewerActiveMapDto }>({
            query: (arg) => ({
                method: 'PATCH',
                url: `admin/active-maps/${arg.activeMapId}`,
                body: arg.body,
            }),
            invalidatesTags: (result, error, { activeMapId }) => [
                { type: 'MetaViewerActiveMap', id: activeMapId },
                { type: 'MetaViewerActiveMap', id: 'LIST' },
            ],
        }),

        // 3.3 MetaViewerActiveMap 삭제
        removeMetaViewerActiveMap: builder.mutation<DeleteResponse, { activeMapId: number }>({
            query: (arg) => ({
                method: 'DELETE',
                url: `admin/active-maps/${arg.activeMapId}`,
            }),
            invalidatesTags: [{ type: 'MetaViewerActiveMap', id: 'LIST' }],
        }),

        // 2.4 MetaViewerMap 목록 조회
        findOneMetaViewerInfoByCode: builder.query<MetaViewerInfoWithWorldData, { code: string }>({
            query: (arg) => ({
                method: 'GET',
                url: `code/${arg.code}`,
            }),
            providesTags: (result) => result ? [
            { type: 'MetaViewerInfo', id: result.id }
            ] : [
                "MetaViewerInfo",
            ],
        }),
    })
})

// Hooks Export
export const {
    // MetaViewerInfo 관련
    useCreateMetaViewerInfoMutation,
    useUpdateMetaViewerInfoMutation,
    useFindAllMetaViewerInfosMutation,
    useFindOneMetaViewerInfoQuery,
    useRemoveMetaViewerInfoMutation,

    // Public
    useFindOneMetaViewerInfoByCodeQuery,

    // MetaViewerMap 관련
    useCreateMetaViewerMapMutation,
    useUpdateMetaViewerMapMutation,
    useRemoveMetaViewerMapMutation,
    useFindAllMetaViewerMapsQuery,

    // MetaViewerActiveMap 관련
    useCreateMetaViewerActiveMapMutation,
    useUpdateMetaViewerActiveMapMutation,
    useRemoveMetaViewerActiveMapMutation,
} = metaViewerInfosApi;

// 응답 타입 정의
export interface MetaViewerInfoListResponse {
    metaViewerInfos: MetaViewerInfoResult[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface DeleteResponse {
    message: string;
}

// 타입 정의
export type MetaViewerInfoResult = MakePrimitiveRequiredWithObject<MetaViewerInfo>;
export type MetaViewerMapResult = MakePrimitiveRequiredWithObject<MetaViewerMap>;
export type MetaViewerActiveMapResult = MakePrimitiveRequiredWithObject<MetaViewerActiveMap>;

export type MetaViewerInfoWithWorldData = MetaViewerInfo;