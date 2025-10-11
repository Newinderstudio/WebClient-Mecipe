import { createApi } from '@reduxjs/toolkit/query/react';
import { fetchCompatBaseQuery } from '@/util/fetchCompatBaseQuery';
import { MakePrimitiveRequiredWithObject, FilteredPropertiesOnlyPrimitiveAndEnum, DeepPartial, MakePrimitiveRequired } from '@/util/types';
import { ProductCategory, ClosureProductCategory } from '@/data/prisma-client';

// NOTE Api 이름은 무조건 복수명으로 한다. (NestJS와 동일)
export const productCategoriesApi = createApi({
    // reducerPath 이름은 파일명과 동일하게 맞춘다.
    reducerPath: 'productCategoriesApi',
    // baseQuery 인자는 Nest의 컨트롤러 이름처럼 모든 요청 url의 첫마디를 결정한다.
    baseQuery: fetchCompatBaseQuery('productcategories'),
    // FIXME 태그 이름은 fetch반환된 데이터 interface명과 같게 하기
    tagTypes: ['ProductCategories', 'ProductCategory', 'ClosureProductCategories'],
    endpoints: (builder) => ({
        // NOTE endpoint 함수의 이름은 find, create, update, remove 로 무조건 시작한다

        findAllProductCategories: builder.query<ProductCategoryTreeTable, void>({
            query: () => ({
                method: 'GET',
                url: "closure"
            }),
            providesTags: [{ type: 'ProductCategories', id: "LIST" }, { type: 'ClosureProductCategories', id: "LIST" }]
        }),
        createProductCategoryByAdmin: builder.mutation<ProductCategoryTreeTable, { body: ProductCategoryCreateInput, parentId?: number }>({
            query: (arg) => ({
                method: 'POST',
                url: `admin/create?parentId=${arg.parentId}`,
                body: arg.body
            }),
        }),
        findChildProductCategoriesByAdmin: builder.mutation<ProductCategoryResult[], { parentId?: number }>({
            query: (arg) => ({
                method: 'GET',
                url: `admin/child?parentId=${arg.parentId}`
            })
        }),
        updateProductCategoryByAdmin: builder.mutation<ProductCategoryTreeTable, { id: number, body: ProductCategoryUpdateInput, newParentId?: number }>({
            query: (arg) => ({
                method: 'PATCH',
                url: `admin/update/${arg.id}?newParentId=${arg.newParentId ?? ''}`,
                body: arg.body
            }),
        }),
        disbleProductCategoryByAdmin: builder.mutation<ProductCategoryTreeTable, { id: number, isDisable: boolean }>({
            query: (arg) => ({
                method: 'PATCH',
                url: `admin/disable/${arg.id}?isDisable=${arg.isDisable ? 'true' : 'false'}`
            }),
        }),
        findAncestorCategories: builder.query<ProductCategoryResult[], { categoryId: number }>({
            query: (arg) => ({
                method: 'GET',
                url: `ancestor/${arg.categoryId}`
            })
        }),
        findAllProductCategoriesByAdmin: builder.mutation<boolean, {code: string}>({
            query: (arg) => ({
                method: 'GET',
                url: "admin/duplicate-code",
                params: {code: arg.code}
            })
        })
    }),
});

export const {
    useFindAllProductCategoriesQuery,
    useCreateProductCategoryByAdminMutation,
    useFindChildProductCategoriesByAdminMutation,
    useUpdateProductCategoryByAdminMutation,
    useDisbleProductCategoryByAdminMutation,
    useFindAncestorCategoriesQuery,
    useFindAllProductCategoriesByAdminMutation
} = productCategoriesApi;

export type ProductCategoryResult = MakePrimitiveRequiredWithObject<ProductCategory>;
export type ProductCategoryPrimitiveResult = MakePrimitiveRequired<ProductCategory>;
export type ClosureProductCategoryResult = MakePrimitiveRequiredWithObject<ClosureProductCategory>;
export type ClosureProductCategoryPrimitiveResult = MakePrimitiveRequired<ClosureProductCategory>;

export type ProductCategoryUpdateInput = Omit<DeepPartial<FilteredPropertiesOnlyPrimitiveAndEnum<ProductCategory>>, "id">;

export type ProductCategoryCreateInput = Omit<Omit<Omit<Required<FilteredPropertiesOnlyPrimitiveAndEnum<ProductCategory>>, "id">, "createdAt">, "isDisable">

export type ProductCategoryTreeTable = {
    categories: ProductCategoryPrimitiveResult[], closure: ClosureProductCategoryPrimitiveResult[]
}