import { MetaMapType } from "@/data/prisma-client";

export type CreateMetaViewerActiveMapDto = {
    metaViewerInfoId: number;

    activeRenderMapId: number;

    activeColliderMapId: number;
}

export type CreateMetaViewerInfoDto = {
    code: string;

    cafeInfoId: number;

    isDisable?: boolean;
}

export type CreateMetaViewerMapDto = {
    type: MetaMapType;

    url: string;

    size: number;

    version?: number;
}


export type SearchMetaViewerInfoDto = {
    page?: number;

    limit?: number;

    cafeInfoId?: number;

    isDisable?: boolean;

    searchText?: string;

    searchType?: 'code' | 'cafeInfoId';
}

export type UpdateMetaViewerActiveMapDto = {

    activeRenderMapId?: number;

    activeColliderMapId?: number;
}
