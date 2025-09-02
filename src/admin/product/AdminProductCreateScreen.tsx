"use client"

import React from 'react';
import { useAdminProductCreateScreen } from './hooks/useAdminProductCreateScreen';
import { BorderRoundedContent, ContentHeader, StyledButton, TheadSmall, InputStyle } from '@/common/styledAdmin';
import { Flex, FlexRow } from '@/common/styledComponents';
import { fenxyBlue } from '@/util/constants/style';
import ImageUploadCard from '../cafeinfo/components/ImageUploadCard';
import RelatedCafeSelector from '../baord/components/RelatedCafeSelector';
import SearchProductCategoryNavigator from '@/common/input/SearchProductCategoryNavigator';

const AdminProductCreateScreen: React.FC = () => {

    const hookMember = useAdminProductCreateScreen();

    return (
        <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', width: '100%' }}>
            <div style={{ marginLeft: 240, padding: 20, minWidth: 1100 }}>
                {/* 헤더 섹션 */}
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
                        새 상품 생성
                    </div>
                    <FlexRow>
                        <StyledButton
                            onClick={hookMember.handleSubmit}
                            style={{ background: fenxyBlue }}>
                            {hookMember.isCreatingProduct ? '생성 중...' : '상품 생성'}
                        </StyledButton>
                        <StyledButton
                            onClick={hookMember.handleCancel}
                            style={{ backgroundColor: '#4A5864' }}>
                            취소
                        </StyledButton>
                    </FlexRow>
                </FlexRow>

                {/* 상품 정보 입력 섹션 */}
                <BorderRoundedContent style={{ padding: 30 }}>
                    <Flex style={{ gap: 20, flexFlow: 'wrap' }}>
                        <Flex style={{ width: 'calc(50% - 15px)' }}>
                            <TheadSmall>
                                상품명<span>*</span>
                            </TheadSmall>
                            <Flex style={{ color: '#999' }}>
                                <InputStyle
                                    type="text"
                                    placeholder="상품명을 입력하세요"
                                    value={hookMember.formData.name}
                                    onChange={(e) => hookMember.handleInputChange('name', e.target.value)}
                                    required
                                />
                            </Flex>
                        </Flex>

                        <Flex style={{ width: 'calc(50% - 15px)' }}>
                            <TheadSmall>
                                상품코드
                            </TheadSmall>
                            <FlexRow style={{ color: '#999', gap: 10 }}>
                                <InputStyle
                                    style={{ flexGrow: 1 }}
                                    type="text"
                                    placeholder="상품코드를 입력하세요"
                                    value={hookMember.formData.code}
                                    onChange={(e) => hookMember.handleInputChange('code', e.target.value)}
                                    required
                                />
                                <StyledButton
                                    onClick={() => hookMember.checkDuplicateCode(hookMember.formData.code)}
                                    style={{ background: fenxyBlue }}>
                                    중복 확인
                                </StyledButton>
                            </FlexRow>
                        </Flex>

                        <Flex style={{ width: 'calc(50% - 15px)' }}>
                            <TheadSmall>
                                상품설명
                            </TheadSmall>
                            <Flex style={{ color: '#999' }}>
                                <InputStyle
                                    type="text"
                                    value={hookMember.formData.description}
                                    onChange={(e) => hookMember.handleInputChange('description', e.target.value)}
                                />
                            </Flex>
                        </Flex>

                        <Flex style={{ width: 'calc(50% - 15px)' }}>
                            <TheadSmall>
                                가격
                            </TheadSmall>
                            <FlexRow style={{ color: '#999' }}>
                                <InputStyle
                                    type="number"
                                    value={hookMember.formData.price}
                                    onChange={(e) => hookMember.handleInputChange('price', Number(e.target.value))}
                                    required
                                />
                            </FlexRow>
                        </Flex>

                        <Flex style={{ width: 'calc(50% - 15px)' }}>
                            <TheadSmall>
                                원가
                            </TheadSmall>
                            <Flex style={{ color: '#999' }}>
                                <InputStyle
                                    type="number"
                                    placeholder="원가를 입력하세요"
                                    value={hookMember.formData.originalPrice}
                                    onChange={(e) => hookMember.handleInputChange('originalPrice', Number(e.target.value))}
                                />
                            </Flex>
                        </Flex>

                        <Flex style={{ width: 'calc(50% - 15px)' }}>
                            <TheadSmall>
                                재고
                            </TheadSmall>
                            <Flex style={{ color: '#999' }}>
                                <InputStyle
                                    type="number"
                                    placeholder="재고를 입력하세요"
                                    value={hookMember.formData.stockQuantity}
                                    onChange={(e) => hookMember.handleInputChange('stockQuantity', Number(e.target.value))}
                                />
                            </Flex>
                        </Flex>

                        <Flex style={{ width: '100%' }}>
                            <TheadSmall>
                                최소 주문 수량
                            </TheadSmall>
                            <Flex style={{ color: '#999' }}>
                                <InputStyle
                                    type="number"
                                    value={hookMember.formData.minOrderQuantity}
                                    onChange={(e) => hookMember.handleInputChange('minOrderQuantity', Number(e.target.value))}
                                    placeholder="최소 주문 수량을 입력하세요"
                                />
                            </Flex>
                        </Flex>

                        <FlexRow style={{ width: 'calc(50% - 15px)' }}>
                            <TheadSmall
                                style={{
                                    flexGrow: 1
                                }}
                            >
                                시그니처 여부
                            </TheadSmall>
                            <InputStyle
                                type="checkbox"
                                checked={hookMember.formData.isSignature}
                                onChange={(e) => hookMember.handleInputChange('isSignature', e.target.checked)}
                            />
                        </FlexRow>
                        <FlexRow style={{ width: 'calc(50% - 15px)' }}>
                            <TheadSmall
                                style={{
                                    flexGrow: 1
                                }}
                            >
                                상품 활성화
                            </TheadSmall>
                            <InputStyle
                                type="checkbox"
                                checked={hookMember.formData.isAvailable}
                                onChange={(e) => hookMember.handleInputChange('isAvailable', e.target.checked)}
                            />
                        </FlexRow>
                    </Flex>
                </BorderRoundedContent>

                {/* 연관 카페 선택 섹션 */}
                <RelatedCafeSelector
                    onCafeSelect={hookMember.handleCafeSelect}
                    isAvaliableCheckMultiple={false}
                />

                {/* 카테고리 선택 섹션 */}
                <BorderRoundedContent style={{ padding: 30 }}>
                    <ContentHeader>카테고리</ContentHeader>
                    <Flex style={{ padding: '0 30px 30px 30px' }}>
                        <Flex style={{ gap: 20, flexFlow: 'wrap' }}>
                            <SearchProductCategoryNavigator
                                onSearchAction={hookMember.handleCategorySelect}
                            />
                        </Flex>
                    </Flex>
                </BorderRoundedContent>

                {/* 이미지 업로드 섹션 */}
                <BorderRoundedContent style={{ padding: 30 }}>
                    <ContentHeader>이미지</ContentHeader>
                    <Flex style={{ padding: '0 30px 30px 30px' }}>
                        <Flex style={{ gap: 20, flexFlow: 'wrap' }}>
                            <Flex style={{ width: '100%' }}>
                                <TheadSmall>
                                    이미지 업로드
                                </TheadSmall>
                                <Flex style={{ color: '#999' }}>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={hookMember.handleImageUpload}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '1px solid #eee',
                                            borderRadius: '4px',
                                            fontSize: '16px'
                                        }}
                                    />
                                </Flex>
                            </Flex>
                            <FlexRow
                                style={{
                                    width: 'auto',
                                    gap: 10
                                }}
                            >
                                {
                                    hookMember.images.length > 0 && hookMember.images.map((thumb, index) => (
                                        <div key={index} style={{ display: 'block', alignItems: 'center' }}>
                                            <ImageUploadCard
                                                src={thumb.thumbnailUrl}
                                                alt={`thumb-${index}`}
                                                isDisable={false}
                                                onClick={() => hookMember.handleRemoveImage(index)}
                                                style={{
                                                    height: 200,
                                                    width: 200 * thumb.width / thumb.height
                                                }}
                                            />
                                            <FlexRow style={{ width: '100%', gap: 10 }}>
                                                <InputStyle
                                                    type="checkbox"
                                                    checked={hookMember.thumbnailImage === thumb}
                                                    onChange={() => hookMember.handleThumbnailImageUpload(thumb)}
                                                />
                                                <TheadSmall
                                                    style={{
                                                        flexGrow: 1
                                                    }}
                                                >썸네일</TheadSmall>
                                            </FlexRow>
                                        </div>
                                    ))

                                }
                            </FlexRow>
                        </Flex>
                    </Flex>
                </BorderRoundedContent>
            </div>
        </div>
    );
};

export default AdminProductCreateScreen;
