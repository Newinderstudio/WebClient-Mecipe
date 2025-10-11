export type CreateProductImageDto = {
    url: string;
    thumbnailUrl: string;
    width: number;
    height: number;
    size: number;
    isThumb?: boolean;
    isDisable?: boolean;
}

export type CreateProductDto = {
    name: string;
    code: string;
    description?: string;
    price: number;
    originalPrice?: number;
    stockQuantity?: number;
    minOrderQuantity?: number;
    isAvailable: boolean;
    isDisable?: boolean;
    isSignature?: boolean;

    cafeInfoId?: number;
    categoryId: number;

    productImages?: CreateProductImageDto[];

    productRedirectUrlArray?: string[];
}

export type SearchProductDto = {
    searchType?: string;

    searchText?: string;

    categoryId?: number;

    isDisable?: boolean;

    cafeInfoId?: number;

    page?: number;

    limit?: number;
}

export type UpdateProductImageDto = {
    url?: string;
    thumbnailUrl?: string;
    width?: number;
    height?: number;
    size?: number;
    isThumb?: boolean;
    isDisable?: boolean;
}

export type UpdateProductDto = {
    name?: string;
    code?: string;
    description?: string;
    price?: number;
    originalPrice?: number;
    stockQuantity?: number;
    minOrderQuantity?: number;
    isAvailable?: boolean;

    cafeInfoId?: number;
    categoryId?: number;
    isSignature?: boolean;

    productImages?: CreateProductImageDto[];
    disabledImageIds?: number[];

    isThumbImageId?: number;

    productRedirectUrlArray?: string[];
}