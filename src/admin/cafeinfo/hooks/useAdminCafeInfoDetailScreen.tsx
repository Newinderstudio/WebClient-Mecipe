'use client'

import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { CafeInfoResult, useDeletePlaceByAdminMutation, useFindPlaceByAdminQuery, useUpdatePlaceByAdminMutation } from '@/api/cafeInfosApi';
import { ImageUploadPriorityComponentHandler } from '../components/ImageUploadPriorityComponent';
import { useTypedSelector } from '@/store';
import { VirtualLinkUploadComponentHandler } from '../components/VirtualLinkUploadComponent';
import { CafeRealImagePrimitiveResult, useUploadCafeRealImagesByAdminMutation } from '@/api/cafeRealImagesApi';
import { CafeVirtualImagePrimitiveResult, useUploadCafeVirtualImagesByAdminMutation } from '@/api/cafeVirtualImagesApi';
import { CafeThumbnailImagePrimitiveResult, useUploadCafeThumbnailImagesByAdminMutation } from '@/api/cafeThumbnailImagesApi';
import { CafeVirtualLinkResult } from '@/api/cafeVirtualLinksApi';
import { deleteImage } from '@/util/fetchImage';

interface Props {
  id: number;
}

interface hookMember {

  onClickRouterUser: () => void;

  modalDisplayState: 'flex' | 'none';
  onClickCompleted: () => void;
  modalContent: React.JSX.Element | string;

  cafeId: number | undefined;
  // input
  name: string;
  address: string;
  regionCategoryId: number | undefined;
  businessNumber: string;
  ceoName: string;
  directions: string;

  thumbnailImages: CafeThumbnailImagePrimitiveResult[] | undefined;
  virtualImages: CafeVirtualImagePrimitiveResult[] | undefined;
  realImages: CafeRealImagePrimitiveResult[] | undefined;
  virtualLinks: CafeVirtualLinkResult[] | undefined;

  handleSubmit: (e: React.FormEvent) => void;

  onChangeName: (txt: string) => void,
  onChangeAddress: (txt: string) => void,
  onChangeRegionCategoryId: (num: number | undefined) => void,
  onChangeBusinessNumber: (txt: string) => void,
  onChangeCeoName: (txt: string) => void,
  onChangeDirections: (txt: string) => void,

  token: string | undefined;

  thumbnailImageHandlerRef: React.RefObject<ImageUploadPriorityComponentHandler | null>;
  virtualImageHandlerRef: React.RefObject<ImageUploadPriorityComponentHandler | null>;
  realImageHandlerRef: React.RefObject<ImageUploadPriorityComponentHandler | null>;
  virtualLinkHandlerRef: React.RefObject<VirtualLinkUploadComponentHandler | null>;

  updateThumbnailImagesAction: () => void;
  updateVirtualImagesAction: () => void;
  updateRealImagesAction: () => void;
}

export default function useAdminCafeInfoDetailScreen({ id: detailId }: Props): hookMember {
  const router = useRouter();

  const token = useTypedSelector((state) => state.account.accessToken);

  const { data: initialData } = useFindPlaceByAdminQuery({ id: detailId });

  const [updatePlace] = useUpdatePlaceByAdminMutation();
  const [deletePlace] = useDeletePlaceByAdminMutation();

  const [uploadCafeRealImage] = useUploadCafeRealImagesByAdminMutation();
  const [uploadCafeVirtualImage] = useUploadCafeVirtualImagesByAdminMutation();
  const [uploadCafeThumbnailImage] = useUploadCafeThumbnailImagesByAdminMutation();

  const [cafeId, setCafeId] = useState<number>()
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [regionCategoryId, setRegionCategoryId] = useState<number>()
  const [businessNumber, setBusinessNumber] = useState('')
  const [ceoName, setCeoName] = useState('')
  const [directions, setDirections] = useState('');

  const [thumbnailImages, setThumbnailImages] = useState<CafeThumbnailImagePrimitiveResult[]>();
  const [virtualImages, setVirtualImages] = useState<CafeVirtualImagePrimitiveResult[]>();
  const [realImages, setrealImages] = useState<CafeRealImagePrimitiveResult[]>();

  const [virtualLinks, setVirtualLinks] = useState<CafeVirtualLinkResult[]>();

  const thumbnailImageHandlerRef = useRef<ImageUploadPriorityComponentHandler>(null);
  const virtualImageHandlerRef = useRef<ImageUploadPriorityComponentHandler>(null);
  const realImageHandlerRef = useRef<ImageUploadPriorityComponentHandler>(null);
  const virtualLinkHandlerRef = useRef<VirtualLinkUploadComponentHandler>(null);

  useEffect(() => {
    if (!initialData) return;
    setCafeId(initialData.id);
    setName(initialData.name);
    setAddress(initialData.address);
    setRegionCategoryId(initialData.regionCategoryId);
    setBusinessNumber(initialData.businessNumber);
    setCeoName(initialData.ceoName);
    setDirections(initialData.directions);

    setThumbnailImages(initialData.CafeThumbnailImages?.map(data => ({ ...data, id: data.id!, createdAt: data.createdAt! })) ?? []);
    setVirtualImages(initialData.CafeVirtualImages?.map(data => ({ ...data, id: data.id!, createdAt: data.createdAt! })) ?? []);
    setrealImages(initialData.CafeRealImages?.map(data => ({ ...data, id: data.id!, createdAt: data.createdAt! })) ?? []);
    setVirtualLinks(initialData.CafeVirtualLinks?.map(data => ({ ...data, id: data.id!, createdAt: data.createdAt! })) ?? []);
  }, [initialData])

  const updateThumbnailImagesAction = async () => {

    if (!token) {
      alert("불가능한 접근입니다.");
      return;
    }

    const deleteImages: string[] = [];
    try {
      if (!thumbnailImageHandlerRef.current) throw new Error("썸네일 이미지 핸들러가 없습니다.");

      const images = await thumbnailImageHandlerRef.current?.getImageData(token!, detailId);

      images.create.forEach(data => {
        if (data.url) deleteImages.push(data.url);
        if (data.thumbnailUrl) deleteImages.push(data.thumbnailUrl);
      });

      const result = await uploadCafeThumbnailImage({
        cafeId: detailId,
        body: {
          create: images.create.map(data => ({
            ...data,
            thumbnailUrl: data.thumbnailUrl!
          })),
          update: images.update
        }
      }).unwrap();

      setThumbnailImages(result);

      alert("썸네일 이미지 적용 완료");
    } catch (e) {
      if (deleteImages.length > 0) await deleteImage(token, deleteImages);
      alert(e);
    }
  }

  const updateVirtualImagesAction = async () => {

    if (!token) {
      alert("불가능한 접근입니다.");
      return;
    }

    const deleteImages: string[] = [];
    try {
      if (!virtualImageHandlerRef.current) throw new Error("가상 이미지 핸들러가 없습니다.");

      const images = await virtualImageHandlerRef.current?.getImageData(token, detailId);

      images.create.forEach(data => {
        if (data.url) deleteImages.push(data.url);
        if (data.thumbnailUrl) deleteImages.push(data.thumbnailUrl);
      });

      const result = await uploadCafeVirtualImage({
        cafeId: detailId,
        body: images
      }).unwrap();

      setVirtualImages(result);

      alert("가상 이미지 적용 완료");
    } catch (e) {
      if (deleteImages.length > 0) await deleteImage(token, deleteImages);
      alert(e);
    }
  }

  const updateRealImagesAction = async () => {

    if (!token) {
      alert("불가능한 접근입니다.");
      return;
    }

    const deleteImages: string[] = [];
    try {
      if (!realImageHandlerRef.current) throw new Error("실제 이미지 핸들러가 없습니다.");

      const images = await realImageHandlerRef.current?.getImageData(token, detailId);

      images.create.forEach(data => {
        if (data.url) deleteImages.push(data.url);
        if (data.thumbnailUrl) deleteImages.push(data.thumbnailUrl);
      });

      const result = await uploadCafeRealImage({
        cafeId: detailId,
        body: images
      }).unwrap();

      setrealImages(result);

      alert("실제 이미지 적용 완료");
    } catch (e) {
      if (deleteImages.length > 0) await deleteImage(token, deleteImages);
      alert(e);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      alert("불가능한 접근입니다.");
      return;
    }

    if (name.length <= 0) {
      setModalContent(
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontWeight: 'bold' }}>이름</span>
          <br />
          이름을 입력하여 주세요
        </div>,
      );
      setModalDisplayState('flex');
      return;
    }

    if (address.length <= 0) {
      setModalContent(
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontWeight: 'bold' }}>이름</span>
          <br />
          주소를 입력하여 주세요
        </div>,
      );
      setModalDisplayState('flex');
      return;
    }

    if (businessNumber.length <= 0) {
      setModalContent(
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontWeight: 'bold' }}>이름</span>
          <br />
          사업자번호를 입력하여 주세요
        </div>,
      );
      setModalDisplayState('flex');
      return;
    }

    if (ceoName.length <= 0) {
      setModalContent(
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontWeight: 'bold' }}>이름</span>
          <br />
          사업자명을 입력하여 주세요
        </div>,
      );
      setModalDisplayState('flex');
      return;
    }

    if (directions.length <= 0) {
      setModalContent(
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontWeight: 'bold' }}>이름</span>
          <br />
          오시는 길을 입력하여 주세요
        </div>,
      );
      setModalDisplayState('flex');
      return;
    }

    if (regionCategoryId === undefined || regionCategoryId === 0) {
      setModalContent(
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontWeight: 'bold' }}>이름</span>
          <br />
          지역 카테고리를 선택하여 주세요.
        </div>,
      );
      setModalDisplayState('flex');
      return;
    }

    if (!thumbnailImageHandlerRef.current || !virtualImageHandlerRef.current || !realImageHandlerRef.current || !virtualLinkHandlerRef.current) {
      setModalContent(
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontWeight: 'bold' }}>이름</span>
          <br />
          페이지 에러
        </div>,
      );
      setModalDisplayState('flex');
      return;
    }



    const body = {
      name,
      address,
      regionCategoryId,
      businessNumber,
      ceoName,
      directions,
      // 필요 시 다른 필드도 추가
    }

    let cafeInfo: CafeInfoResult | undefined;
    try {
      cafeInfo = await updatePlace({ id: detailId, body }).unwrap();
      if (!cafeInfo) throw new Error("카페 수정 에러");

      setName(cafeInfo.name);
      setAddress(cafeInfo.address);
      setRegionCategoryId(cafeInfo.regionCategoryId);
      setBusinessNumber(cafeInfo.businessNumber);
      setCeoName(cafeInfo.ceoName);
      setDirections(cafeInfo.directions);

      alert('카페 정보가 수정되었습니다!');
    } catch (err) {
      console.error(err)
      if (cafeInfo) await deletePlace({ id: cafeInfo.id });
      alert('생성 중 오류가 발생했습니다.')
    }
  }

  const [modalDisplayState, setModalDisplayState] = useState<'flex' | 'none'>('none');
  const [modalContent, setModalContent] = useState<React.JSX.Element | string>(<div></div>);

  const onClickCompleted = () => {
    setModalDisplayState('none');
  }


  return {

    modalDisplayState,
    modalContent,


    onClickRouterUser: () => {
      router.push(`/admin/user/`);
    },
    onClickCompleted,

    cafeId,
    // data
    name,
    address,
    regionCategoryId,
    businessNumber,
    ceoName,
    directions,

    thumbnailImages,
    virtualImages,
    realImages,
    virtualLinks,

    handleSubmit,

    onChangeName: (txt: string) => { setName(txt) },
    onChangeAddress: (txt: string) => { setAddress(txt); },
    onChangeRegionCategoryId: (num: number | undefined) => { setRegionCategoryId(num); },
    onChangeBusinessNumber: (txt: string) => { setBusinessNumber(txt); },
    onChangeCeoName: (txt: string) => { setCeoName(txt); },
    onChangeDirections: (txt: string) => { setDirections(txt); },

    token,
    thumbnailImageHandlerRef,
    virtualImageHandlerRef,
    realImageHandlerRef,
    virtualLinkHandlerRef,

    updateThumbnailImagesAction,
    updateVirtualImagesAction,
    updateRealImagesAction,
  };
}