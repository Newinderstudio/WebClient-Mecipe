import { StringDecoder } from "node:string_decoder"
import { StringLiteralType } from "typescript"

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
    startDay: Date
    endDay: Date
    isDisable: boolean
    userId: number
    boardType: BoardType

    User?: User
    BoardImages?: BoardImage[]
    BoardReplies?: BoardReply[]
}

/**
 * Model BoardImage
 * 
 */
export type BoardImage = {
    id?: number
    createdAt?: Date | string
    url: string
    width: number
    height: number
    size: number
    isThumb: boolean
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
    boardType: BoardType

    Board?: Board
    User?: User

    BoardReply?: BoardReply
    BoardNestedReplies?: BoardReply[]
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

    govermentTYpe: GovermentType

    CafeInfos?: CafeInfo[]
    AncestorCategories?: RegionCategory[]
    DescendantCategories?: RegionCategory[]
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
}

/**
 * Model CafeThumbnailImage
 * 
 */
export type CafeThumbnailImage = {
    id?: number
    createdAt?: Date | string
    url: string
    width: number
    height: number
    size: number
    priority: number
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
 * Enums
 */

// Based on
// https://github.com/microsoft/TypeScript/issues/3192#issuecomment-261720275

export const LoginType = {
    LOCAL: 'LOCAL',
    ADMIN: 'ADMIN'
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
    BQUESTION: 'BQUESTION'
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