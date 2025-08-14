import { Board, BoardImage, BoardReply, BoardType, CafeBoard, CafeInfo } from "@/data/prisma-client";

// Prisma 타입들을 re-export
export type { Board, BoardImage, BoardReply, BoardType, CafeBoard, CafeInfo };

export type CreateBoardImageDto = {
    url: string;
    thumbnailUrl: string;
    width: number;
    height: number;
    size: number;
    isThumb?: boolean;
    isDisable?: boolean;
}

export type CreateBoardReplyDto = {
    content: string;
    boardReplyId?: number;
}

// Prisma 타입을 기반으로 DTO 정의
export type CreateBoardDto = {
    title: string;
    content?: string;
    link?: string;
    startDay?: string;
    endDay?: string;
    isReplyAvaliable?: boolean;
    boardType?: BoardType;
    cafeInfoIds?: number[];

    boardImages?: CreateBoardImageDto[];
}

export type SearchBoardDto = {
    boardType?: BoardType;
    startDay?: string;
    endDay?: string;
    title?: string;
    content?: string;
    page?: number;
    limit?: number
    cafeInfoId?: number;

    notInProgressDay?: string;
    inProgressDay?: string;
}

export type UpdateBoardImageDto = {
    url?: string;
    thumbnailUrl?: string;
    width?: number;
    height?: number;
    size?: number;
    isThumb?: boolean;
    isDisable?: boolean;
}

export type UpdateBoardReplyDto = {
    content?: string;
}

export type UpdateBoardDto = {
    title?: string;
    content?: string;
    link?: string;
    startDay?: string;
    endDay?: string;
    isReplyAvaliable?: boolean;
    boardType?: BoardType;
    cafeInfoIds?: number[];

    boardImages?: CreateBoardImageDto[];
    removeImageIds?: number[];
}

// User만 포함된 Board 타입
export type BoardWithUser = Board & {
    User: {
        id: number;
        username: string;
        nickname: string;
    }
}

// 모든 관계가 포함된 Board 타입
export type BoardFull = Board & {
    User: {
        id: number;
        username: string;
        nickname: string;
    },
    BoardImages: BoardImage[],
    BoardReplies: BoardReply[],
    CafeBoards: CafeBoard[]
}


export type BoardImageFull = BoardImage & {
    Board: Board;
}

export type BoardReplyFull = BoardReply & {
    User: {
        id: number;
        username: string;
        nickname: string;
    }
}

export type CafeBoardFull = CafeBoard & {
    CafeInfo: CafeInfo;
}
