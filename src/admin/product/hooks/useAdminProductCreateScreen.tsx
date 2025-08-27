import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import fetchImage, { deleteImage, getFileSize, getImageSize } from '@/util/fetchImage';
import { imageResizer } from '@/common/image/imageResizer';
import { useTypedSelector } from '@/store';
import { CafeInfoResult } from '@/api/cafeInfosApi';
import { CreateProductDto, CreateProductImageDto } from '@/api/dto/productsApiDto';
import { useCreateProductMutation, useFindDuplicateProductCodeMutation } from '@/api/productsApi';

interface UploadImageData extends CreateProductImageDto {
  file: File;
  thumbnailFile: File;
}

export const useAdminProductCreateScreen = () => {

  const router = useRouter();
  const [formData, setFormData] = useState<CreateProductDto>({
    name: '',
    code: '',
    description: '',
    price: 0,
    originalPrice: 0,
    stockQuantity: 0,
    minOrderQuantity: 0,
    isAvailable: true,
    categoryId: 0,
    cafeInfoId: 0,
  });

  const [duplicateCode, setDuplicateCode] = useState<boolean|undefined>(undefined);
  const [images, setImages] = useState<UploadImageData[]>([]);
  const [thumbnailImage, setThumbnailImage] = useState<UploadImageData|undefined>(undefined);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [checkProductCode] = useFindDuplicateProductCodeMutation();

  const token = useTypedSelector((state) => state.account?.accessToken ?? undefined);

  const handleInputChange = (field: keyof CreateProductDto, value: string | boolean | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: typeof prev[field] === 'number' ? Number(value) : value
    }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // 실제 구현에서는 이미지 업로드 API를 호출하여 URL을 받아야 함
      const newImages: UploadImageData[] = [];
      for (let index = 0; index < files.length; index++) {
        const file = files[index];
        if (file && file.size === 0) continue;
        const compressedFile = await getCompressedImage(file, 3, 1024);
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

  const handleThumbnailImageUpload = (targetImage: UploadImageData) => {
    setThumbnailImage(targetImage);
  }

  const checkDuplicateCode = useCallback(async (code: string) => {

    if(code.trim() === '') {
      alert('상품코드를 입력해주세요.');
      setDuplicateCode(undefined);
      return;
    }

    const response = await checkProductCode({
      code: code
    });
    setDuplicateCode(response.data ?? undefined);

    if(response.data === false) {
      alert('사용 가능한 상품코드입니다.');
    } else {
      alert('상품코드가 중복됩니다.');
    }
  }, [checkProductCode]);

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    if(thumbnailImage === images[index]) {
      setThumbnailImage(undefined);
    }
  };

  const handleCategorySelect = useCallback((categoryId: number|undefined) => {
    setFormData(prev => ({
      ...prev,
      categoryId: categoryId ?? 0
    }));
  }, []);

  const handleCafeSelect = useCallback((cafes: CafeInfoResult[]) => {
    setFormData(prev => ({
      ...prev,
      cafeInfoId: cafes.length > 0 ? cafes[0].id : 0
    }));
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if(isCreatingProduct) {
      alert('이미 생성 중입니다.');
      return;
    }

    if (!formData.name) {
      alert('상품명을 입력해주세요.');
      return;
    }

    if (!formData.code) {
      alert('상품코드를 입력해주세요.');
      return;
    }

    if(duplicateCode === undefined) {
      alert('상품코드 중복 확인해주세요');
      return;
    } else if(duplicateCode === true) {
      alert('상품코드가 중복됩니다.');
      return;
    }

    if(!formData.price || isNaN(formData.price) || formData.price <= 0) {
      alert('가격을 입력해주세요.');
      return;
    }

    if (!formData.stockQuantity || isNaN(formData.stockQuantity) || formData.stockQuantity <= 0) {
      alert('재고를 입력해주세요.');
      return;
    }

    if(formData.originalPrice && (isNaN(formData.originalPrice) || formData.originalPrice <= 0)) {
      alert('원가를 정상적으로 입력해주세요.');
      return;
    }

    if(formData.minOrderQuantity && (isNaN(formData.minOrderQuantity) || formData.minOrderQuantity <= 0)) {
      alert('최소 주문 수량을 정상적으로 입력해주세요.');
      return;
    }

    if(formData.categoryId <= 0) {
      alert('카테고리를 선택해주세요.');
      return;
    }

    if(images.length === 0) {
      alert('이미지를 추가해주세요.');
      return;
    }

    if(thumbnailImage === undefined) {
      alert('썸네일 이미지를 선택해주세요.');
      return;
    }

    let imageUrls: string[] = [];

    try {

      setIsCreatingProduct(true);
      // 이미지 업로드

      const form = new FormData();

      let productImages: CreateProductImageDto[]|undefined = undefined;

      if (images.length > 0) {

        for (const image of images) {
          image.isThumb = thumbnailImage === image;
          form.append('image', image.file);
          form.append('thumbnail', image.thumbnailFile);
        }
        const imageResponse = await fetchImage(token, form, `product`); // 이미지 업로드

        imageUrls = imageResponse.map(image => image.url);
        imageUrls.push(...imageResponse.filter(image => image.thumbnailUrl).map(image => image.thumbnailUrl!));

        productImages = imageResponse.map((image, index) => ({
          url: image.url,
          thumbnailUrl: image.thumbnailUrl ?? '',
          width: images[index].width,
          height: images[index].height,
          size: images[index].size,
          isThumb: images[index].isThumb
        }));

      }

      const product = await createProduct({
        body: {
          ...formData,
          description: formData.description?.trim() === '' ? undefined : formData.description,
          originalPrice: formData.originalPrice && formData.originalPrice > 0 ? formData.originalPrice : undefined, // 원가가 0이면 빼기
          cafeInfoId: formData.cafeInfoId && formData.cafeInfoId > 0 ? formData.cafeInfoId : undefined, // 카페 정보가 없으면 빼기
          minOrderQuantity: formData.minOrderQuantity && formData.minOrderQuantity > 0 ? formData.minOrderQuantity : 1, // 최소 주문 수량이 0이면 1로 설정
          stockQuantity: formData.stockQuantity && formData.stockQuantity > 0 ? formData.stockQuantity : 1, // 재고가 0이면 1로 설정
          productImages: productImages ?? undefined
        }
      });

      if (product.error) {
        throw new Error(product.error as unknown as string);
      }

      alert('상품이 성공적으로 생성되었습니다.');
      router.push('/admin/product');
    } catch (error) {
      console.error('상품 생성 실패:', error);

      if (imageUrls.length > 0 && token) deleteImage(token, imageUrls);

      alert('상품 생성에 실패했습니다.');
    } finally {
      setIsCreatingProduct(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/board');
  };

  return {
    isCreating: isCreating,
    formData,
    handleInputChange,
    handleImageUpload,
    handleThumbnailImageUpload,
    handleRemoveImage,
    handleCategorySelect,
    handleCafeSelect,
    handleSubmit,
    handleCancel,
    images,
    isCreatingProduct,
    duplicateCode,
    thumbnailImage,
    checkDuplicateCode
  };
};
