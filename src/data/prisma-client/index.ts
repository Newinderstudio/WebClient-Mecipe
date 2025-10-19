export type User = {
    id?: number
    createdAt?: Date | string
    loginId: string
    loginPw?: string | null
    username: string
    loginType: LoginType
    userType: UserType
    nickname: string
    email: string
    isDisable: boolean

    Boards?: Board[]
    BoardReplies?: BoardReply[]
    Notices?: Notice[]
    ProxyUsers?: ProxyUser[]
    CafeCouponHistories?: CafeCouponHistory[]
}

/**
 * Model Notice
 * 
 */
export type Notice = {
    id?: number
    createdAt?: Date | string
    title: string
    content: string | null
    link: string | null
    userId: number

    User?: User
}

/**
 * Model Board
 * 
 */
export type Board = {
    id?: number
    createdAt?: Date | string
    title: string
    content: string | null
    link: string | null
    startDay: Date | string
    endDay: Date | string
    isDisable: boolean
    userId: number
    boardType: BoardType
    isReplyAvaliable: boolean

    User?: User
    BoardImages?: BoardImage[]
    BoardReplies?: BoardReply[]

    CafeBoards?: CafeBoard[]
}

/**
 * Model BoardImage
 * 
 */
export type BoardImage = {
    id?: number
    createdAt?: Date | string
    url: string
    thumbnailUrl: string
    width: number
    height: number
    size: number
    isThumb: boolean
    isDisable: boolean
    boardId: number

    Board?: Board
}

/**
 * Model BoardReply
 * 
 */
export type BoardReply = {
    id: number
    createdAt?: Date
    updatedAt?: Date
    content: string
    isDisable: boolean
    userId: number
    boardId: number
    boardReplyId?: number

    Board?: Board
    User?: User

    BoardReply?: BoardReply
    BoardNestedReplies?: BoardReply[]
}

export type CafeBoard = {
    boardId: number
    cafeInfoId: number
    createdAt: Date

    Board?: Board
    CafeInfo?: CafeInfo
}

/**
 * Model RegionCategory
 * 
 */
export type RegionCategory = {
    id?: number
    createdAt?: Date | string
    name: string
    isDisable: boolean

    govermentType: GovermentType

    CafeInfos?: CafeInfo[]
    AncestorCategories?: ClosureRegionCategory[]
    DescendantCategories?: ClosureRegionCategory[]
}

/**
 * Model ClosureRegionCategory
 * 
 */
export type ClosureRegionCategory = {
    ancestor: number
    descendant: number
    depth: number

    AncestorCategory?: RegionCategory
    DescendantCategory?: RegionCategory
}

/**
 * Model CafeInfo
 * 
 */
export type CafeInfo = {
    id?: number
    createdAt?: Date | string
    isDisable: boolean
    name: string
    regionCategoryId: number
    address: string
    directions: string
    businessNumber: string
    ceoName: string

    CafeVirtualLinks?: CafeVirtualLink[]
    CafeThumbnailImages?: CafeThumbnailImage[]
    CafeVirtualImages?: CafeVirtualImage[]
    CafeRealImages?: CafeRealImage[]
    CafeCouponGoupPartners?: CafeCouponGoupPartner[]

    RegionCategory?: RegionCategory;

    CafeBoards?: CafeBoard[]
}

/**
 * Model CafeThumbnailImage
 * 
 */
export type CafeThumbnailImage = {
    id?: number
    createdAt?: Date | string
    url: string
    thumbnailUrl: string
    width: number
    height: number
    size: number
    priority: number
    isDisable: boolean
    cafeInfoId: number

    CafeInfo?: CafeInfo
}

/**
 * Model CafeVirtualImage
 * 
 */
export type CafeVirtualImage = {
    id?: number
    createdAt?: Date | string
    url: string
    width: number
    height: number
    size: number
    priority: number
    isDisable: boolean
    cafeInfoId: number

    CafeInfo?: CafeInfo
}

/**
 * Model CafeRealImage
 * 
 */
export type CafeRealImage = {
    id?: number
    createdAt?: Date | string
    url: string
    width: number
    height: number
    size: number
    priority: number
    isDisable: boolean
    cafeInfoId: number

    CafeInfo?: CafeInfo
}

/**
 * Model CafeVirtualLink
 * 
 */
export type CafeVirtualLink = {
    id?: number
    createdAt?: Date | string
    name: string
    url: string
    type: string
    isDisable: boolean
    isAvaliable: boolean
    cafeInfoId: number

    CafeInfo?: CafeInfo
    CafeVirtualLinkThumbnailImage?: CafeVirtualLinkThumbnailImage
}

/**
 * Model CafeVirtualLinkThumbnailImage
 * 
 */
export type CafeVirtualLinkThumbnailImage = {
    id?: number
    createdAt?: Date | string
    url: string
    width: number
    height: number
    size: number
    cafeVirtualLinkId: number

    CafeVirtualLink?: CafeVirtualLink
}

/**
 * Model CafeCouponGroup
 * 
 */
export type CafeCouponGroup = {
    id?: number
    createdAt?: Date
    code: string
    name: string
    tag: string
    description: string
    isDisable: boolean
    startDay: Date
    endDay: Date
    issuanceStartDay: Date
    issuanceEndDay: Date

    CafeCoupons?: CafeCoupon[]
    CafeCouponGoupPartners?: CafeCouponGoupPartner[]
}

/**
 * Model CafeCouponGoupPartner
 * 
 */
export type CafeCouponGoupPartner = {
    cafeCouponGroupId: number
    cafeInfoId: number

    CafeCouponGroup?: CafeCouponGroup
    CafeInfo?: CafeInfo
}

/**
 * Model ProxyUser
 * 
 */
export type ProxyUser = {
    id?: number
    memberId: string
    createdAt?: Date
    proxyUserType: ProxyUserType
    name: string
    token: string
    userId: number | null

    User?: User
    CafeCoupons?: CafeCoupon[]
}

/**
 * Model CafeCoupon
 * 
 */
export type CafeCoupon = {
    id?: number
    createdAt?: Date
    name: string
    content: string
    serialNumber: string
    startDay: Date
    endDay: Date | null
    isDisable: boolean
    proxyUserId: number
    cafeCouponGroupId: number

    ProxyUser?: ProxyUser
    CafeCouponGroup?: CafeCouponGroup
    CafeCouponQRCodes?: CafeCouponQRCode[]
    CafeCouponHistories?: CafeCouponHistory[]
}

/**
 * Model CafeCouponHistory
 * 
 */
export type CafeCouponHistory = {
    id?: number
    createdAt?: Date
    cafeCouponId: number
    eventType: CafeCouponEventType
    description: string
    actorId: number
    statusBefore: CafeCouponStatus | null
    statusAfter: CafeCouponStatus | null

    CafeCoupon?: CafeCoupon
    Actor?: User
}

/**
 * Model CafeCouponQRCode
 * 
 */
export type CafeCouponQRCode = {
    serialNumber: string
    createdAt?: Date
    isDisable: boolean
    cafeCouponId: number | null
    size: number
    base64Data: string

    CafeCoupon?: CafeCoupon
}

/**
 * Model ProductCategory
 * 
 */
export type ProductCategory = {
    id?: number
    createdAt?: Date
    name: string
    description: string | null
    isDisable: boolean
    code: string

    Products?: Product[]
    AncestorCategories?: ClosureProductCategory[]
    DescendantCategories?: ClosureProductCategory[]
}

/**
 * Model ClosureProductCategory
 * 
 */
export type ClosureProductCategory = {
    ancestor: number
    descendant: number
    depth: number

    AncestorCategory?: ProductCategory
    DescendantCategory?: ProductCategory
}

/**
 * Model Product
 * 
 */
export type Product = {
    id?: number
    createdAt?: Date
    updatedAt?: Date
    name: string
    code: string
    description: string | null
    price: number
    originalPrice: number | null
    stockQuantity: number
    minOrderQuantity: number
    isDisable: boolean
    isAvailable: boolean
    categoryId: number
    cafeInfoId: number | null
    productRedirectUrl: string | null
    isSignature: boolean;

    ProductCategory?: ProductCategory
    CafeInfo?: CafeInfo
    WishlistProducts?: WishlistProduct[]
    ProductImages?: ProductImage[]
}

/**
 * Model WishlistProduct
 * 
 */
export type WishlistProduct = {
    id?: number
    createdAt?: Date
    productId: number
    proxyUserId: number

    product?: Product
    ProxyUser?: ProxyUser
}

/**
 * Model ProductImage
 * 
 */
export type ProductImage = {
    id?: number
    createdAt?: Date
    url: string
    thumbnailUrl: string
    width: number
    height: number
    size: number
    isDisable: boolean
    productId: number

    isThumb: boolean

    Product?: Product
}

/**
 * Model MetaViewerInfo
 * 
 */
export type MetaViewerInfo = {
    id: number
    createdAt: Date
    code: string
    isDisable: boolean
    cafeInfoId: number

    worldData: Record<string, unknown>

    CafeInfo: CafeInfo

    MetaViewerMaps: MetaViewerMap[]
    ActiveMaps: MetaViewerActiveMap  // 1:1 관계
    
}

/**
 * Model MetaViewerMap
 * 
 */
export type MetaViewerMap = {
    id: number
    createdAt: Date
    type: MetaMapType
    version: number
    url: string
    size: number
    contentKey: string | null

    isDraco: boolean
    metaViewerInfoId: number

    MetaViewerInfo: MetaViewerInfo
    
    // 활성 맵으로 사용되는 경우의 역참조
    ActiveRenderFor: MetaViewerActiveMap[] 
    ActiveColliderFor: MetaViewerActiveMap[] 
}

/**
 * Model MetaViewerActiveMap
 * 
 */
export type MetaViewerActiveMap = {
    id: number
    updatedAt: Date
    metaViewerInfoId: number
    activeRenderMapId: number
    activeColliderMapId: number

    MetaViewerInfo: MetaViewerInfo
    ActiveRenderMap: MetaViewerMap
    ActiveColliderMap: MetaViewerMap
}


/**
 * Enums
 */

// Based on
// https://github.com/microsoft/TypeScript/issues/3192#issuecomment-261720275

export const LoginType = {
    LOCAL: 'LOCAL',
    ADMIN: 'ADMIN',
    KAKAO: 'KAKAO',
    NAVER: 'NAVER',
    GOOGLE: 'GOOGLE',
    APPLE: 'APPLE',
    ZEPETO: 'ZEPETO'
};

export type LoginType = (typeof LoginType)[keyof typeof LoginType]

export const UserType = {
    GENERAL: 'GENERAL',
    BUSINESS: 'BUSINESS',
    ADMIN: 'ADMIN',
    MANAGER: 'MANAGER'
};


export type UserType = (typeof UserType)[keyof typeof UserType]

export const BoardType = {
    BTALK: 'BTALK',
    BINFORM: 'BINFORM',
    BQUESTION: 'BQUESTION',
    BEVENT: 'BEVENT'
};

export type BoardType = (typeof BoardType)[keyof typeof BoardType]

export const GovermentType = {
    SPECIAL_CITY: 'SPECIAL_CITY',
    METROPOLITAN_CITY: 'METROPOLITAN_CITY',
    SPECIAL_SELF_GOVERNING_CITY: 'SPECIAL_SELF_GOVERNING_CITY',
    PROVINCE: 'PROVINCE',
    SPECIAL_SELF_GOVERNING_PROVINCE: 'SPECIAL_SELF_GOVERNING_PROVINCE',
    DISTRICT: 'DISTRICT',
    CITY: 'CITY',
    COUNTY: 'COUNTY',
    TOWN: 'TOWN',
    TOWNSHIP: 'TOWNSHIP',
    NEIGHBORHOOD: 'NEIGHBORHOOD',
    PLACENAME: 'PLACENAME'
};

export type GovermentType = (typeof GovermentType)[keyof typeof GovermentType]

export const ProxyUserType = {
    ETC: 'ETC',
    WEB: 'WEB',
    ZEPETO: 'ZEPETO',
    WEV_VIEWER: 'WEV_VIEWER'
};

export type ProxyUserType = (typeof ProxyUserType)[keyof typeof ProxyUserType]

export const CafeCouponEventType = {
    CREATED: 'CREATED',
    USED: 'USED',
    REVOKED: 'REVOKED',
    EXPIRED: 'EXPIRED',
    UPDATE: 'UPDATE'
};

export type CafeCouponEventType = (typeof CafeCouponEventType)[keyof typeof CafeCouponEventType]


export const CafeCouponStatus = {
    ACTIVE: 'ACTIVE',
    USED: 'USED',
    REVOKED: 'REVOKED',
    EXPIRED: 'EXPIRED'
};

export type CafeCouponStatus = (typeof CafeCouponStatus)[keyof typeof CafeCouponStatus]

export const MetaMapType = {
    RENDER: 'RENDER',
    COLLIDER: 'COLLIDER'
};

export type MetaMapType = (typeof MetaMapType)[keyof typeof MetaMapType]
