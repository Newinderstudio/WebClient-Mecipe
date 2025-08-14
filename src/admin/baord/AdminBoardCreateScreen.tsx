"use client"

import React from 'react';
import { useAdminBoardCreateScreen } from './hooks/useAdminBoardCreateScreen';
import { BoardType } from '@/data/prisma-client';
import { BorderRoundedContent, ContentHeader, StyledButton, TheadSmall, InputStyle } from '@/common/styledAdmin';
import { Flex, FlexRow } from '@/common/styledComponents';
import { fenxyBlue } from '@/util/constants/style';
import ImageUploadCard from '../cafeinfo/components/ImageUploadCard';

const AdminBoardCreateScreen: React.FC = () => {


  const hookMember = useAdminBoardCreateScreen();



  if (hookMember.error) {
    return (
      <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', width: '100%' }}>
        <div style={{ marginLeft: 240, padding: 20, minWidth: 1100 }}>
          <div style={{ color: 'red', textAlign: 'center', padding: '20px' }}>
            오류가 발생했습니다: {hookMember.error.message}
          </div>
        </div>
      </div>
    );
  }

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
            새 게시판 생성
          </div>
          <FlexRow>
            <StyledButton
              onClick={hookMember.handleSubmit}
              style={{ background: fenxyBlue }}>
              {hookMember.isCreatingCafe ? '생성 중...' : '게시판 생성'}
            </StyledButton>
            <StyledButton
              onClick={hookMember.handleCancel}
              style={{ backgroundColor: '#4A5864' }}>
              취소
            </StyledButton>
          </FlexRow>
        </FlexRow>

        {/* 게시판 정보 입력 섹션 */}
        <BorderRoundedContent style={{ padding: 30 }}>
          <Flex style={{ gap: 20, flexFlow: 'wrap' }}>
            <Flex style={{ width: 'calc(50% - 15px)' }}>
              <TheadSmall>
                제목<span>*</span>
              </TheadSmall>
              <Flex style={{ color: '#999' }}>
                <InputStyle
                  type="text"
                  placeholder="제목을 입력하세요"
                  value={hookMember.formData.title}
                  onChange={(e) => hookMember.handleInputChange('title', e.target.value)}
                  required
                />
              </Flex>
            </Flex>

            <Flex style={{ width: 'calc(50% - 15px)' }}>
              <TheadSmall>
                게시판 타입
              </TheadSmall>
              <Flex style={{ color: '#999' }}>
                <select
                  value={hookMember.formData.boardType}
                  onChange={(e) => hookMember.handleInputChange('boardType', e.target.value as BoardType)}
                  style={{
                    width: '100%',
                    height: '36px',
                    border: '1px solid #eee',
                    borderRadius: '4px',
                    padding: '0 8px'
                  }}>
                  <option value={BoardType.BINFORM}>공지사항</option>
                  <option value={BoardType.BEVENT}>이벤트</option>
                  <option value={BoardType.BTALK}>토크</option>
                  <option value={BoardType.BQUESTION}>질문</option>
                  {/* <option value="GENERAL">일반</option> */}
                </select>
              </Flex>
            </Flex>

            <Flex style={{ width: 'calc(50% - 15px)' }}>
              <TheadSmall>
                시작일
              </TheadSmall>
              <Flex style={{ color: '#999' }}>
                <InputStyle
                  type="date"
                  value={hookMember.formData.startDay}
                  onChange={(e) => hookMember.handleInputChange('startDay', e.target.value)}
                />
              </Flex>
            </Flex>

            <Flex style={{ width: 'calc(50% - 15px)' }}>
              <TheadSmall>
                종료일
              </TheadSmall>
              <FlexRow style={{ color: '#999' }}>
                <InputStyle
                  type="date"
                  value={hookMember.formData.endDay}
                  onChange={(e) => hookMember.handleInputChange('endDay', e.target.value)}
                  disabled={hookMember.noEndDate}
                  style={{
                    backgroundColor: hookMember.noEndDate ? '#F9FAFB' : 'white'
                  }}
                />
                <div style={{ marginLeft: '12px', display: 'flex', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    checked={hookMember.noEndDate}
                    onChange={(e) => hookMember.handleNoEndDateChange(e.target.checked)}
                    style={{ marginRight: '8px' }}
                  />
                  <span style={{ fontSize: '14px', color: '#666' }}>종료일 없음</span>
                </div>
              </FlexRow>
            </Flex>

            <Flex style={{ width: 'calc(50% - 15px)' }}>
              <TheadSmall>
                링크
              </TheadSmall>
              <Flex style={{ color: '#999' }}>
                <InputStyle
                  type="url"
                  placeholder="링크를 입력하세요"
                  value={hookMember.formData.link}
                  onChange={(e) => hookMember.handleInputChange('link', e.target.value)}
                />
              </Flex>
            </Flex>

            <Flex style={{ width: 'calc(50% - 15px)' }}>
              <TheadSmall>
                댓글 허용
              </TheadSmall>
              <Flex style={{ color: '#999', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={hookMember.formData.isReplyAvaliable}
                  onChange={(e) => hookMember.handleInputChange('isReplyAvaliable', e.target.checked)}
                  style={{ marginRight: '8px' }}
                />
                <span>댓글 작성 허용</span>
              </Flex>
            </Flex>

            <Flex style={{ width: '100%' }}>
              <TheadSmall>
                내용
              </TheadSmall>
              <Flex style={{ color: '#999' }}>
                <textarea
                  value={hookMember.formData.content}
                  onChange={(e) => hookMember.handleInputChange('content', e.target.value)}
                  rows={6}
                  placeholder="내용을 입력하세요"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #eee',
                    borderRadius: '4px',
                    fontSize: '16px',
                    resize: 'vertical'
                  }}
                />
              </Flex>
            </Flex>
          </Flex>
        </BorderRoundedContent>

        {/* 연관 카페 선택 섹션 */}
        <BorderRoundedContent style={{ padding: 30 }}>
          <ContentHeader>연관 카페</ContentHeader>
          <Flex style={{ padding: '0 30px 30px 30px' }}>
            <Flex style={{ gap: 20, flexFlow: 'wrap' }}>
              <Flex style={{ width: '100%' }}>
                <TheadSmall>
                  카페 검색
                </TheadSmall>
                <FlexRow style={{ color: '#999' }}>
                  <InputStyle
                    type="text"
                    placeholder="카페명으로 검색..."
                    onChange={(e) => hookMember.onChangeCafeSearchText(e.target.value)}
                    value={hookMember.cafeSearchText}
                    style={{ flexGrow: 1 }}
                  />
                  <StyledButton
                    onClick={hookMember.handleCafeSearch}
                    style={{ background: fenxyBlue }}>
                    검색
                  </StyledButton>
                </FlexRow>
              </Flex>

              {hookMember.isSearchingCafes && <div>검색 중...</div>}
              {hookMember.cafes.length > 0 && (
                <Flex style={{ width: '100%' }}>
                  <div style={{
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}>
                    {hookMember.cafes.map(cafe => (
                      <div
                        key={cafe.id}
                        style={{
                          padding: '8px 12px',
                          borderBottom: '1px solid #f3f4f6',
                          cursor: 'pointer',
                          backgroundColor: hookMember.selectedCafeIds.includes(cafe.id) ? '#EFF6FF' : 'transparent'
                        }}
                        onClick={() => hookMember.handleCafeSelect(cafe.id)}
                      >
                        <input
                          type="checkbox"
                          checked={hookMember.selectedCafeIds.includes(cafe.id)}
                          onChange={() => { }} // onClick에서 처리
                          style={{ marginRight: '8px' }}
                        />
                        {cafe.name}
                      </div>
                    ))}
                  </div>
                </Flex>
              )}
              {hookMember.selectedCafeIds.length > 0 && (
                <Flex style={{ width: '100%' }}>
                  <div style={{ marginTop: '8px', fontSize: '14px', color: '#6B7280' }}>
                    선택된 카페: {hookMember.selectedCafeIds.length}개
                  </div>
                </Flex>
              )}
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

export default AdminBoardCreateScreen;
