"use client"

import React, { use } from 'react';
import BasicModal from '@/common/modal/BasicModal';
import {
    BorderRoundedContent,
    InputStyle,
    StyledButton,
    TheadSmall,
} from '@/common/styledAdmin';
import { Flex, FlexRow } from '@/common/styledComponents';
import { fenxyBlue } from '@/util/constants/style';
import useMetaViewerInfosDetailScreen from './hooks/useMetaViewerInfosDetailScreen';
import MapFileUploadComponent from './components/MapFileUploadComponent';

type Params = Promise<{ id: string }>;

function MetaViewerInfosDetailScreen(props: { params: Params }) {
    const { id } = use(props.params);

    const hookMember = useMetaViewerInfosDetailScreen({ id: Number(id) });
    return (
        <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
            <div style={{ marginLeft: 240, padding: 20, minWidth: 1100 }}>
                <FlexRow
                    style={{
                        paddingBottom: 20,
                        alignItems: 'center',
                        borderBottom: '2px solid #4A5864',
                    }}>
                    <div
                        style={{
                            fontSize: 18,
                            color: '#333',
                            fontWeight: 'bold',
                            flexGrow: 1,
                            lineHeight: '32px',
                        }}>
                        메타 뷰어 수정
                    </div>
                    <FlexRow>
                        <StyledButton
                            style={{ backgroundColor: '#4A5864' }}
                            onClick={hookMember.onClickRouterList}>
                            목록
                        </StyledButton>
                    </FlexRow>
                </FlexRow>

                {/* 기본 정보 섹션 */}
                <BorderRoundedContent style={{ padding: 30, marginBottom: 20 }}>
                    <FlexRow style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <div style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>
                            기본 정보
                        </div>
                        <StyledButton
                            style={{ background: fenxyBlue }}
                            onClick={hookMember.handleSubmitInfo}>
                            기본 정보 수정
                        </StyledButton>
                    </FlexRow>
                    <Flex style={{ gap: 20, flexFlow: 'wrap' }}>
                        <Flex style={{ width: 'calc(50% - 15px)' }}>
                            <TheadSmall>
                                코드<span>*</span>
                            </TheadSmall>
                            <Flex style={{ color: '#999' }}>
                                <InputStyle
                                    type="text"
                                    placeholder="코드"
                                    value={hookMember.code}
                                    onChange={(e) => {
                                        hookMember.onChangeCode(e.target.value)
                                    }}
                                />
                            </Flex>
                        </Flex>
                        <Flex style={{ width: 'calc(50% - 15px)' }}>
                            <TheadSmall>
                                카페 ID<span>*</span>
                            </TheadSmall>
                            <FlexRow style={{ color: '#999', lineHeight: '28px' }}>
                                <InputStyle
                                    style={{
                                        flexGrow: 1,
                                    }}
                                    type="text"
                                    value={hookMember.cafeInfoId}
                                    placeholder="카페 ID"
                                    onChange={(e) => {
                                        hookMember.onChangeCafeInfoId(e.target.value)
                                    }}
                                />
                            </FlexRow>
                        </Flex>
                        <Flex style={{ width: 'calc(50% - 15px)' }}>
                            <TheadSmall>
                                활성화 상태<span>*</span>
                            </TheadSmall>
                            <Flex style={{ color: '#999' }}>
                                <select
                                    style={{
                                        width: '100%',
                                        height: '36px',
                                        border: '1px solid #eee',
                                        padding: '0 10px',
                                        color: '#999',
                                    }}
                                    value={hookMember.isDisable ? 'true' : 'false'}
                                    onChange={(e) => {
                                        hookMember.onChangeIsDisable(e.target.value === 'true')
                                    }}>
                                    <option value="false">활성</option>
                                    <option value="true">비활성</option>
                                </select>
                            </Flex>
                        </Flex>
                    </Flex>
                </BorderRoundedContent>

                {/* 새 맵 추가 섹션 */}
                <BorderRoundedContent style={{ padding: 30, marginBottom: 20 }}>
                    <FlexRow style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <div style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>
                            새 맵 추가
                        </div>
                        <StyledButton
                            style={{ background: '#4CAF50' }}
                            onClick={hookMember.handleSubmitNewMap}>
                            맵 추가
                        </StyledButton>
                    </FlexRow>
                    <Flex style={{ gap: 20, flexFlow: 'wrap' }}>
                        <Flex style={{ width: 'calc(50% - 15px)' }}>
                            <TheadSmall>
                                맵 타입<span>*</span>
                            </TheadSmall>
                            <Flex style={{ color: '#999' }}>
                                <select
                                    style={{
                                        width: '100%',
                                        height: '36px',
                                        border: '1px solid #eee',
                                        padding: '0 10px',
                                        color: '#999',
                                    }}
                                    value={hookMember.newMapType}
                                    onChange={(e) => {
                                        hookMember.onChangeNewMapType(e.target.value)
                                    }}>
                                    <option value="RENDER">RENDER</option>
                                    <option value="COLLIDER">COLLIDER</option>
                                </select>
                            </Flex>
                        </Flex>
                        <Flex style={{ width: 'calc(50% - 15px)' }}>
                            <TheadSmall>
                                버전<span>*</span>
                            </TheadSmall>
                            <Flex style={{ color: '#999' }}>
                                <InputStyle
                                    type="text"
                                    placeholder="버전"
                                    value={hookMember.newMapVersion}
                                    onChange={(e) => {
                                        hookMember.onChangeNewMapVersion(e.target.value)
                                    }}
                                />
                            </Flex>
                        </Flex>
                        <Flex style={{ width: '100%' }}>
                            <TheadSmall>
                                맵 파일<span>*</span>
                            </TheadSmall>
                            <MapFileUploadComponent
                                ref={hookMember.newMapHandlerRef}
                                label="맵 파일"
                                mapType={hookMember.newMapType === 'RENDER' ? 'render' : 'collider'}
                                displayId="newMapFile"
                            />
                        </Flex>
                    </Flex>
                </BorderRoundedContent>

                {/* 활성 맵 관리 섹션 */}
                <BorderRoundedContent style={{ padding: 30, marginBottom: 20 }}>
                    <FlexRow style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <div style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>
                            활성 맵 관리
                        </div>
                        <StyledButton
                            style={{ background: '#FF9800' }}
                            onClick={hookMember.handleUpdateActiveMap}>
                            활성 맵 업데이트
                        </StyledButton>
                    </FlexRow>
                    <Flex style={{ gap: 20, flexFlow: 'wrap' }}>
                        <Flex style={{ width: 'calc(50% - 15px)' }}>
                            <TheadSmall>
                                활성 렌더 맵<span>*</span>
                            </TheadSmall>
                            <Flex style={{ color: '#999' }}>
                                <select
                                    style={{
                                        width: '100%',
                                        height: '36px',
                                        border: '1px solid #eee',
                                        padding: '0 10px',
                                        color: '#999',
                                    }}
                                    value={hookMember.activeRenderMapId || ''}
                                    onChange={(e) => {
                                        hookMember.onChangeActiveRenderMapId(e.target.value)
                                    }}>
                                    <option value="">선택하세요</option>
                                    {hookMember.renderMaps.map(map => (
                                        <option key={map.id} value={map.id}>
                                            Map ID: {map.id} - v{map.version} ({map.size} bytes)
                                        </option>
                                    ))}
                                </select>
                            </Flex>
                        </Flex>
                        <Flex style={{ width: 'calc(50% - 15px)' }}>
                            <TheadSmall>
                                활성 콜라이더 맵<span>*</span>
                            </TheadSmall>
                            <Flex style={{ color: '#999' }}>
                                <select
                                    style={{
                                        width: '100%',
                                        height: '36px',
                                        border: '1px solid #eee',
                                        padding: '0 10px',
                                        color: '#999',
                                    }}
                                    value={hookMember.activeColliderMapId || ''}
                                    onChange={(e) => {
                                        hookMember.onChangeActiveColliderMapId(e.target.value)
                                    }}>
                                    <option value="">선택하세요</option>
                                    {hookMember.colliderMaps.map(map => (
                                        <option key={map.id} value={map.id}>
                                            Map ID: {map.id} - v{map.version} ({map.size} bytes)
                                        </option>
                                    ))}
                                </select>
                            </Flex>
                        </Flex>
                    </Flex>
                </BorderRoundedContent>

                {/* 맵 목록 섹션 */}
                <BorderRoundedContent style={{ padding: 30 }}>
                    <div style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 20, color: '#333' }}>
                        등록된 맵 목록
                    </div>
                    <Flex style={{ gap: 20 }}>
                        <Flex style={{ width: '100%' }}>
                            <TheadSmall>렌더 맵 목록</TheadSmall>
                            <div style={{ border: '1px solid #eee', borderRadius: 4, padding: 10, minHeight: 100 }}>
                                {hookMember.renderMaps.length > 0 ? (
                                    hookMember.renderMaps.map(map => (
                                        <div key={map.id} style={{ 
                                            padding: '10px', 
                                            marginBottom: '10px', 
                                            background: '#f9f9f9',
                                            borderRadius: 4,
                                            borderLeft: hookMember.activeRenderMapId === map.id ? '4px solid #4CAF50' : 'none'
                                        }}>
                                            <div><strong>ID:</strong> {map.id} {hookMember.activeRenderMapId === map.id && <span style={{ color: '#4CAF50', marginLeft: 10 }}>✓ 활성</span>}</div>
                                            <div><strong>버전:</strong> {map.version}</div>
                                            <div><strong>크기:</strong> {map.size.toLocaleString()} bytes</div>
                                            <div style={{ wordBreak: 'break-all' }}><strong>URL:</strong> {map.url}</div>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ color: '#999', textAlign: 'center', padding: 20 }}>
                                        등록된 렌더 맵이 없습니다.
                                    </div>
                                )}
                            </div>
                        </Flex>
                        <Flex style={{ width: '100%' }}>
                            <TheadSmall>콜라이더 맵 목록</TheadSmall>
                            <div style={{ border: '1px solid #eee', borderRadius: 4, padding: 10, minHeight: 100 }}>
                                {hookMember.colliderMaps.length > 0 ? (
                                    hookMember.colliderMaps.map(map => (
                                        <div key={map.id} style={{ 
                                            padding: '10px', 
                                            marginBottom: '10px', 
                                            background: '#f9f9f9',
                                            borderRadius: 4,
                                            borderLeft: hookMember.activeColliderMapId === map.id ? '4px solid #4CAF50' : 'none'
                                        }}>
                                            <div><strong>ID:</strong> {map.id} {hookMember.activeColliderMapId === map.id && <span style={{ color: '#4CAF50', marginLeft: 10 }}>✓ 활성</span>}</div>
                                            <div><strong>버전:</strong> {map.version}</div>
                                            <div><strong>크기:</strong> {map.size.toLocaleString()} bytes</div>
                                            <div style={{ wordBreak: 'break-all' }}><strong>URL:</strong> {map.url}</div>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ color: '#999', textAlign: 'center', padding: 20 }}>
                                        등록된 콜라이더 맵이 없습니다.
                                    </div>
                                )}
                            </div>
                        </Flex>
                    </Flex>
                </BorderRoundedContent>
            </div>
            <BasicModal
                display={hookMember.modalDisplayState}
                content={hookMember.modalContent}
                confirmBtn={hookMember.onClickCompleted}
            />
        </div>
    );
};

export default MetaViewerInfosDetailScreen;

