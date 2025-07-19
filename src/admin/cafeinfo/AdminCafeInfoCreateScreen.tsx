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
import { useAdminUserCreateScreen } from './hooks/useAdminCafeInfoCreateScreen';
import ImageUploadPriorityComponent from './components/ImageUploadPriorityComponent';
import SearchCategoryNavigator from '@/common/input/SearchCategoryNavigator';
import VirtualLinkUploadComponent from './components/VirtualLinkUploadComponent';

const AdminUserCreateScreen = () => {
    const hookMember = useAdminUserCreateScreen();
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
                        카페 추가
                    </div>
                    <FlexRow>
                        <StyledButton
                            style={{ background: fenxyBlue }}
                            onClick={hookMember.handleSubmit}>
                            저장
                        </StyledButton>
                        <StyledButton
                            style={{ backgroundColor: '#4A5864' }}
                            onClick={hookMember.onClickRouterUser}>
                            목록
                        </StyledButton>
                    </FlexRow>
                </FlexRow>

                <BorderRoundedContent style={{ padding: 30 }}>
                    <Flex style={{ gap: 20, flexFlow: 'wrap' }}>
                        {/* {hookMember.userType === 'GENERAL' && (
              <> */}
                        <Flex style={{ width: 'calc(50% - 15px)' }}>
                            <TheadSmall>
                                이름<span>*</span>
                            </TheadSmall>
                            <Flex style={{ color: '#999' }}>
                                <InputStyle
                                    type="text"
                                    placeholder="이름"
                                    value={hookMember.name}
                                    onChange={(e) => {
                                        hookMember.onChangeName(e.target.value)
                                        // hookMember.onChangeUserData('username', e.target.value);
                                    }}
                                />
                            </Flex>
                        </Flex>
                        <Flex style={{ width: 'calc(50% - 15px)' }}>
                            <TheadSmall>
                                주소<span>*</span>
                            </TheadSmall>
                            <FlexRow style={{ color: '#999', lineHeight: '28px' }}>
                                <InputStyle
                                    style={{
                                        flexGrow: 1,
                                    }}
                                    type="text"
                                    value={hookMember.address}
                                    placeholder="주소"
                                    onChange={(e) => {
                                        hookMember.onChangeAddress(e.target.value)
                                        // hookMember.onChangeUserData('nickname', e.target.value);
                                    }}
                                />
                            </FlexRow>
                        </Flex>
                        <Flex style={{ width: 'calc(50% - 15px)' }}>
                            <TheadSmall>
                                사업자번호<span>*</span>
                            </TheadSmall>
                            <Flex style={{ color: '#999' }}>
                                <InputStyle
                                    type="text"
                                    placeholder="사업자번호"
                                    value={hookMember.businessNumber}
                                    onChange={(e) => {
                                        const text = e.target.value;
                                        hookMember.onChangeBusinessNumber(text)
                                    }}
                                />
                            </Flex>
                        </Flex>
                        <Flex style={{ width: 'calc(50% - 15px)' }}>
                            <TheadSmall>
                                사업자명<span>*</span>
                            </TheadSmall>
                            <Flex style={{ color: '#999' }}>
                                <InputStyle
                                    type="text"
                                    placeholder="사업자명"
                                    value={hookMember.ceoName}
                                    onChange={(e) => {
                                        hookMember.onChangeCeoName(e.target.value)
                                    }}
                                />
                            </Flex>
                        </Flex>
                        <Flex style={{ width: 'calc(50% - 15px)' }}>
                            <TheadSmall>
                                오시는길<span>*</span>
                            </TheadSmall>
                            <Flex style={{ color: '#999' }}>
                                <InputStyle
                                    type="text"
                                    placeholder="오시는길"
                                    value={hookMember.directions}
                                    onChange={(e) => {
                                        hookMember.onChangeDirections(e.target.value)
                                    }}
                                />
                            </Flex>
                        </Flex>
                        <Flex style={{ width: 'calc(50% - 15px)' }}>
                            <TheadSmall>
                                지역 카테고리<span>*</span>
                            </TheadSmall>
                            <Flex style={{ color: '#999' }}>
                                <SearchCategoryNavigator
                                    curRegionCategoryId={hookMember.regionCategoryId}
                                    onSearchAction={hookMember.onChangeRegionCategoryId}
                                />
                            </Flex>
                        </Flex>
                        <Flex style={{ width: 'calc(100% - 15px)' }}>
                            <TheadSmall>
                                카페 썸네일 이미지<span>*</span>
                            </TheadSmall>
                            <ImageUploadPriorityComponent
                                key={0}
                                ref={hookMember.thumbnailImageHandlerRef}
                                dispalyId='ThumbnailImage'
                                isThumbnail={true}
                            />
                        </Flex>
                        <Flex style={{ width: 'calc(100% - 15px)' }}>
                            <TheadSmall>
                                카페 가상 이미지<span>*</span>
                            </TheadSmall>
                            <ImageUploadPriorityComponent
                                key={1}
                                ref={hookMember.virtualImageHandlerRef}
                                dispalyId='VirtualImage'
                            />
                        </Flex>
                        <Flex style={{ width: 'calc(100% - 15px)' }}>
                            <TheadSmall>
                                카페 실제 이미지<span>*</span>
                            </TheadSmall>
                            <ImageUploadPriorityComponent
                                key={2}
                                ref={hookMember.realImageHandlerRef}
                                dispalyId='RealImage'
                            />
                        </Flex>
                        <Flex style={{ width: 'calc(100% - 15px)' }}>
                            <TheadSmall>
                                카페 가상 링크<span>*</span>
                            </TheadSmall>
                            <VirtualLinkUploadComponent
                                key={2}
                                ref={hookMember.virtualLinkHandlerRef}
                            />
                        </Flex>
                        {/* </>
            )} */}
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

export default AdminUserCreateScreen;
