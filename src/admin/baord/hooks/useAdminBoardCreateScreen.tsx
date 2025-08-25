import { useState, useCallback } from 'react';
import { useCreateBoardMutation, useCreateBoardImageMutation } from '@/api/boardsApi';
import { CreateBoardDto, CreateBoardImageDto } from '@/api/dto/boardsApiDto';
import { useRouter } from 'next/navigation';
import { BoardType } from '@/data/prisma-client';
import fetchImage, { deleteImage, getFileSize, getImageSize } from '@/util/fetchImage';
import { imageResizer } from '@/common/image/imageResizer';
import { useTypedSelector } from '@/store';
import { CafeInfoResult } from '@/api/cafeInfosApi';
interface UploadImageData extends CreateBoardImageDto {
  file: File;
  thumbnailFile: File;
}

export const useAdminBoardCreateScreen = () => {

  const router = useRouter();
  const [formData, setFormData] = useState<CreateBoardDto>({
    title: '',
    content: '',
    link: '',
    startDay: '',
    endDay: '',
    isReplyAvaliable: true,
    boardType: 'GENERAL',
    cafeInfoIds: []
  });

  const [images, setImages] = useState<UploadImageData[]>([]);
  const [noEndDate, setNoEndDate] = useState(false);



  const [isCreatingCafe, setIsCreatingCafe] = useState(false);

  const [createBoard, { isLoading: isCreating }] = useCreateBoardMutation();
  const [createBoardImage, { isLoading: isCreatingImage }] = useCreateBoardImageMutation();

  const token = useTypedSelector((state) => state.account?.accessToken ?? undefined);



  const createBoardWithImages = useCallback(async (boardData: CreateBoardDto, images: CreateBoardImageDto[]) => {
    try {
      // 게시판 생성
      const board = await createBoard({ body: boardData }).unwrap();

      // 이미지 업로드
      for (const image of images) {
        await createBoardImage({
          boardId: board.id,
          body: image
        });
      }

      return board;
    } catch (err) {
      console.error('게시판 생성 실패:', err);
      throw err;
    }
  }, [createBoard, createBoardImage]);

  const handleInputChange = (field: keyof CreateBoardDto, value: string | boolean | BoardType) => {
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
      setImages(prev => [...prev, ...newImages.filter((image): image is NonNullable<typeof image> => image !== null)]);
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

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };



  const handleCafeSelect = (cafes: CafeInfoResult[]) => {
    setFormData(prev => ({
      ...prev,
      cafeInfoIds: cafes.map(cafe => cafe.id)
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if(isCreatingCafe) {
      alert('이미 생성 중입니다.');
      return;
    }

    if (!formData.boardType) {
      alert('게시판 타입을 선택해주세요.');
      return;
    }

    if (!formData.title) {
      alert('제목을 입력해주세요.');
      return;
    }

    if (!formData.startDay) {
      alert('시작일을 선택해주세요.');
      return;
    }

    if(!noEndDate && !formData.endDay) {
      alert('종료일을 입력해주세요.');
      return;
    }

    if(images.length === 0) {
      alert('이미지를 추가해주세요.');
      return;
    }

    let imageUrls: string[] = [];

    try {

      setIsCreatingCafe(true);
      // 이미지 업로드

      const form = new FormData();

      let boardImages: CreateBoardImageDto[]|undefined = undefined;

      if (images.length > 0) {

        for (const image of images) {
          form.append('image', image.file);
          form.append('thumbnail', image.thumbnailFile);
        }
        const imageResponse = await fetchImage(token, form, `board/${formData.boardType.toLowerCase()}`); // 이미지 업로드

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

      // startDay: 해당 날짜 00:00:01 (한국 시간)으로 DB에 저장
      const startDay = new Date(formData.startDay + 'T00:00:01+09:00');

      // endDay: 해당 날짜 23:59:59.999 (한국 시간)으로 DB에 저장
      let koreaEndTime: string | undefined = undefined;
      if (!noEndDate && formData.endDay) {
        const endDay = new Date(formData.endDay + 'T23:59:59.999+09:00');
        koreaEndTime = endDay.toISOString();
      }

      // 게시판 생성 (한국 시간으로 변환된 값들을 DB에 저장)
      const board = await createBoard({
        body: {
          ...formData,
          startDay: startDay.toISOString(),
          endDay: noEndDate ? undefined : koreaEndTime,
          boardImages: boardImages ?? undefined
        }
      });

      if (board.error) {
        throw new Error(board.error as unknown as string);
      }

      alert('게시판이 성공적으로 생성되었습니다.');
      router.push('/admin/board');
    } catch (error) {
      console.error('게시판 생성 실패:', error);

      if (imageUrls.length > 0 && token) deleteImage(token, imageUrls);

      alert('게시판 생성에 실패했습니다.');
    } finally {
      setIsCreatingCafe(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/board');
  };

  return {
    isCreating: isCreating || isCreatingImage,
    formData,
    handleInputChange,
    handleNoEndDateChange,
    handleImageUpload,
    handleRemoveImage,
    handleCafeSelect,
    handleSubmit,
    handleCancel,
    images,
    createBoardWithImages,
    isCreatingCafe,
    noEndDate
  };
};
