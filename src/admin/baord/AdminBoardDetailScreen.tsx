"use client"

import React from 'react';
// import { useRouter, useParams } from 'next/navigation';
import { useAdminBoardDetailScreen } from './hooks/useAdminBoardDetailScreen';
import { BoardType } from '@/data/prisma-client';
import { BorderRoundedContent, ContentHeader, StyledButton, TheadSmall, InputStyle } from '@/common/styledAdmin';
import { Flex, FlexRow } from '@/common/styledComponents';
import { fenxyBlue } from '@/util/constants/style';
import ImageUploadCard from '../cafeinfo/components/ImageUploadCard';

const AdminBoardDetailScreen: React.FC = () => {

  const hookMember = useAdminBoardDetailScreen();

  if (hookMember.isLoading) {
    return (
      <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', width: '100%' }}>
        <div style={{ marginLeft: 240, padding: 20, minWidth: 1100 }}>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            로딩 중...
          </div>
        </div>
      </div>
    );
  }

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

  if (!hookMember.board) {
    return (
      <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', width: '100%' }}>
        <div style={{ marginLeft: 240, padding: 20, minWidth: 1100 }}>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            게시판을 찾을 수 없습니다.
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
            {hookMember.isEditing ? '게시판 수정' : '게시판 상세'}
          </div>
          <FlexRow>
            <StyledButton
              onClick={hookMember.handleBack}
              style={{ backgroundColor: '#4A5864' }}>
              목록으로
            </StyledButton>
            {!hookMember.isEditing ? (
              <StyledButton
                onClick={() => hookMember.setEditMode(true)}
                style={{ background: fenxyBlue }}>
                수정
              </StyledButton>
            ) : (
              <>
                <StyledButton
                  onClick={hookMember.handleCancel}
                  style={{ backgroundColor: '#4A5864' }}>
                  취소
                </StyledButton>
                <StyledButton
                  onClick={hookMember.handleSave}
                  style={{ background: fenxyBlue }}>
                  {hookMember.isUpdatingBoard ? '저장 중...' : '저장'}
                </StyledButton>
              </>
            )}
          </FlexRow>
        </FlexRow>

        {/* 게시판 정보 섹션 */}
        <BorderRoundedContent style={{ padding: 30 }}>
          <Flex style={{ gap: 20, flexFlow: 'wrap' }}>
            <Flex style={{ width: 'calc(50% - 15px)' }}>
              <TheadSmall>
                제목
              </TheadSmall>
              <Flex style={{ color: '#999' }}>
                <InputStyle
                  type="text"
                  value={hookMember.formData.title}
                  onChange={(e) => hookMember.handleInputChange('title', e.target.value)}
                  disabled={!hookMember.isEditing}
                  style={{
                    backgroundColor: hookMember.isEditing ? 'white' : '#F9FAFB'
                  }}
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
                  disabled={!hookMember.isEditing}
                  style={{
                    width: '100%',
                    height: '36px',
                    border: '1px solid #eee',
                    borderRadius: '4px',
                    padding: '0 8px',
                    backgroundColor: hookMember.isEditing ? 'white' : '#F9FAFB'
                  }}>
                  <option value={BoardType.BINFORM}>공지사항</option>
                  <option value={BoardType.BEVENT}>이벤트</option>
                  <option value={BoardType.BTALK}>토크</option>
                  <option value={BoardType.BQUESTION}>질문</option>
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
                  disabled={!hookMember.isEditing}
                  style={{
                    backgroundColor: hookMember.isEditing ? 'white' : '#F9FAFB'
                  }}
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
                  disabled={!hookMember.isEditing || hookMember.noEndDate}
                  style={{
                    backgroundColor: (!hookMember.isEditing || hookMember.noEndDate) ? '#F9FAFB' : 'white'
                  }}
                />
                {hookMember.isEditing && (
                  <div style={{ marginLeft: '12px', display: 'flex', alignItems: 'center' }}>
                    <input
                      type="checkbox"
                      checked={hookMember.noEndDate}
                      onChange={(e) => hookMember.handleNoEndDateChange(e.target.checked)}
                      style={{ marginRight: '8px' }}
                    />
                    <span style={{ fontSize: '14px', color: '#666' }}>종료일 없음</span>
                  </div>
                )}
              </FlexRow>
            </Flex>

            <Flex style={{ width: 'calc(50% - 15px)' }}>
              <TheadSmall>
                링크
              </TheadSmall>
              <Flex style={{ color: '#999' }}>
                <InputStyle
                  type="url"
                  value={hookMember.formData.link}
                  onChange={(e) => hookMember.handleInputChange('link', e.target.value)}
                  disabled={!hookMember.isEditing}
                  style={{
                    backgroundColor: hookMember.isEditing ? 'white' : '#F9FAFB'
                  }}
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
                  disabled={!hookMember.isEditing}
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
                  disabled={!hookMember.isEditing}
                  rows={6}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #eee',
                    borderRadius: '4px',
                    fontSize: '16px',
                    resize: 'vertical',
                    backgroundColor: hookMember.isEditing ? 'white' : '#F9FAFB'
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
                    style={{ background: !hookMember.isEditing ? '#4A5864' : fenxyBlue, cursor: !hookMember.isEditing ? 'not-allowed' : 'pointer' }}
                    >
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
                          backgroundColor: hookMember.isCafeSelected(cafe) ? '#EFF6FF' : 'transparent'
                        }}
                        onClick={() => hookMember.handleCafeSelect(cafe)}
                      >
                        <input
                          type="checkbox"
                          checked={hookMember.isCafeSelected(cafe)}
                          onChange={() => { }} // onClick에서 처리
                          style={{ marginRight: '8px' }}
                          disabled={!hookMember.isEditing}
                        />
                        {cafe.name}
                      </div>
                    ))}
                  </div>
                </Flex>
              )}
              {hookMember.curOptionCafeInfos.length > 0 && (
                <Flex style={{ width: '100%' }}>
                  <div style={{
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}>
                    {hookMember.curOptionCafeInfos.map(cafe => (
                      <div
                        key={cafe.id}
                        style={{
                          padding: '8px 12px',
                          borderBottom: '1px solid #f3f4f6',
                          cursor: 'pointer',
                          backgroundColor: hookMember.isCafeSelected(cafe) ? '#EFF6FF' : 'transparent'
                        }}
                        onClick={() => hookMember.handleCafeSelect(cafe)}
                      >
                        <input
                          type="checkbox"
                          checked={hookMember.isCafeSelected(cafe)}
                          onChange={() => { }} // onClick에서 처리
                          style={{ marginRight: '8px' }}
                          disabled={!hookMember.isEditing}
                        />
                        {cafe.name}
                      </div>
                    ))}
                  </div>
                </Flex>
              )}
              {hookMember.selectedCafeInfos.length > 0 && (
                <Flex style={{ width: '100%' }}>
                  <div style={{ marginTop: '8px', fontSize: '14px', color: '#6B7280' }}>
                    선택된 카페: {hookMember.selectedCafeInfos.length}개
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
                    disabled={!hookMember.isEditing}
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
                        isDisable={thumb.isDisable ?? false}
                        onClick={() => {
                          if (!hookMember.isEditing) return;
                          hookMember.handleRemoveImage(index)
                        }}
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

        {/* 시스템 정보 섹션 */}
        <BorderRoundedContent style={{ padding: 30 }}>
          <ContentHeader>시스템 정보</ContentHeader>
          <Flex style={{ padding: '0 30px 30px 30px' }}>
            <Flex style={{ gap: 20, flexFlow: 'wrap' }}>
              <Flex style={{ width: 'calc(50% - 15px)' }}>
                <TheadSmall>
                  생성일
                </TheadSmall>
                <Flex style={{ color: '#999' }}>
                  <div style={{
                    padding: '12px',
                    backgroundColor: '#F9FAFB',
                    borderRadius: '4px',
                    color: '#6B7280',
                    border: '1px solid #eee'
                  }}>
                    {hookMember.board.createdAt ? new Date(hookMember.board.createdAt).toLocaleDateString('ko-KR') : '-'}
                  </div>
                </Flex>
              </Flex>

              {/* <Flex style={{ width: 'calc(50% - 15px)' }}>
                  <TheadSmall>
                    수정일
                  </TheadSmall>
                  <Flex style={{ color: '#999' }}>
                    <div style={{ 
                      padding: '12px', 
                      backgroundColor: '#F9FAFB', 
                      borderRadius: '4px', 
                      color: '#6B7280',
                      border: '1px solid #eee'
                    }}>
                      {board.updatedAt ? new Date(board.updatedAt).toLocaleDateString('ko-KR') : '-'}
                    </div>
                  </Flex>
                </Flex> */}
            </Flex>
          </Flex>
        </BorderRoundedContent>
      </div>
    </div>
  );
};

export default AdminBoardDetailScreen;
