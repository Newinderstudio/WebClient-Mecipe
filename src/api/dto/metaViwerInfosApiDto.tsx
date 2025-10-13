import { MetaMapType } from "@/data/prisma-client";

export type Vector3 = {
    x: number;
    y: number;
    z: number;
}

export type WorldData = {
    // 플레이어 정보
    playerHeight: number;
    playerRadius: number;
    spawnPoint: Vector3;
    playerJumpForce: number;
    playerSpeed: number;
    playerScale: Vector3;
    playerRotation: Vector3;
    playerRotationSpeed: number;
    defaultAnimationClip: string;
    
    // 월드 정보
    worldPosition: Vector3;
    worldRotation: Vector3;
    worldScale: Vector3;
}

export type CreateMetaViewerActiveMapDto = {
    metaViewerInfoId: number;

    activeRenderMapId: number;

    activeColliderMapId: number;
}

export type CreateMetaViewerInfoDto = {
    code: string;

    cafeInfoId: number;

    isDisable?: boolean;

    worldData?: WorldData;

    activeRenderMap: CreateMetaViewerMapDto;
    activeColliderMap: CreateMetaViewerMapDto;
}

export type CreateMetaViewerMapDto = {
    type: MetaMapType;

    url: string;

    size: number;

    version?: number;

    isDraco?: boolean;
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