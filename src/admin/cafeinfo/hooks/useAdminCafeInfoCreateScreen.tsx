import { useRouter } from 'next/navigation';
import React, { useRef, useState } from 'react';
import { CafeInfoResult, useCreatePlaceByAdminMutation, useDeletePlaceByAdminMutation } from '@/api/cafeInfosApi';
import { ImageUploadPriorityComponentHandler } from '../components/ImageUploadPriorityComponent';
import { useTypedSelector } from '@/store';
import { categoryTreeDummyData } from '@/feature/search/hooks/searchDummyData';
import { Category } from '@/common/input/SearchCategoryNavigator';
import { VirtualLinkUploadComponentHandler } from '../components/VirtualLinkUploadComponent';
import { useCreateCafeVirtualLinkByAdminMutation } from '@/api/cafeVirtualLinksApi';
import { useUploadCafeRealImagesByAdminMutation } from '@/api/cafeRealImagesApi';
import { useUploadCafeVirtualImagesByAdminMutation } from '@/api/cafeVirtualImagesApi';
import { UpsertCafethumbnailImageListDto, useUploadCafeThumbnailImagesByAdminMutation } from '@/api/cafeThumbnailImagesApi';

interface hookMember {

  onClickRouterUser: () => void;

  modalDisplayState: 'flex' | 'none';
  onClickCompleted: () => void;
  modalContent: React.JSX.Element | string;

  // input
  name: string;
  address: string;
  regionCategoryId: number;
  businessNumber: string;
  ceoName: string;
  directions: string;
  handleSubmit: (e: React.FormEvent) => void;

  onChangeName: (txt: string) => void,
  onChangeAddress: (txt: string) => void,
  onChangeRegionCategoryId: (num: number) => void,
  onChangeBusinessNumber: (txt: string) => void,
  onChangeCeoName: (txt: string) => void,
  onChangeDirections: (txt: string) => void,

  token: string | undefined;

  thumbnailImageHandlerRef: React.RefObject<ImageUploadPriorityComponentHandler | null>;
  virtualImageHandlerRef: React.RefObject<ImageUploadPriorityComponentHandler | null>;
  realImageHandlerRef: React.RefObject<ImageUploadPriorityComponentHandler | null>;
  virtualLinkHandlerRef: React.RefObject<VirtualLinkUploadComponentHandler | null>;

  categoryTree: Category[]
}

export function useAdminUserCreateScreen(): hookMember {
  const router = useRouter();

  const token = useTypedSelector((state) => state.account.accessToken);

  const [createPlace] = useCreatePlaceByAdminMutation();
  const [deletePlace] = useDeletePlaceByAdminMutation();

  const [createVirtualLink] = useCreateCafeVirtualLinkByAdminMutation();
  const [uploadCafeRealImage] = useUploadCafeRealImagesByAdminMutation();
  const [uploadCafeVirtualImage] = useUploadCafeVirtualImagesByAdminMutation();
  const [uploadCafeThumbnailImage] = useUploadCafeThumbnailImagesByAdminMutation();

  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [regionCategoryId, setRegionCategoryId] = useState<number>(1)
  const [businessNumber, setBusinessNumber] = useState('')
  const [ceoName, setCeoName] = useState('')
  const [directions, setDirections] = useState('')

  const categoryTree = categoryTreeDummyData;

  const thumbnailImageHandlerRef = useRef<ImageUploadPriorityComponentHandler>(null);
  const virtualImageHandlerRef = useRef<ImageUploadPriorityComponentHandler>(null);
  const realImageHandlerRef = useRef<ImageUploadPriorityComponentHandler>(null);
  const virtualLinkHandlerRef = useRef<VirtualLinkUploadComponentHandler>(null);


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

    if (regionCategoryId == 0) {
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
      cafeInfo = (await createPlace({ body })).data;
      if (!cafeInfo) throw new Error("카페 생성 에러");

      {
        const thumbnailImages = await thumbnailImageHandlerRef.current.getImageData(token, cafeInfo.id);
        if (thumbnailImages.create.length == 0 && thumbnailImages.update.length == 0) throw new Error("썸네일 이미지가 없습니다.");

        if (thumbnailImages.create.find(data => data.thumbnailUrl == undefined)) throw new Error("썸네일 이미지 오류가 있습니다.");

        uploadCafeThumbnailImage({
          cafeId: cafeInfo.id,
          body: thumbnailImages as UpsertCafethumbnailImageListDto
        })
      }

      {
        const virtualImages = await virtualImageHandlerRef.current.getImageData(token, cafeInfo.id);
        if (virtualImages.create.length == 0 && virtualImages.update.length == 0) throw new Error("가상 이미지가 없습니다.");
        uploadCafeVirtualImage({
          cafeId: cafeInfo.id,
          body: virtualImages
        })
      }

      {
        const realImages = await realImageHandlerRef.current.getImageData(token, cafeInfo.id);
        if (realImages.create.length == 0 && realImages.update.length == 0) throw new Error("실제 이미지가 없습니다.");
        uploadCafeRealImage({
          cafeId: cafeInfo.id,
          body: realImages
        })
      }

      {
        const virtualLinks = await virtualLinkHandlerRef.current.getLinkData(token);
        createVirtualLink({
          cafeId: cafeInfo.id,
          body: virtualLinks
        })
      }

      alert('카페 정보가 생성되었습니다!');
      router.back();
    } catch (err) {
      console.error(err)
      if(cafeInfo) deletePlace({ id: cafeInfo.id });
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

    // data
    name,
    address,
    regionCategoryId,
    businessNumber,
    ceoName,
    directions,
    handleSubmit,

    onChangeName: (txt: string) => { setName(txt) },
    onChangeAddress: (txt: string) => { setAddress(txt); },
    onChangeRegionCategoryId: (num: number) => { setRegionCategoryId(num); },
    onChangeBusinessNumber: (txt: string) => { setBusinessNumber(txt); },
    onChangeCeoName: (txt: string) => { setCeoName(txt); },
    onChangeDirections: (txt: string) => { setDirections(txt); },

    token,
    thumbnailImageHandlerRef,
    virtualImageHandlerRef,
    realImageHandlerRef,
    virtualLinkHandlerRef,

    categoryTree
  };
}