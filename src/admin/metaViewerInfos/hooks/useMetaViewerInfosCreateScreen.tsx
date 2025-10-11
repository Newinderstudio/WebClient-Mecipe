import { useRouter } from 'next/navigation';
import React, { useRef, useState } from 'react';
import { 
  useCreateMetaViewerInfoMutation,
  useCreateMetaViewerMapMutation,
  useCreateMetaViewerActiveMapMutation,
  MetaViewerInfoResult,
  useRemoveMetaViewerInfoMutation
} from '@/api/metaViewerInfosApi';
import { MetaMapType } from '@/data/prisma-client';
import { MapFileUploadComponentHandler } from '../components/MapFileUploadComponent';
import { useTypedSelector } from '@/store';

interface hookMember {
  onClickRouterList: () => void;

  modalDisplayState: 'flex' | 'none';
  onClickCompleted: () => void;
  modalContent: React.JSX.Element | string;

  // MetaViewerInfo fields
  code: string;
  cafeInfoId: string;
  isDisable: boolean;

  // MetaViewerMap fields
  renderMapVersion: string;
  colliderMapVersion: string;

  handleSubmit: (e: React.FormEvent) => void;

  onChangeCode: (txt: string) => void;
  onChangeCafeInfoId: (txt: string) => void;
  onChangeIsDisable: (val: boolean) => void;

  onChangeRenderMapVersion: (txt: string) => void;
  onChangeColliderMapVersion: (txt: string) => void;

  token: string | undefined;
  renderMapHandlerRef: React.RefObject<MapFileUploadComponentHandler | null>;
  colliderMapHandlerRef: React.RefObject<MapFileUploadComponentHandler | null>;
}

export function useMetaViewerInfosCreateScreen(): hookMember {
  const router = useRouter();

  const token = useTypedSelector((state) => state.account.accessToken);

  const [createMetaViewerInfo] = useCreateMetaViewerInfoMutation();
  const [createMetaViewerMap] = useCreateMetaViewerMapMutation();
  const [createMetaViewerActiveMap] = useCreateMetaViewerActiveMapMutation();
  const [removeMetaViewerInfo] = useRemoveMetaViewerInfoMutation();

  const [code, setCode] = useState('');
  const [cafeInfoId, setCafeInfoId] = useState('');
  const [isDisable, setIsDisable] = useState(false);

  const [renderMapVersion, setRenderMapVersion] = useState('1');
  const [colliderMapVersion, setColliderMapVersion] = useState('1');

  const renderMapHandlerRef = useRef<MapFileUploadComponentHandler>(null);
  const colliderMapHandlerRef = useRef<MapFileUploadComponentHandler>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      alert("불가능한 접근입니다.");
      return;
    }

    if (code.length <= 0) {
      setModalContent(
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontWeight: 'bold' }}>코드</span>
          <br />
          코드를 입력하여 주세요
        </div>,
      );
      setModalDisplayState('flex');
      return;
    }

    if (cafeInfoId.length <= 0 || isNaN(Number(cafeInfoId))) {
      setModalContent(
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontWeight: 'bold' }}>카페 ID</span>
          <br />
          유효한 카페 ID를 입력하여 주세요
        </div>,
      );
      setModalDisplayState('flex');
      return;
    }

    if (!renderMapHandlerRef.current || !colliderMapHandlerRef.current) {
      setModalContent(
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontWeight: 'bold' }}>페이지 에러</span>
          <br />
          페이지를 다시 로드해주세요
        </div>,
      );
      setModalDisplayState('flex');
      return;
    }

    if (!renderMapHandlerRef.current.hasFile()) {
      setModalContent(
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontWeight: 'bold' }}>렌더 맵 파일</span>
          <br />
          렌더 맵 파일을 선택하여 주세요
        </div>,
      );
      setModalDisplayState('flex');
      return;
    }

    if (!colliderMapHandlerRef.current.hasFile()) {
      setModalContent(
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontWeight: 'bold' }}>콜라이더 맵 파일</span>
          <br />
          콜라이더 맵 파일을 선택하여 주세요
        </div>,
      );
      setModalDisplayState('flex');
      return;
    }

    let metaViewerInfo: MetaViewerInfoResult | undefined;
    try {
      // 1. MetaViewerInfo 생성
      metaViewerInfo = await createMetaViewerInfo({
        body: {
          code,
          cafeInfoId: Number(cafeInfoId),
          isDisable,
        }
      }).unwrap();

      if (!metaViewerInfo) throw new Error("MetaViewerInfo 생성 에러");

      // 2. Render 맵 업로드 및 등록
      const renderMapData = await renderMapHandlerRef.current.uploadMap(token, Number(renderMapVersion));
      if (!renderMapData) throw new Error("렌더 맵 업로드 실패");

      const renderMap = await createMetaViewerMap({
        metaViewerInfoId: metaViewerInfo.id,
        body: {
          type: MetaMapType.RENDER,
          url: renderMapData.url,
          size: renderMapData.size,
          version: renderMapData.version,
        }
      }).unwrap();

      // 3. Collider 맵 업로드 및 등록
      const colliderMapData = await colliderMapHandlerRef.current.uploadMap(token, Number(colliderMapVersion));
      if (!colliderMapData) throw new Error("콜라이더 맵 업로드 실패");

      const colliderMap = await createMetaViewerMap({
        metaViewerInfoId: metaViewerInfo.id,
        body: {
          type: MetaMapType.COLLIDER,
          url: colliderMapData.url,
          size: colliderMapData.size,
          version: colliderMapData.version,
        }
      }).unwrap();

      // 4. ActiveMap 설정
      await createMetaViewerActiveMap({
        body: {
          metaViewerInfoId: metaViewerInfo.id,
          activeRenderMapId: renderMap.id,
          activeColliderMapId: colliderMap.id,
        }
      }).unwrap();

      alert('MetaViewerInfo가 생성되었습니다!');
      router.back();
    } catch (err) {
      console.error(err)
      if (metaViewerInfo) {
        await removeMetaViewerInfo({ id: metaViewerInfo.id });
      }
      alert('생성 중 오류가 발생했습니다: ' + (err as Error).message);
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
    onClickCompleted,

    onClickRouterList: () => {
      router.push(`/admin/metaviewerinfos/`);
    },

    // data
    code,
    cafeInfoId,
    isDisable,
    renderMapVersion,
    colliderMapVersion,

    handleSubmit,

    onChangeCode: (txt: string) => { setCode(txt) },
    onChangeCafeInfoId: (txt: string) => { setCafeInfoId(txt) },
    onChangeIsDisable: (val: boolean) => { setIsDisable(val) },
    onChangeRenderMapVersion: (txt: string) => { setRenderMapVersion(txt) },
    onChangeColliderMapVersion: (txt: string) => { setColliderMapVersion(txt) },

    token,
    renderMapHandlerRef,
    colliderMapHandlerRef,
  };
}

