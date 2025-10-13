"use client"

import React from 'react';
import BasicModal from '@/common/modal/BasicModal';
import {
    BorderRoundedContent,
    InputStyle,
    StyledButton,
    TheadSmall,
} from '@/common/styledAdmin';
import { Flex, FlexRow } from '@/common/styledComponents';
import { fenxyBlue } from '@/util/constants/style';
import { useAdminMetaViewerInfosCreateScreen } from './hooks/useAdminMetaViewerInfosCreateScreen';
import MapFileUploadComponent from './components/MapFileUploadComponent';
import RelatedCafeSelector from '@/admin/baord/components/RelatedCafeSelector';
import WorldDataInputComponent from './components/WorldDataInputComponent';

const MetaViewerInfosCreateScreen = () => {
    const hookMember = useAdminMetaViewerInfosCreateScreen();
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
                        메타 뷰어 추가
                    </div>
                    <FlexRow>
                        <StyledButton
                            style={{ background: fenxyBlue }}
                            onClick={hookMember.handleSubmit}>
                            저장
                        </StyledButton>
                        <StyledButton
                            style={{ backgroundColor: '#4A5864' }}
                            onClick={hookMember.onClickRouterList}>
                            목록
                        </StyledButton>
                    </FlexRow>
                </FlexRow>

                <BorderRoundedContent style={{ padding: 30, marginBottom: 20 }}>
                    <div style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 20, color: '#333' }}>
                        기본 정보
                    </div>
                    <Flex style={{ gap: 20, flexFlow: 'wrap' }}>
                        <Flex style={{ width: 'calc(50% - 15px)' }}>
                            <TheadSmall>
                                코드<span>*</span>
                            </TheadSmall>
                            <Flex style={{ color: '#999' }}>
                                <InputStyle
                                    type="text"
                                    placeholder="코드 (예: cafe_gangnam_001)"
                                    value={hookMember.code}
                                    onChange={(e) => {
                                        hookMember.onChangeCode(e.target.value)
                                    }}
                                />
                            </Flex>
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

                <RelatedCafeSelector
                    isEditing={true}
                    selectedCafeInfos={hookMember.selectedCafe ? [hookMember.selectedCafe] : []}
                    onCafeSelect={hookMember.onChangeCafe}
                    isAvaliableCheckMultiple={false}
                />

                <WorldDataInputComponent
                    worldData={hookMember.worldData}
                    onChange={hookMember.onChangeWorldData}
                />

                <BorderRoundedContent style={{ padding: 30, marginBottom: 20 }}>
                    <div style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 20, color: '#333' }}>
                        렌더 맵 정보
                    </div>
                    <Flex style={{ gap: 20, flexFlow: 'wrap' }}>
                        <Flex style={{ width: '100%' }}>
                            <TheadSmall>
                                렌더 맵 파일<span>*</span>
                            </TheadSmall>
                            <MapFileUploadComponent
                                ref={hookMember.renderMapHandlerRef}
                                label="렌더 맵 파일"
                                mapType="render"
                                displayId="renderMapFile"
                            />
                        </Flex>
                        <Flex style={{ width: 'calc(50% - 15px)' }}>
                            <TheadSmall>
                                렌더 맵 버전<span>*</span>
                            </TheadSmall>
                            <Flex style={{ color: '#999' }}>
                                <InputStyle
                                    type="text"
                                    placeholder="1"
                                    value={hookMember.renderMapVersion}
                                    onChange={(e) => {
                                        hookMember.onChangeRenderMapVersion(e.target.value)
                                    }}
                                />
                            </Flex>
                        </Flex>
                        <Flex style={{ width: 'calc(50% - 15px)' }}>
                            <TheadSmall>
                                Draco 압축 사용
                            </TheadSmall>
                            <FlexRow style={{ alignItems: 'center', padding: '10px 0' }}>
                                <input
                                    type="checkbox"
                                    checked={hookMember.renderMapIsDraco}
                                    onChange={(e) => hookMember.onChangeRenderMapIsDraco(e.target.checked)}
                                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                />
                                <span style={{ marginLeft: '10px', color: '#666' }}>
                                    Draco 압축 사용됨
                                </span>
                            </FlexRow>
                        </Flex>
                    </Flex>
                </BorderRoundedContent>

                <BorderRoundedContent style={{ padding: 30 }}>
                    <div style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 20, color: '#333' }}>
                        콜라이더 맵 정보
                    </div>
                    <Flex style={{ gap: 20, flexFlow: 'wrap' }}>
                        <Flex style={{ width: '100%' }}>
                            <TheadSmall>
                                콜라이더 맵 파일<span>*</span>
                            </TheadSmall>
                            <MapFileUploadComponent
                                ref={hookMember.colliderMapHandlerRef}
                                label="콜라이더 맵 파일"
                                mapType="collider"
                                displayId="colliderMapFile"
                            />
                        </Flex>
                        <Flex style={{ width: 'calc(50% - 15px)' }}>
                            <TheadSmall>
                                콜라이더 맵 버전<span>*</span>
                            </TheadSmall>
                            <Flex style={{ color: '#999' }}>
                                <InputStyle
                                    type="text"
                                    placeholder="1"
                                    value={hookMember.colliderMapVersion}
                                    onChange={(e) => {
                                        hookMember.onChangeColliderMapVersion(e.target.value)
                                    }}
                                />
                            </Flex>
                        </Flex>
                        <Flex style={{ width: 'calc(50% - 15px)' }}>
                            <TheadSmall>
                                Draco 압축 사용
                            </TheadSmall>
                            <FlexRow style={{ alignItems: 'center', padding: '10px 0' }}>
                                <input
                                    type="checkbox"
                                    checked={hookMember.colliderMapIsDraco}
                                    onChange={(e) => hookMember.onChangeColliderMapIsDraco(e.target.checked)}
                                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                />
                                <span style={{ marginLeft: '10px', color: '#666' }}>
                                    Draco 압축 사용됨
                                </span>
                            </FlexRow>
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

export default MetaViewerInfosCreateScreen;

