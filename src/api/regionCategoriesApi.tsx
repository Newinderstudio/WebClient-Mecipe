import { createApi } from '@reduxjs/toolkit/query/react';
import { fetchCompatBaseQuery } from '@/util/fetchCompatBaseQuery';
import { MakePrimitiveRequiredWithObject, FilteredPropertiesOnlyPrimitiveAndEnum, DeepPartial, MakePrimitiveRequired } from '@/util/types';
import { RegionCategory, ClosureRegionCategory, GovermentType } from '@/data/prisma-client';

// NOTE Api 이름은 무조건 복수명으로 한다. (NestJS와 동일)
export const regionCategoriesApi = createApi({
    // reducerPath 이름은 파일명과 동일하게 맞춘다.
    reducerPath: 'regionCategoriesApi',
    // baseQuery 인자는 Nest의 컨트롤러 이름처럼 모든 요청 url의 첫마디를 결정한다.
    baseQuery: fetchCompatBaseQuery('regioncategories'),
    // FIXME 태그 이름은 fetch반환된 데이터 interface명과 같게 하기
    tagTypes: ['RegionCategories', 'RegionCategory', 'ClosureRegionCategories'],
    endpoints: (builder) => ({
        // NOTE endpoint 함수의 이름은 find, create, update, remove 로 무조건 시작한다

        findAllRegionCategories: builder.query<RegionCategoryTreeTable, void>({
            query: () => ({
                method: 'GET',
                url: "closure"
            }),
            providesTags: [{ type: 'RegionCategories', id: "LIST" }, { type: 'ClosureRegionCategories', id: "LIST" }]
        }),
        createRegionCategoryByAdmin: builder.mutation<RegionCategoryTreeTable, { body: RegionCategoryCreateInput, parentId?:number }>({
            query: (arg) => ({
                method: 'POST',
                url: `admin/create?parentId=${arg.parentId}`,
                body: arg.body
            }),
        }),
        findChildRegionCategoriesByAdmin: builder.mutation<RegionCategoryResult[], { parentId?: number }>({
            query: (arg) => ({
                method: 'GET',
                url: `admin/child?parentId=${arg.parentId}`
            })
        }),
        updateRegionCategoryByAdmin: builder.mutation<RegionCategoryTreeTable, { id: number, body: RegionCategoryUpdateInput, newParentId?:number }>({
            query: (arg) => ({
                method: 'PATCH',
                url: `admin/update/${arg.id}?newParentId=${arg.newParentId?? ''}`,
                body: arg.body
            }),
        }),
        disbleRegionCategoryByAdmin: builder.mutation<RegionCategoryTreeTable, { id: number, isDisable: boolean }>({
            query: (arg) => ({
                method: 'PATCH',
                url: `admin/disable/${arg.id}?isDisable=${arg.isDisable ? 'true' : 'false'}`
            }),
        })
    }),
});

export const { 
    useCreateRegionCategoryByAdminMutation,
    useDisbleRegionCategoryByAdminMutation,
    useFindAllRegionCategoriesQuery,
    useFindChildRegionCategoriesByAdminMutation,
    useUpdateRegionCategoryByAdminMutation,
 } = regionCategoriesApi;

export type RegionCategoryResult = MakePrimitiveRequiredWithObject<RegionCategory>;
export type RegionCategoryPrimitiveResult = MakePrimitiveRequired<RegionCategory>;
export type ClosureRegionCategoryResult = MakePrimitiveRequiredWithObject<ClosureRegionCategory>;

export type RegionCategoryUpdateInput = Omit<DeepPartial<FilteredPropertiesOnlyPrimitiveAndEnum<RegionCategory>>, "id">;

export type RegionCategoryCreateInput = Omit<Omit<Omit<Required<FilteredPropertiesOnlyPrimitiveAndEnum<RegionCategory>>, "id">, "createdAt">, "isDisable">

export type RegionCategoryTreeTable = {
    categories: RegionCategoryResult[], closure: ClosureRegionCategoryResult[]
}

export const GovermentTypeLabel: Record<GovermentType, string> = {
  SPECIAL_CITY: '특별시',
  METROPOLITAN_CITY: '광역시',
  SPECIAL_SELF_GOVERNING_CITY: '특별자치시',
  PROVINCE: '도',
  SPECIAL_SELF_GOVERNING_PROVINCE: '특별자치도',
  DISTRICT: '구',
  CITY: '시',
  COUNTY: '군',
  TOWN: '읍',
  TOWNSHIP: '면',
  NEIGHBORHOOD: '동',
  PLACENAME: '지명',
}
