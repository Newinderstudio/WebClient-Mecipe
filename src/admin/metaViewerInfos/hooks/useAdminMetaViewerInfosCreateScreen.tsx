import { useRouter } from 'next/navigation';
import React, { useRef, useState } from 'react';
import {
  useCreateMetaViewerInfoMutation,
  MetaViewerInfoResult,
  useRemoveMetaViewerInfoMutation
} from '@/api/metaViewerInfosApi';
import { MetaMapType } from '@/data/prisma-client';
import { MapFileUploadComponentHandler, MapUploadData } from '../components/MapFileUploadComponent';
import { useTypedSelector } from '@/store';
import { CafeInfoResult } from '@/api/cafeInfosApi';
import { WorldData } from '@/api/dto/metaViwerInfosApiDto';
import { deleteMetaViewerMap } from '@/util/fetchMetaViewerMap';

interface hookMember {
  onClickRouterList: () => void;

  modalDisplayState: 'flex' | 'none';
  onClickCompleted: () => void;
  modalContent: React.JSX.Element | string;

  // MetaViewerInfo fields
  code: string;
  selectedCafe: CafeInfoResult | undefined;
  isDisable: boolean;
  worldData: Partial<WorldData>;

  // MetaViewerMap fields
  renderMapVersion: string;
  renderMapIsDraco: boolean;
  colliderMapVersion: string;
  colliderMapIsDraco: boolean;

  handleSubmit: (e: React.FormEvent) => void;

  onChangeCode: (txt: string) => void;
  onChangeCafe: (cafes: CafeInfoResult[]) => void;
  onChangeIsDisable: (val: boolean) => void;
  onChangeWorldData: (data: Partial<WorldData>) => void;

  onChangeRenderMapVersion: (txt: string) => void;
  onChangeRenderMapIsDraco: (val: boolean) => void;
  onChangeColliderMapVersion: (txt: string) => void;
  onChangeColliderMapIsDraco: (val: boolean) => void;

  token: string | undefined;
  renderMapHandlerRef: React.RefObject<MapFileUploadComponentHandler | null>;
  colliderMapHandlerRef: React.RefObject<MapFileUploadComponentHandler | null>;
}

export function useAdminMetaViewerInfosCreateScreen(): hookMember {
  const router = useRouter();

  const token = useTypedSelector((state) => state.account.accessToken);

  const [createMetaViewerInfo] = useCreateMetaViewerInfoMutation();
  const [removeMetaViewerInfo] = useRemoveMetaViewerInfoMutation();

  const [code, setCode] = useState('');
  const [selectedCafe, setSelectedCafe] = useState<CafeInfoResult>();
  const [isDisable, setIsDisable] = useState(false);
  const [worldData, setWorldData] = useState<Partial<WorldData>>({
    playerHeight: 1.3,
    playerRadius: 0.2,
    spawnPoint: { x: 0, y: 0, z: 0 },
    playerJumpForce: 2,
    playerSpeed: 6,
    playerScale: { x: 1, y: 1, z: 1 },
    playerRotation: { x: 0, y: 0, z: 0 },
    playerRotationSpeed: 1,
    defaultAnimationClip: 'idle',
    worldPosition: { x: 0, y: 0, z: 0 },
    worldRotation: { x: 0, y: 0, z: 0 },
    worldScale: { x: 1, y: 1, z: 1 },
  });

  const [renderMapVersion, setRenderMapVersion] = useState('1');
  const [renderMapIsDraco, setRenderMapIsDraco] = useState(false);
  const [colliderMapVersion, setColliderMapVersion] = useState('1');
  const [colliderMapIsDraco, setColliderMapIsDraco] = useState(false);

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

    if (!selectedCafe) {
      setModalContent(
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontWeight: 'bold' }}>카페 선택</span>
          <br />
          카페를 선택하여 주세요
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
    let renderMapData: MapUploadData | null = null;
    let colliderMapData: MapUploadData | null = null;
    try {

      // 1. Render 맵 업로드 및 등록
      renderMapData = await renderMapHandlerRef.current.uploadMap(token, `${code}-${renderMapVersion}`, Number(renderMapVersion));
      if (!renderMapData) throw new Error("렌더 맵 업로드 실패");

      // 2. Collider 맵 업로드 및 등록
      colliderMapData = await colliderMapHandlerRef.current.uploadMap(token, `${code}-${colliderMapVersion}`, Number(colliderMapVersion));
      if (!colliderMapData) throw new Error("콜라이더 맵 업로드 실패");

      // 3. MetaViewerInfo 생성
      metaViewerInfo = await createMetaViewerInfo({
        body: {
          code,
          cafeInfoId: selectedCafe.id,
          isDisable,
          worldData: worldData as WorldData,

          activeRenderMap: {
            type: MetaMapType.RENDER,
            url: renderMapData.url,
            size: renderMapData.size,
            version: renderMapData.version,
            isDraco: renderMapIsDraco,
          },
          activeColliderMap: {
            type: MetaMapType.COLLIDER,
            url: colliderMapData.url,
            size: colliderMapData.size,
            version: colliderMapData.version,
            isDraco: colliderMapIsDraco,
          },
        }
      }).unwrap();

      alert('MetaViewerInfo가 생성되었습니다!');
      router.back();
    } catch (err) {
      console.error('생성 실패:', err);
      
      // 롤백 처리
      try {
        // 1. 업로드된 파일 삭제
        const urlsToDelete: string[] = [];
        if (renderMapData) urlsToDelete.push(renderMapData.url);
        if (colliderMapData) urlsToDelete.push(colliderMapData.url);
        
        if (urlsToDelete.length > 0) {
          console.log('파일 롤백 시작:', urlsToDelete);
          await deleteMetaViewerMap(token, urlsToDelete);
          console.log('파일 롤백 완료');
        }
        
        // 2. MetaViewerInfo 삭제 (생성된 경우)
        if (metaViewerInfo) {
          console.log('MetaViewerInfo 롤백 시작:', metaViewerInfo.id);
          await removeMetaViewerInfo({ id: metaViewerInfo.id });
          console.log('MetaViewerInfo 롤백 완료');
        }
      } catch (rollbackError) {
        console.error('롤백 실패 (고아 데이터 발생 가능):', rollbackError);
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
    selectedCafe,
    isDisable,
    worldData,
    renderMapVersion,
    renderMapIsDraco,
    colliderMapVersion,
    colliderMapIsDraco,

    handleSubmit,

    onChangeCode: (txt: string) => { setCode(txt) },
    onChangeCafe: (cafes: CafeInfoResult[]) => {
      setSelectedCafe(cafes.length > 0 ? cafes[0] : undefined);
    },
    onChangeIsDisable: (val: boolean) => { setIsDisable(val) },
    onChangeWorldData: (data: Partial<WorldData>) => { setWorldData(data) },
    onChangeRenderMapVersion: (txt: string) => { setRenderMapVersion(txt) },
    onChangeRenderMapIsDraco: (val: boolean) => { setRenderMapIsDraco(val) },
    onChangeColliderMapVersion: (txt: string) => { setColliderMapVersion(txt) },
    onChangeColliderMapIsDraco: (val: boolean) => { setColliderMapIsDraco(val) },

    token,
    renderMapHandlerRef,
    colliderMapHandlerRef,
  };
}

