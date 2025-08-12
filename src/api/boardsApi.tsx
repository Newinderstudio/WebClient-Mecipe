import { createApi } from '@reduxjs/toolkit/query/react';
import { fetchCompatBaseQuery } from '@/util/fetchCompatBaseQuery';
import { MakePrimitiveRequiredWithObject, FilteredPropertiesOnlyPrimitiveAndEnum, DeepPartial } from '@/util/types';
import { 
  CreateBoardDto, 
  CreateBoardImageDto, 
  CreateBoardReplyDto, 
  UpdateBoardDto, 
  UpdateBoardImageDto, 
  UpdateBoardReplyDto, 
  SearchBoardDto,
  BoardWithUser,
  Board,
  BoardImage,
  BoardReply
} from './dto/boardsApiDto';

// NOTE Api 이름은 무조건 복수명으로 한다. (NestJS와 동일)
export const boardsApi = createApi({
  // reducerPath 이름은 파일명과 동일하게 맞춘다.
  reducerPath: 'boardsApi',
  // baseQuery 인자는 Nest의 컨트롤러 이름처럼 모든 요청 url의 첫마디를 결정한다.
  baseQuery: fetchCompatBaseQuery('boards'),
  // FIXME 태그 이름은 fetch반환된 데이터 interface명과 같게 하기
  tagTypes: ['Boards', 'Board', 'BoardImage', 'BoardReply'],
  endpoints: (builder) => ({
    // NOTE endpoint 함수의 이름은 find, create, update, remove 로 무조건 시작한다
    
    // Board 생성
    createBoard: builder.mutation<BoardResult, { body: CreateBoardDto }>({
      query: (arg) => ({
        method: 'POST',
        url: 'create',
        body: arg.body,
      }),
      invalidatesTags: ['Boards'],
    }),

    // Board 조회 (검색 및 페이징)
    findAllBoards: builder.mutation<BoardListResponse, SearchBoardDto>({
      query: (searchDto = {}) => {
        const queryParams = new URLSearchParams();
        
        if (searchDto.boardType) queryParams.append('boardType', searchDto.boardType);
        if (searchDto.startDay) queryParams.append('startDay', searchDto.startDay);
        if (searchDto.endDay) queryParams.append('endDay', searchDto.endDay);
        if (searchDto.title) queryParams.append('title', searchDto.title);
        if (searchDto.content) queryParams.append('content', searchDto.content);
        if (searchDto.page) queryParams.append('page', searchDto.page.toString());
        if (searchDto.limit) queryParams.append('limit', searchDto.limit.toString());
        if (searchDto.cafeInfoId) queryParams.append('cafeInfoId', searchDto.cafeInfoId.toString());

        const url = queryParams.toString() ? `?${queryParams.toString()}` : '';
        return {
          method: 'GET',
          url,
        };
      },
    }),

    // Board 상세 조회
    findOneBoard: builder.query<BoardResult, { id: number }>({
      query: (arg) => ({
        method: 'GET',
        url: `${arg.id}`,
      }),
      providesTags: (result) => result ? [
        { type: "Board", id: result.id },
      ] : [
        "Board",
      ],
    }),

    // Board 수정
    updateBoard: builder.mutation<BoardResult, { id: number; body: UpdateBoardDto }>({
      query: (arg) => ({
        method: 'PATCH',
        url: `${arg.id}`,
        body: arg.body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Board', id },
        { type: 'Boards', id: 'LIST' },
      ],
    }),

    // Board 삭제
    removeBoard: builder.mutation<DeleteResponse, { id: number }>({
      query: (arg) => ({
        method: 'DELETE',
        url: `${arg.id}`,
      }),
      invalidatesTags: [{ type: 'Boards', id: 'LIST' }],
    }),

    // BoardImage 생성
    createBoardImage: builder.mutation<BoardImageResult, { boardId: number; body: CreateBoardImageDto }>({
      query: (arg) => ({
        method: 'POST',
        url: `${arg.boardId}/images`,
        body: arg.body,
      }),
      invalidatesTags: (result, error, { boardId }) => [
        { type: 'Board', id: boardId },
        { type: 'BoardImage', id: 'LIST' },
      ],
    }),

    // BoardImage 수정
    updateBoardImage: builder.mutation<BoardImageResult, { imageId: number; body: UpdateBoardImageDto }>({
      query: (arg) => ({
        method: 'PATCH',
        url: `images/${arg.imageId}`,
        body: arg.body,
      }),
      invalidatesTags: (result, error, { imageId }) => [
        { type: 'BoardImage', id: imageId },
        { type: 'BoardImage', id: 'LIST' },
      ],
    }),

    // BoardImage 삭제
    removeBoardImage: builder.mutation<DeleteResponse, { imageId: number }>({
      query: (arg) => ({
        method: 'DELETE',
        url: `images/${arg.imageId}`,
      }),
      invalidatesTags: [{ type: 'BoardImage', id: 'LIST' }],
    }),

    // BoardReply 생성
    createBoardReply: builder.mutation<BoardReplyResult, { boardId: number; body: CreateBoardReplyDto }>({
      query: (arg) => ({
        method: 'POST',
        url: `${arg.boardId}/replies`,
        body: arg.body,
      }),
      invalidatesTags: (result, error, { boardId }) => [
        { type: 'Board', id: boardId },
        { type: 'BoardReply', id: 'LIST' },
      ],
    }),

    // BoardReply 수정
    updateBoardReply: builder.mutation<BoardReplyResult, { replyId: number; body: UpdateBoardReplyDto }>({
      query: (arg) => ({
        method: 'PATCH',
        url: `replies/${arg.replyId}`,
        body: arg.body,
      }),
      invalidatesTags: (result, error, { replyId }) => [
        { type: 'BoardReply', id: replyId },
        { type: 'BoardReply', id: 'LIST' },
      ],
    }),

    // BoardReply 삭제
    removeBoardReply: builder.mutation<DeleteResponse, { replyId: number }>({
      query: (arg) => ({
        method: 'DELETE',
        url: `replies/${arg.replyId}`,
      }),
      invalidatesTags: [{ type: 'BoardReply', id: 'LIST' }],
    }),

    // CafeInfo로 Board 검색
    findAllBoardsByCafeInfo: builder.mutation<BoardListResponse, { cafeInfoId: number; searchDto?: SearchBoardDto }>({
      query: ({ cafeInfoId, searchDto = {} }) => {
        const queryParams = new URLSearchParams();
        
        if (searchDto.boardType) queryParams.append('boardType', searchDto.boardType);
        if (searchDto.startDay) queryParams.append('startDay', searchDto.startDay);
        if (searchDto.endDay) queryParams.append('endDay', searchDto.endDay);
        if (searchDto.title) queryParams.append('title', searchDto.title);
        if (searchDto.content) queryParams.append('content', searchDto.content);
        if (searchDto.page) queryParams.append('page', searchDto.page.toString());
        if (searchDto.limit) queryParams.append('limit', searchDto.limit.toString());

        const url = queryParams.toString() 
          ? `cafe/${cafeInfoId}?${queryParams.toString()}` 
          : `cafe/${cafeInfoId}`;
        
        return {
          method: 'GET',
          url,
        };
      },
    }),
  }),
});

export const {
  // Board 관련
  useCreateBoardMutation,
  useFindAllBoardsMutation,
  useFindOneBoardQuery,
  useUpdateBoardMutation,
  useRemoveBoardMutation,
  
  // BoardImage 관련
  useCreateBoardImageMutation,
  useUpdateBoardImageMutation,
  useRemoveBoardImageMutation,
  
  // BoardReply 관련
  useCreateBoardReplyMutation,
  useUpdateBoardReplyMutation,
  useRemoveBoardReplyMutation,
  
  // 특별 기능
  useFindAllBoardsByCafeInfoMutation,
} = boardsApi;

// 응답 타입 정의
interface BoardListResponse {
  boards: BoardResult[];
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
export type BoardResult = MakePrimitiveRequiredWithObject<Board>;
export type BoardWithUserResult = MakePrimitiveRequiredWithObject<BoardWithUser>;
export type BoardImageResult = MakePrimitiveRequiredWithObject<BoardImage>;
export type BoardReplyResult = MakePrimitiveRequiredWithObject<BoardReply>;

export type BoardUpdateInput = Omit<DeepPartial<FilteredPropertiesOnlyPrimitiveAndEnum<Board>>, "id">;
export type BoardCreateInput = Omit<Omit<Omit<Required<FilteredPropertiesOnlyPrimitiveAndEnum<Board>>, "id">, "createdAt">, "updatedAt">;
