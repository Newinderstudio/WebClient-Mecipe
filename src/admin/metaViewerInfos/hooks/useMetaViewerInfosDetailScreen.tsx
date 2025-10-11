'use client'

import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import {
  useFindOneMetaViewerInfoQuery,
  useUpdateMetaViewerInfoMutation,
  useCreateMetaViewerMapMutation,
  useUpdateMetaViewerActiveMapMutation,
  useFindAllMetaViewerMapsQuery,
  MetaViewerMapResult,
} from '@/api/metaViewerInfosApi';
import { MetaMapType } from '@/data/prisma-client';
import { MapFileUploadComponentHandler } from '../components/MapFileUploadComponent';
import { useTypedSelector } from '@/store';

interface Props {
  id: number;
}

interface hookMember {
  onClickRouterList: () => void;

  modalDisplayState: 'flex' | 'none';
  onClickCompleted: () => void;
  modalContent: React.JSX.Element | string;

  metaViewerInfoId: number | undefined;

  // MetaViewerInfo fields
  code: string;
  cafeInfoId: string;
  isDisable: boolean;

  // MetaViewerMap 목록
  metaViewerMaps: MetaViewerMapResult[] | undefined;
  renderMaps: MetaViewerMapResult[];
  colliderMaps: MetaViewerMapResult[];

  // 활성 맵
  activeRenderMapId: number | undefined;
  activeColliderMapId: number | undefined;
  activeMapId: number | undefined;

  // 새 맵 추가
  newMapType: string;
  newMapVersion: string;

  handleSubmitInfo: (e: React.FormEvent) => void;
  handleSubmitNewMap: (e: React.FormEvent) => void;
  handleUpdateActiveMap: (e: React.FormEvent) => void;

  onChangeCode: (txt: string) => void;
  onChangeCafeInfoId: (txt: string) => void;
  onChangeIsDisable: (val: boolean) => void;

  onChangeActiveRenderMapId: (id: string) => void;
  onChangeActiveColliderMapId: (id: string) => void;

  onChangeNewMapType: (txt: string) => void;
  onChangeNewMapVersion: (txt: string) => void;

  token: string | undefined;
  newMapHandlerRef: React.RefObject<MapFileUploadComponentHandler | null>;
}

export default function useMetaViewerInfosDetailScreen({ id: detailId }: Props): hookMember {
  const router = useRouter();

  const token = useTypedSelector((state) => state.account.accessToken);

  const { data: initialData } = useFindOneMetaViewerInfoQuery({ id: detailId });
  const { data: mapsData, refetch: refetchMaps } = useFindAllMetaViewerMapsQuery({ metaViewerInfoId: detailId });

  const [updateMetaViewerInfo] = useUpdateMetaViewerInfoMutation();
  const [createMetaViewerMap] = useCreateMetaViewerMapMutation();
  const [updateMetaViewerActiveMap] = useUpdateMetaViewerActiveMapMutation();

  const [metaViewerInfoId, setMetaViewerInfoId] = useState<number>();
  const [code, setCode] = useState('');
  const [cafeInfoId, setCafeInfoId] = useState('');
  const [isDisable, setIsDisable] = useState(false);

  const [metaViewerMaps, setMetaViewerMaps] = useState<MetaViewerMapResult[]>();
  const [renderMaps, setRenderMaps] = useState<MetaViewerMapResult[]>([]);
  const [colliderMaps, setColliderMaps] = useState<MetaViewerMapResult[]>([]);

  const [activeRenderMapId, setActiveRenderMapId] = useState<number>();
  const [activeColliderMapId, setActiveColliderMapId] = useState<number>();
  const [activeMapId, setActiveMapId] = useState<number>();

  // 새 맵 추가 필드
  const [newMapType, setNewMapType] = useState('RENDER');
  const [newMapVersion, setNewMapVersion] = useState('1');

  const newMapHandlerRef = useRef<MapFileUploadComponentHandler>(null);

  useEffect(() => {
    if (!initialData) return;
    setMetaViewerInfoId(initialData.id);
    setCode(initialData.code);
    setCafeInfoId(String(initialData.cafeInfoId));
    setIsDisable(initialData.isDisable);

    if (initialData.ActiveMaps) {
      setActiveMapId(initialData.ActiveMaps.id);
      setActiveRenderMapId(initialData.ActiveMaps.activeRenderMapId);
      setActiveColliderMapId(initialData.ActiveMaps.activeColliderMapId);
    }
  }, [initialData]);

  useEffect(() => {
    if (!mapsData) return;
    setMetaViewerMaps(mapsData);
    
    const renders = mapsData.filter(map => map.type === MetaMapType.RENDER);
    const colliders = mapsData.filter(map => map.type === MetaMapType.COLLIDER);
    
    setRenderMaps(renders);
    setColliderMaps(colliders);
  }, [mapsData]);

  const handleSubmitInfo = async (e: React.FormEvent) => {
    e.preventDefault();

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

    try {
      const result = await updateMetaViewerInfo({
        id: detailId,
        body: {
          code,
          cafeInfoId: Number(cafeInfoId),
          isDisable,
        }
      }).unwrap();

      if (result) {
        setCode(result.code);
        setCafeInfoId(String(result.cafeInfoId));
        setIsDisable(result.isDisable);
        alert('MetaViewerInfo가 수정되었습니다!');
      }
    } catch (err) {
      console.error(err)
      alert('수정 중 오류가 발생했습니다: ' + (err as Error).message);
    }
  }

  const handleSubmitNewMap = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      alert("불가능한 접근입니다.");
      return;
    }

    if (!newMapHandlerRef.current) {
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

    if (!newMapHandlerRef.current.hasFile()) {
      setModalContent(
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontWeight: 'bold' }}>맵 파일</span>
          <br />
          맵 파일을 선택하여 주세요
        </div>,
      );
      setModalDisplayState('flex');
      return;
    }

    try {
      // 맵 파일 업로드
      const mapData = await newMapHandlerRef.current.uploadMap(token, Number(newMapVersion));
      if (!mapData) throw new Error("맵 업로드 실패");

      // 맵 등록
      await createMetaViewerMap({
        metaViewerInfoId: detailId,
        body: {
          type: newMapType as 'RENDER' | 'COLLIDER',
          url: mapData.url,
          size: mapData.size,
          version: mapData.version,
        }
      }).unwrap();

      // 맵 목록 갱신
      refetchMaps();

      // 입력 필드 초기화
      newMapHandlerRef.current.clear();
      setNewMapVersion('1');

      alert('새 맵이 추가되었습니다!');
    } catch (err) {
      console.error(err)
      alert('맵 추가 중 오류가 발생했습니다: ' + (err as Error).message);
    }
  }

  const handleUpdateActiveMap = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!activeMapId) {
      setModalContent(
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontWeight: 'bold' }}>활성 맵</span>
          <br />
          활성 맵이 설정되어 있지 않습니다
        </div>,
      );
      setModalDisplayState('flex');
      return;
    }

    if (!activeRenderMapId || !activeColliderMapId) {
      setModalContent(
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontWeight: 'bold' }}>활성 맵</span>
          <br />
          렌더 맵과 콜라이더 맵을 모두 선택하여 주세요
        </div>,
      );
      setModalDisplayState('flex');
      return;
    }

    try {
      const result = await updateMetaViewerActiveMap({
        activeMapId,
        body: {
          activeRenderMapId,
          activeColliderMapId,
        }
      }).unwrap();

      if (result) {
        setActiveRenderMapId(result.activeRenderMapId);
        setActiveColliderMapId(result.activeColliderMapId);
        alert('활성 맵이 업데이트되었습니다!');
      }
    } catch (err) {
      console.error(err)
      alert('활성 맵 업데이트 중 오류가 발생했습니다: ' + (err as Error).message);
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

    metaViewerInfoId,

    // MetaViewerInfo data
    code,
    cafeInfoId,
    isDisable,

    // Maps data
    metaViewerMaps,
    renderMaps,
    colliderMaps,

    // Active maps
    activeRenderMapId,
    activeColliderMapId,
    activeMapId,

    // New map
    newMapType,
    newMapVersion,

    handleSubmitInfo,
    handleSubmitNewMap,
    handleUpdateActiveMap,

    onChangeCode: (txt: string) => { setCode(txt) },
    onChangeCafeInfoId: (txt: string) => { setCafeInfoId(txt) },
    onChangeIsDisable: (val: boolean) => { setIsDisable(val) },

    onChangeActiveRenderMapId: (id: string) => { setActiveRenderMapId(Number(id)) },
    onChangeActiveColliderMapId: (id: string) => { setActiveColliderMapId(Number(id)) },

    onChangeNewMapType: (txt: string) => { setNewMapType(txt) },
    onChangeNewMapVersion: (txt: string) => { setNewMapVersion(txt) },

    token,
    newMapHandlerRef,
  };
}

