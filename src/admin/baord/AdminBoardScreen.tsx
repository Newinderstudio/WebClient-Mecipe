"use client"

import React from 'react';
import AdminTable from '@/common/table/AdminTable';
import { useAdminBoardScreen } from './hooks/useAdminBoardScreen';
import { BorderRoundedContent, ContentHeader, InputStyle, StyledButton } from '@/common/styledAdmin';
import { Flex, FlexRow } from '@/common/styledComponents';
import { fenxyBlue } from '@/util/constants/style';
import GetSeoulTime from '@/common/time/GetSeoulTime';
import { BoardType } from '@/data/prisma-client';

const AdminBoardScreen: React.FC = () => {
  const hookMember = useAdminBoardScreen();

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
            게시판 관리
          </div>
          <FlexRow>
            <StyledButton
              onClick={hookMember.handleCreateBoard}
              style={{ background: fenxyBlue }}>
              새 게시판 생성
            </StyledButton>
          </FlexRow>
        </FlexRow>

        <BorderRoundedContent>
          <ContentHeader>검색</ContentHeader>
          <Flex style={{ padding: 30 }}>
            <FlexRow
              style={{
                minHeight: 60,
                alignItems: 'center',
                borderBottom: '1px solid #eee',
              }}>
              <div
                style={{
                  width: 150,
                  paddingLeft: 30,
                }}>
                검색어
              </div>
              <select
                style={{
                  width: 160,
                  marginRight: 10,
                  height: '36px',
                  border: '1px solid #eee',
                  color: '#999',
                }}
                onChange={(e) => {
                  hookMember.onChangeSearchType(e.target.value);
                }}>
                {/* <option value="없음">없음</option> */}
                <option value="title">제목</option>
                <option value="content">내용</option>
                {/* <option value="cafename">카페 이름</option> */}
              </select>
              <InputStyle
                type="text"
                placeholder="검색어를 입력해주세요."
                style={{
                  width: 320,
                  height: 36,
                  fontSize: 14,
                  border: '1px solid #eee',
                }}
                value={hookMember.searchText}
                onChange={(e) => hookMember.onChangeSearchText(e.target.value)}
              />
              <StyledButton
                onClick={hookMember.onClickSearch}
                style={{ border: 0, background: fenxyBlue, color: 'white' }}>
                검색
              </StyledButton>
            </FlexRow>
          </Flex>
        </BorderRoundedContent>

        {/* 게시판 타입 필터 섹션 */}
        <BorderRoundedContent>
          <ContentHeader>게시판 타입</ContentHeader>
          <Flex style={{ padding: 30 }}>
            <FlexRow
              style={{
                minHeight: 60,
                alignItems: 'center',
                borderBottom: '1px solid #eee',
              }}>
              <div
                style={{
                  width: 150,
                  paddingLeft: 30,
                }}>
                타입 선택
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                {hookMember.boardTypeOptions.map((option) => (
                  <StyledButton
                    key={option.value || 'all'}
                    onClick={() => hookMember.handleBoardTypeChange(option.value)}
                    style={{
                      background: hookMember.selectedBoardType === option.value ? fenxyBlue : '#4A5864',
                      fontSize: '12px',
                      padding: '6px 12px',
                    }}>
                    {option.label}
                  </StyledButton>
                ))}
              </div>
            </FlexRow>
          </Flex>
        </BorderRoundedContent>

        {/* 게시판 목록 섹션 */}
        <BorderRoundedContent>
          <Flex style={{ padding: 30 }}>
            <AdminTable
              headers={[
                { name: '제목', minWidth: 300, selector: 'title' },
                {
                  name: '타입',
                  minWidth: 100,
                  selector: 'boardType',
                  cell: ({ data }) => {
                    return <div>{data.boardType === BoardType.BINFORM ? '공지사항' : data.boardType === BoardType.BEVENT ? '이벤트' : data.boardType === BoardType.BTALK ? '토크' : data.boardType === BoardType.BQUESTION ? '질문' : '-'}</div>;
                  }
                },
                {
                  name: '시작일',
                  selector: 'startDay',
                  minWidth: 200,
                  cell: ({ data }) => {
                    return <GetSeoulTime time={data.startDay} long />;
                  },
                },
                {
                  name: '종료일',
                  selector: 'endDay',
                  minWidth: 200,
                  cell: ({ data }) => {
                    return data.endDay ? <GetSeoulTime time={data.endDay} long /> : <div>---</div>;
                  },
                },
                // { name: '댓글허용', minWidth: 100, selector: 'isReplyAvaliable' },
                {
                  name: '생성일',
                  minWidth: 150,
                  selector: 'createdAt',
                  cell: ({ data }) => {
                    return <GetSeoulTime time={data.createdAt} long />;
                  },
                },
                {
                  name: '작업',
                  minWidth: 150,
                  cell: ({ data }: { data: { id: number } }) => (
                    <FlexRow style={{ gap: '8px' }}>
                      <StyledButton
                        onClick={() => hookMember.handleEditBoard(data.id)}
                        style={{ background: fenxyBlue, fontSize: '12px', padding: '6px 12px' }}>
                        수정
                      </StyledButton>
                      <StyledButton
                        onClick={() => hookMember.handleDeleteBoard(data.id)}
                        style={{
                          background: hookMember.isDeleting ? '#999' : '#EF4444',
                          fontSize: '12px',
                          padding: '6px 12px',
                          cursor: hookMember.isDeleting ? 'not-allowed' : 'pointer'
                        }}>
                        삭제
                      </StyledButton>
                    </FlexRow>
                  )
                }
              ]}
              datas={hookMember.boards.map(board => ({
                id: board.id,
                title: board.title,
                boardType: board.boardType || '-',
                startDay: board.startDay || '-',
                endDay: board.endDay || '-',
                isReplyAvaliable: board.isReplyAvaliable ? '허용' : '비허용',
                createdAt: board.createdAt ? new Date(board.createdAt).toLocaleDateString('ko-KR') : '-'
              }))}
              totalCount={hookMember.totalCount}
              page={hookMember.currentPage}
              take={hookMember.pageSize}
              setPage={hookMember.handlePageChange}
            />
          </Flex>
        </BorderRoundedContent>
      </div>
    </div>
  );
};

export default AdminBoardScreen;
