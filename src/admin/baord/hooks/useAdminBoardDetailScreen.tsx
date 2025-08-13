import { useState, useEffect, useCallback } from 'react';
import { useFindOneBoardQuery, useUpdateBoardMutation, useCreateBoardImageMutation, BoardResult } from '@/api/boardsApi';
import { useFindAllPlacesByAdminMutation } from '@/api/cafeInfosApi';
import { UpdateBoardDto, UpdateBoardImageDto, CreateBoardImageDto } from '@/api/dto/boardsApiDto';
import { CafeInfoResult } from '@/api/cafeInfosApi';
import { useRouter, useParams } from 'next/navigation';
import { BoardImage, BoardType } from '@/data/prisma-client';

interface hookMember {
  board: BoardResult | undefined
  boardImages: BoardImage[]
  searchCafes: (searchParams: { page: number; take: number; searchText?: string }) => Promise<void>
  cafes: CafeInfoResult[]
  isSearchingCafes: boolean
  isLoading: boolean
  isEditing: boolean
  formData: UpdateBoardDto
  handleInputChange: (field: keyof UpdateBoardDto, value: string | boolean | BoardType) => void
  handleSave: () => Promise<void>
  handleCancel: () => void
  handleBack: () => void
  error: Error | null
  updateBoardWithImages: (boardData: UpdateBoardDto, images: UpdateBoardImageDto[]) => Promise<void>
  handleEditMode: () => void
  noEndDate: boolean
  handleNoEndDateChange: (checked: boolean) => void
  setEditMode: (editing: boolean) => void
}

export const useAdminBoardDetailScreen = (): hookMember => {
  const router = useRouter();
  const params = useParams();
  const boardId = Number(params.id) || 0;

  const [cafes, setCafes] = useState<CafeInfoResult[]>([]);
  const [isSearchingCafes, setIsSearchingCafes] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { data: board, isLoading: isLoadingBoard, error: boardError } = useFindOneBoardQuery({ id: boardId });
  const [updateBoard, { isLoading: isUpdating }] = useUpdateBoardMutation();
  const [createBoardImage, { isLoading: isCreatingImage }] = useCreateBoardImageMutation();
  const [findAllPlacesByAdmin, { isLoading: isSearchingPlaces }] = useFindAllPlacesByAdminMutation();

  const [formData, setFormData] = useState<UpdateBoardDto>({
    title: '',
    content: '',
    link: '',
    startDay: '',
    endDay: '',
    isReplyAvaliable: true,
    boardType: 'GENERAL',
    cafeInfoIds: []
  });

  const [isEditing, setIsEditing] = useState(false);
  const [noEndDate, setNoEndDate] = useState(false);

  useEffect(() => {
    if (board) {
      setFormData({
        title: board.title || '',
        content: board.content || '',
        link: board.link || '',
        startDay: board.startDay ? board.startDay.toString() : '',
        endDay: board.endDay ? board.endDay.toString() : '',
        isReplyAvaliable: board.isReplyAvaliable ?? true,
        boardType: board.boardType || 'GENERAL',
        cafeInfoIds: []
      });
      setNoEndDate(!board.endDay);
    }
  }, [board]);

  const handleInputChange = (field: keyof UpdateBoardDto, value: string | boolean | BoardType) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNoEndDateChange = (checked: boolean) => {
    setNoEndDate(checked);
    if (checked) {
      setFormData(prev => ({ ...prev, endDay: '' }));
    }
  };

  const handleSave = async () => {
    try {
      await updateBoard({
        id: boardId,
        body: {
          ...formData,
          startDay: formData.startDay || undefined,
          endDay: noEndDate ? undefined : (formData.endDay || undefined)
        }
      });

      alert('게시판이 성공적으로 수정되었습니다.');
      setIsEditing(false);
    } catch (error) {
      console.error('게시판 수정 실패:', error);
      alert('게시판 수정에 실패했습니다.');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // 원래 데이터로 복원
    if (board) {
      setFormData({
        title: board.title || '',
        content: board.content || '',
        link: board.link || '',
        startDay: board.startDay ? board.startDay.toString() : '',
        endDay: board.endDay ? board.endDay.toString() : '',
        isReplyAvaliable: board.isReplyAvaliable ?? true,
        boardType: board.boardType || 'GENERAL',
        cafeInfoIds: []
      });
      setNoEndDate(!board.endDay);
    }
  };

  const handleBack = () => {
    router.push('/admin/board');
  };

  const handleEditMode = () => {
    setIsEditing(true);
  };

  const setEditMode = (editing: boolean) => {
    setIsEditing(editing);
  };

  // 에러 처리
  useEffect(() => {
    if (boardError) {
      setError(boardError as Error);
    }
  }, [boardError]);

  const searchCafes = useCallback(async (searchParams: {
    page: number;
    take: number;
    searchText?: string;
  }) => {
    try {
      setIsSearchingCafes(true);
      setError(null);
      
      const result = await findAllPlacesByAdmin({
        page: searchParams.page,
        take: searchParams.take,
        searchText: searchParams.searchText
      }).unwrap();
      
      setCafes(result.data);
    } catch (err) {
      setError(err as Error);
      console.error('카페 검색 실패:', err);
    } finally {
      setIsSearchingCafes(false);
    }
  }, [findAllPlacesByAdmin]);

  const updateBoardWithImages = useCallback(async (boardData: UpdateBoardDto, images: UpdateBoardImageDto[]) => {
    try {
      // 게시판 수정
      await updateBoard({
        id: boardId,
        body: boardData
      }).unwrap();
      
      // 이미지 처리 (새로 추가된 이미지들)
      for (const image of images) {
        if (!('id' in image)) { // 새로 추가된 이미지 (id가 없는 경우)
          const createImageData: CreateBoardImageDto = {
            url: image.url!,
            thumbnailUrl: image.thumbnailUrl!,
            width: image.width!,
            height: image.height!,
            size: image.size!,
            isThumb: image.isThumb
          };
          await createBoardImage({
            boardId,
            body: createImageData
          });
        }
      }
    } catch (err) {
      console.error('게시판 수정 실패:', err);
      throw err;
    }
  }, [updateBoard, createBoardImage, boardId]);

  return {
    board,
    boardImages: board?.BoardImages || [],
    searchCafes,
    cafes,
    isSearchingCafes: isSearchingCafes || isSearchingPlaces,
    isLoading: isLoadingBoard || isUpdating || isCreatingImage,
    error,
    isEditing,
    formData,
    handleInputChange,
    handleSave,
    handleCancel,
    handleBack,
    updateBoardWithImages,
    handleEditMode,
    noEndDate,
    handleNoEndDateChange,
    setEditMode
  };
};
