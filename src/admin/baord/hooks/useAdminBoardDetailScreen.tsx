import { useState, useEffect, useCallback } from 'react';
import { useFindOneBoardQuery, useUpdateBoardMutation, useCreateBoardImageMutation } from '@/api/boardsApi';
import { useFindAllPlacesBySearchMutation } from '@/api/cafeInfosApi';
import { UpdateBoardDto, UpdateBoardImageDto, CreateBoardImageDto } from '@/api/dto/boardsApiDto';
import { CafeInfoResult } from '@/api/cafeInfosApi';
import { useRouter, useParams } from 'next/navigation';
import { BoardType } from '@/data/prisma-client';
import fetchImage, { deleteImage, getFileSize, getImageSize } from '@/util/fetchImage';
import { imageResizer } from '@/common/image/imageResizer';
import { useTypedSelector } from '@/store';

// interface hookMember {
//   board: BoardResult | undefined
//   boardImages: BoardImage[]
//   searchCafes: (searchParams: { page: number; take: number; searchText?: string }) => Promise<void>
//   cafes: CafeInfoResult[]
//   isSearchingCafes: boolean
//   isLoading: boolean
//   isEditing: boolean
//   formData: UpdateBoardDto
//   handleInputChange: (field: keyof UpdateBoardDto, value: string | boolean | BoardType) => void
//   handleSave: () => Promise<void>
//   handleCancel: () => void
//   handleBack: () => void
//   error: Error | null
//   updateBoardWithImages: (boardData: UpdateBoardDto, images: UpdateBoardImageDto[]) => Promise<void>
//   handleEditMode: () => void
//   noEndDate: boolean
//   handleNoEndDateChange: (checked: boolean) => void
//   setEditMode: (editing: boolean) => void
// }

interface UploadImageData extends CreateBoardImageDto {
  file: File | null;
  thumbnailFile: File | null;
  id?: number;
}

export const useAdminBoardDetailScreen = () => {
  const router = useRouter();
  const params = useParams();
  const boardId = Number(params.id) || 0;

  const [cafes, setCafes] = useState<CafeInfoResult[]>([]);
  const [isSearchingCafes, setIsSearchingCafes] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const token = useTypedSelector((state) => state.account?.accessToken ?? undefined);

  const [images, setImages] = useState<UploadImageData[]>([]);
  const [uploadImages, setUploadImages] = useState<UploadImageData[]>([]);
  const [selectedCafeInfos, setSelectedCafeInfos] = useState<CafeInfoResult[]>([]);
  const [prevSelectedCafeInfos, setPrevSelectedCafeInfos] = useState<CafeInfoResult[]>([]);
  const [curOptionCafeInfos, setCurOptionCafeInfos] = useState<CafeInfoResult[]>([]);
  const [cafeSearchText, setCafeSearchText] = useState<string>('');

  const { data: board, isLoading: isLoadingBoard, error: boardError } = useFindOneBoardQuery({ id: boardId });
  const [updateBoard, { isLoading: isUpdating }] = useUpdateBoardMutation();
  const [createBoardImage, { isLoading: isCreatingImage }] = useCreateBoardImageMutation();
  const [findAllPlaces, { isLoading: isSearchingPlaces }] = useFindAllPlacesBySearchMutation();
  const [isUpdatingBoard, setIsUpdatingBoard] = useState(false);

  const [formData, setFormData] = useState<UpdateBoardDto>({
    title: '',
    content: '',
    link: '',
    startDay: '',
    endDay: '',
    isReplyAvaliable: true,
    boardType: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [noEndDate, setNoEndDate] = useState(false);

  useEffect(() => {
    if (board) {
      // 한국 시간(UTC+9)을 UTC로 변환
      const startDay = new Date(board.startDay);
      const koreaTimeOffset = 9 * 60; // 한국은 UTC+9
      const utcStartDay = new Date(startDay.getTime() - (koreaTimeOffset * 60000));

      const endDay = new Date(board.endDay);
      const utcEndDay = new Date(endDay.getTime() - (koreaTimeOffset * 60000));

      setFormData({
        title: board.title || '',
        content: board.content || '',
        link: board.link || '',
        startDay: board.startDay ? utcStartDay.toISOString().split('T')[0] : '',
        endDay: board.endDay ? utcEndDay.toISOString().split('T')[0] : '',
        isReplyAvaliable: board.isReplyAvaliable ?? true,
        boardType: board.boardType || '',
      });
      const selectedCafeInfos = board.CafeBoards?.map(cafe => cafe.CafeInfo).filter(cafe => cafe !== undefined) as CafeInfoResult[] || [];
      setPrevSelectedCafeInfos(selectedCafeInfos);
      setSelectedCafeInfos(selectedCafeInfos);

      console.log(board.startDay, new Date(board.startDay).toLocaleDateString());
      console.log(board.endDay);
      setNoEndDate(!board.endDay);
      if (board.BoardImages) {
        setImages(board.BoardImages.map(image => {
          return {
            ...image,
            isDisable: false,
            file: null,
            thumbnailFile: null,
            id: image.id
          }
        }));
      }
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

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();

    if (isUpdatingBoard) {
      alert('이미 저장 중입니다.');
      return;
    }

    if (!board) {
      alert('유효하지 않은 게시판입니다.');
      return;
    }

    setIsUpdatingBoard(true);
    let imageUrls: string[] = [];
    try {
      const newImages = images.filter(image => !image.isDisable && image.id === undefined);

      let boardImages: CreateBoardImageDto[] | undefined = undefined;
      if (newImages.length > 0 && board?.boardType) {
        const form = new FormData();
        for (const image of newImages) {
          form.append('image', image.file!);
          form.append('thumbnail', image.thumbnailFile!);
        }
        const imageResponse = await fetchImage(token, form, `board/${board.boardType.toLowerCase()}`); // 이미지 업로드
        imageUrls = imageResponse.map(image => image.url);
        imageUrls.push(...imageResponse.filter(image => image.thumbnailUrl).map(image => image.thumbnailUrl!));

        boardImages = imageResponse.map((image, index) => ({
          url: image.url,
          thumbnailUrl: image.thumbnailUrl ?? '',
          width: images[index].width,
          height: images[index].height,
          size: images[index].size,
          isThumb: images[index].isThumb
        }));
      }

      const removeImageIds = images.filter(image => image.isDisable && image.id !== undefined).map(image => image.id!);

             // startDay: 해당 날짜 00:00:01 (한국 시간)으로 DB에 저장
       let koreaStartTime: string | undefined = undefined;
       if (formData.startDay) {
         const startDay = new Date(formData.startDay + 'T00:00:01+09:00');
         koreaStartTime = startDay.toISOString();
       }

      // endDay: 해당 날짜 23:59:59.999 (한국 시간)으로 DB에 저장
      let koreaEndTime: string | undefined = undefined;
      if (!noEndDate && formData.endDay) {
        const endDay = new Date(formData.endDay + 'T23:59:59.999+09:00');
        koreaEndTime = endDay.toISOString();
      }

      let cafeInfoIds: number[] | undefined = selectedCafeInfos.map(cafe => cafe.id);
      if (prevSelectedCafeInfos.every(cafe => selectedCafeInfos.find(selectedCafe => selectedCafe.id === cafe.id))) {
        cafeInfoIds = undefined;
      }

      // 다른 점이 없으면 undefined로 변경
      await updateBoard({
        id: boardId,
        body: {
          title: board.title === formData.title ? undefined : formData.title,
          content: board.content === formData.content ? undefined : formData.content,
          link: board.link === formData.link ? undefined : formData.link,
          isReplyAvaliable: board.isReplyAvaliable === formData.isReplyAvaliable ? undefined : formData.isReplyAvaliable,
          boardType: board.boardType === formData.boardType ? undefined : formData.boardType,
          startDay: board.startDay === formData.startDay ? undefined : koreaStartTime,
          endDay: board.endDay === formData.endDay ? undefined : koreaEndTime,
          removeImageIds: removeImageIds.length > 0 ? removeImageIds : undefined,
          boardImages,
          cafeInfoIds
        }
      });

      alert('게시판이 성공적으로 수정되었습니다.');
      setIsEditing(false);
    } catch (error) {
      console.error('게시판 수정 실패:', error);
      if (imageUrls.length > 0 && token) deleteImage(token, imageUrls);
      alert('게시판 수정에 실패했습니다.');
    } finally {
      setIsUpdatingBoard(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // 원래 데이터로 복원
    if (board) {
      // 한국 시간(UTC+9)을 UTC로 변환
      const startDay = new Date(board.startDay);
      const koreaTimeOffset = 9 * 60; // 한국은 UTC+9
      const utcStartDay = new Date(startDay.getTime() - (koreaTimeOffset * 60000));

      const endDay = new Date(board.endDay);
      const utcEndDay = new Date(endDay.getTime() - (koreaTimeOffset * 60000));

      setFormData({
        title: board.title || '',
        content: board.content || '',
        link: board.link || '',
        startDay: board.startDay ? utcStartDay.toISOString().split('T')[0] : '',
        endDay: board.endDay ? utcEndDay.toISOString().split('T')[0] : '',
        isReplyAvaliable: board.isReplyAvaliable ?? true,
        boardType: board.boardType || '',
      });
      setNoEndDate(!board.endDay);
    }
  };

  const handleCafeSearch = () => {
    if (!isEditing) return;
    searchCafes({
      page: 0,
      take: 10,
      searchText: cafeSearchText.trim()
    });
  };

  const onChangeCafeSearchText = (searchText: string) => {
    setCafeSearchText(searchText);
  };

  const handleCafeSelect = (cafeInfo: CafeInfoResult) => {
    setSelectedCafeInfos(prev => prev.includes(cafeInfo) ? prev.filter(cafe => cafe.id !== cafeInfo.id) : [...prev, cafeInfo]);
  };

  // 이미지 disable
  const handleRemoveImage = (index: number) => {
    const image = [...images];
    image[index].isDisable = !image[index].isDisable;
    setImages(image);
  };

  useEffect(() => {
    setImages(prev => [...prev, ...uploadImages.filter((image): image is NonNullable<typeof image> => image !== null)]);
  }, [uploadImages]);

  useEffect(() => {
    setCurOptionCafeInfos([...prevSelectedCafeInfos, ...selectedCafeInfos.filter(cafe => !prevSelectedCafeInfos.find(selectedCafe => selectedCafe.id === cafe.id))]);
  }, [selectedCafeInfos, prevSelectedCafeInfos]);

  const isCafeSelected = useCallback((cafe: CafeInfoResult) => {
    return selectedCafeInfos.findIndex(selectedCafe => selectedCafe.id === cafe.id) !== -1;
  }, [selectedCafeInfos]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // 실제 구현에서는 이미지 업로드 API를 호출하여 URL을 받아야 함
      const newImages: UploadImageData[] = [];
      for (let index = 0; index < files.length; index++) {
        const file = files[index];
        if (file && file.size === 0) continue;
        const compressedFile = await getCompressedImage(file, 4, 1280);
        const thumbnailFile = await getCompressedImage(file, 1, 320);
        if (!compressedFile || !thumbnailFile) return;
        newImages.push({
          file: compressedFile.compressedFile,
          thumbnailFile: thumbnailFile.compressedFile,
          url: URL.createObjectURL(compressedFile.compressedFile),
          thumbnailUrl: URL.createObjectURL(thumbnailFile.compressedFile),
          width: compressedFile.compressedFileData.width,
          height: compressedFile.compressedFileData.height,
          size: compressedFile.compressedFileData.size,
          isThumb: index === 0 // 첫 번째 이미지를 썸네일로 설정
        })
      }
      setUploadImages(prev => [...prev, ...newImages.filter((image): image is NonNullable<typeof image> => image !== null)]);
    }
  };

  const getCompressedImage = async (file: File, maxSizeMB: number, maxWidthOrHeight: number) => {
    const compressedFile = await imageResizer(file, { maxSizeMB, maxWidthOrHeight });
    if (!compressedFile) return null;

    const size = getFileSize(compressedFile);
    const { width, height } = await getImageSize(compressedFile);

    return {
      compressedFile,
      compressedFileData: {
        url: URL.createObjectURL(compressedFile),
        width,
        height,
        size
      }
    }

  }

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

      const result = await findAllPlaces({
        skip: searchParams.page * searchParams.take,
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
  }, [findAllPlaces]);

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
    setEditMode,
    onChangeCafeSearchText,
    handleCafeSelect,
    cafeSearchText,
    images,
    selectedCafeInfos,
    prevSelectedCafeInfos,
    curOptionCafeInfos,
    isCafeSelected,
    handleCafeSearch,
    handleImageUpload,
    handleRemoveImage,
    isUpdatingBoard
  };
};
