import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import fetchImage, { deleteImage, getFileSize, getImageSize } from '@/util/fetchImage';
import { imageResizer } from '@/common/image/imageResizer';
import { useTypedSelector } from '@/store';
import { CafeInfoResult } from '@/api/cafeInfosApi';
import { CreateProductImageDto, UpdateProductDto } from '@/api/dto/productsApiDto';
import { useFindDuplicateProductCodeMutation, useUpdateProductMutation, useFindOneProductQuery } from '@/api/productsApi';

interface UploadImageData extends CreateProductImageDto {
  file: File | null;
  thumbnailFile: File | null;
  id?: number;
}

export const useAdminProductDetailScreen = () => {

  const router = useRouter();
  const params = useParams();
  const id = Number(params.id) || 0;

  const [error, setError] = useState<Error | null>(null);

  const [formData, setFormData] = useState<UpdateProductDto>({
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
    productImages: [],
  });

  const { data: product, isLoading: isLoadingProduct, error: productError, refetch: refetchProduct } = useFindOneProductQuery({
    id: id
  });

  const [duplicateCode, setDuplicateCode] = useState<boolean | undefined>(undefined);
  const [images, setImages] = useState<UploadImageData[]>([]);
  const [thumbnailImage, setThumbnailImage] = useState<UploadImageData | undefined>(undefined);
  const [isEditing, setIsEditing] = useState(false);
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [checkProductCode] = useFindDuplicateProductCodeMutation();

  const token = useTypedSelector((state) => state.account?.accessToken ?? undefined);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name ?? '',
        code: product.code ?? '',
        description: product.description ?? '',
        price: product.price ?? 0,
        originalPrice: product.originalPrice ?? 0,
        stockQuantity: product.stockQuantity ?? 0,
        minOrderQuantity: product.minOrderQuantity ?? 0,
        isAvailable: product.isAvailable ?? true,
        categoryId: product.categoryId,
        cafeInfoId: product.cafeInfoId ?? 0,
        // productImages: product.ProductImages ?? [],
      });

      if (product.ProductImages) {
        const images = product.ProductImages.map(image => {
          return {
            ...image,
            file: null,
            thumbnailFile: null,
            id: image.id
          }
        })
        setImages(images);
        setThumbnailImage(images.find(image => image.isThumb) ?? undefined);
      }
    }
  }, [product]);

  useEffect(() => {
    if (productError) {
      setError(productError as Error);
    }
  }, [productError]);

  const handleEditMode = (editMode: boolean) => {
    setIsEditing(editMode);
  }

  const handleBack = () => {
    router.push('/admin/product');
  }

  const handleInputChange = (field: keyof UpdateProductDto, value: string | boolean | number) => {
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

  const checkDuplicateCode = useCallback(async (code: string | undefined) => {

    if (!code || code.trim() === '') {
      alert('상품코드를 입력해주세요.');
      setDuplicateCode(undefined);
      return;
    }

    const response = await checkProductCode({
      code: code
    });
    setDuplicateCode(response.data ?? undefined);

    if (response.data === false) {
      alert('사용 가능한 상품코드입니다.');
    } else {
      alert('상품코드가 중복됩니다.');
    }
  }, [checkProductCode]);

  const handleRemoveImage = (index: number) => {
    const image = [...images];
    image[index].isDisable = !image[index].isDisable;
    setImages(image);
    if (thumbnailImage === images[index] && image[index].isDisable) {
      setThumbnailImage(undefined);
    }
  };

  const handleCategorySelect = useCallback((categoryId: number | undefined) => {
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

    if (isUpdating) {
      alert('이미 수정 중입니다.');
      return;
    }

    if (!product) {
      alert('유효하지 않은 상품입니다.');
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

    if (formData.code !== product?.code) {
      if (duplicateCode === undefined) {
        alert('상품코드 중복 확인해주세요');
        return;
      } else if (duplicateCode === true) {
        alert('상품코드가 중복됩니다.');
        return;
      }
    }


    if (!formData.price || isNaN(formData.price) || formData.price <= 0) {
      alert('가격을 입력해주세요.');
      return;
    }

    if (!formData.stockQuantity || isNaN(formData.stockQuantity) || formData.stockQuantity <= 0) {
      alert('재고를 입력해주세요.');
      return;
    }

    if (formData.originalPrice && (isNaN(formData.originalPrice) || formData.originalPrice <= 0)) {
      alert('원가를 정상적으로 입력해주세요.');
      return;
    }

    if (formData.minOrderQuantity && (isNaN(formData.minOrderQuantity) || formData.minOrderQuantity <= 0)) {
      alert('최소 주문 수량을 정상적으로 입력해주세요.');
      return;
    }

    if (formData.categoryId && formData.categoryId <= 0) {
      alert('카테고리를 선택해주세요.');
      return;
    }

    if (images.length === 0) {
      alert('이미지를 추가해주세요.');
      return;
    }

    if (thumbnailImage === undefined) {
      alert('썸네일 이미지를 선택해주세요.');
      return;
    }

    let imageUrls: string[] = [];

    try {

      setIsEditing(true);
      // 이미지 업로드

      const newImages = images.filter(image => !image.isDisable && image.id === undefined);

      let productImages: CreateProductImageDto[] | undefined = undefined;
      if (newImages.length > 0) {
        const form = new FormData();
        for (const image of newImages) {
          image.isThumb = thumbnailImage === image;
          form.append('image', image.file!);
          form.append('thumbnail', image.thumbnailFile!);
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

      const removeImageIds = images.filter(image => image.isDisable && image.id !== undefined).map(image => image.id!);

      const updateProductResponse = await updateProduct({
        id: product.id,
        body: {
          ...formData,
          description: product.description === formData.description ? undefined : formData.description,
          originalPrice: product.originalPrice === formData.originalPrice ? undefined : formData.originalPrice, // 원가가 0이면 빼기
          cafeInfoId: product.cafeInfoId === formData.cafeInfoId ? undefined : formData.cafeInfoId, // 카페 정보가 없으면 빼기
          categoryId: product.categoryId === formData.categoryId ? undefined : formData.categoryId, // 카테고리가 없으면 빼기
          minOrderQuantity: product.minOrderQuantity === formData.minOrderQuantity ? undefined : formData.minOrderQuantity, // 최소 주문 수량이 0이면 1로 설정
          stockQuantity: product.stockQuantity === formData.stockQuantity ? undefined : formData.stockQuantity, // 재고가 0이면 1로 설정
          productImages: productImages ?? undefined,
          disabledImageIds: removeImageIds.length > 0 ? removeImageIds : undefined,
          isThumbImageId: thumbnailImage?.id !== undefined && product.ProductImages?.find(image => image.isThumb)?.id != thumbnailImage?.id ? thumbnailImage?.id : undefined
        }
      });

      if (updateProductResponse.error) {
        throw new Error(updateProductResponse.error as unknown as string);
      }

      alert('상품이 성공적으로 수정되었습니다.');
      refetchProduct();
    } catch (error) {
      console.error('상품 수정 실패:', error);

      if (imageUrls.length > 0 && token) deleteImage(token, imageUrls);

      alert('상품 생성에 실패했습니다.');
    } finally {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (product) {
      setFormData({
        name: product.name ?? '',
        code: product.code ?? '',
        description: product.description ?? '',
        price: product.price ?? 0,
        originalPrice: product.originalPrice ?? 0,
        stockQuantity: product.stockQuantity ?? 0,
        minOrderQuantity: product.minOrderQuantity ?? 0,
        isAvailable: product.isAvailable ?? true,
        categoryId: product.categoryId ?? 0,
        cafeInfoId: product.cafeInfoId ?? 0,
        productImages: product.ProductImages ?? [],
      });
      setImages(product.ProductImages?.map(image => {
        return {
          ...image,
          file: null,
          thumbnailFile: null,
          id: image.id
        }
      }) ?? []);
    }
  };

  return {
    product,
    isUpdating,
    error,
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
    isLoading: isLoadingProduct || isUpdating,
    isEditing,
    duplicateCode,
    thumbnailImage,
    handleEditMode,
    handleBack,
    checkDuplicateCode
  };
};
