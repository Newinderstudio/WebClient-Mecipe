import { createApi } from "@reduxjs/toolkit/query/react";
import { fetchCompatBaseQuery } from "@/util/fetchCompatBaseQuery";
import { DeepPartial } from "@/util/types";
import { FilteredPropertiesOnlyPrimitiveAndEnum, MakePrimitiveRequiredWithObject } from "@/util/types";
import { Product, ProductImage } from "@/data/prisma-client";
import { CreateProductDto, SearchProductDto, UpdateProductDto } from "./dto/productsApiDto";

export const productsApi = createApi({
    reducerPath: 'productsApi',
    baseQuery: fetchCompatBaseQuery('products'),
    tagTypes: ['Products', 'Product', 'ProductImage'],
    endpoints: (builder) => ({
    // Product 생성
    createProduct: builder.mutation<ProductResult, { body: CreateProductDto }>({
        query: (arg) => ({
          method: 'POST',
          url: 'create',
          body: arg.body,
        }),
        invalidatesTags: ['Products'],
      }),
  
      // Product 조회 (검색 및 페이징)
      findAllProducts: builder.mutation<ProductListResponse, SearchProductDto>({
        query: (searchDto = {}) => {
          return {
            method: 'GET',
            url: '',
            params: searchDto,
          };
        },
        invalidatesTags: (result) => result?.products.map(product => ({ type: 'Products', id: product.id })) || []
      }),
  
      // Product 조회 (검색 및 페이징)
      findAllProductsByAdmin: builder.mutation<ProductListResponse, SearchProductDto>({
        query: (searchDto = {}) => {
          return {
            method: 'GET',
            url: 'admin',
            params: searchDto,
          };
        },
        invalidatesTags: (result) => result?.products.map(product => ({ type: 'Products', id: product.id })) || []
      }),
  
      // Product 상세 조회
      findOneProduct: builder.query<ProductResult, { id: number }>({
        query: (arg) => ({
          method: 'GET',
          url: `${arg.id}`,
        }),
        providesTags: (result) => result ? [
          { type: "Product", id: result.id },
        ] : [
          "Product",
        ],
      }),
  
      // Product 수정
      updateProduct: builder.mutation<ProductResult, { id: number; body: UpdateProductDto }>({
        query: (arg) => ({
          method: 'PATCH',
          url: `${arg.id}`,
          body: arg.body,
        }),
        invalidatesTags: (result, error, { id }) => [
          { type: 'Product', id },
          { type: 'Products', id: 'LIST' },
        ],
      }),
  
      // Product 삭제
      removeProduct: builder.mutation<DeleteResponse, { id: number }>({
        query: (arg) => ({
          method: 'DELETE',
          url: `${arg.id}`,
        }),
        invalidatesTags: [{ type: 'Products', id: 'LIST' }],
      }),

      findDuplicateProductCode: builder.mutation<boolean, { code: string }>({
        query: (arg) => ({
          method: 'GET',
          url: 'duplicate-code',
          params: arg,
        }),
      }),
    })
})

export const {
    useCreateProductMutation,
    useFindAllProductsMutation,
    useFindAllProductsByAdminMutation,
    useFindOneProductQuery,
    useUpdateProductMutation,
    useRemoveProductMutation,
    useFindDuplicateProductCodeMutation,
 } = productsApi;

// 응답 타입 정의
interface ProductListResponse {
    products: Omit<ProductResult, "ProductImages">[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }
  
  interface DeleteResponse {
    message: string;
  }
  
  // 타입 정의
  export type ProductResult = MakePrimitiveRequiredWithObject<Product>;
  export type ProductImageResult = MakePrimitiveRequiredWithObject<ProductImage>;
  
  export type ProductUpdateInput = Omit<DeepPartial<FilteredPropertiesOnlyPrimitiveAndEnum<Product>>, "id">;
  export type ProductCreateInput = Omit<Omit<Omit<Required<FilteredPropertiesOnlyPrimitiveAndEnum<Product>>, "id">, "createdAt">, "updatedAt">;