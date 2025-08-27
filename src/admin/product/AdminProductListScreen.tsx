"use client"

import React from 'react';
import AdminTable from '@/common/table/AdminTable';
import { useAdminProductListScreen } from './hooks/useAdminProductListScreen';
import { BorderRoundedContent, ContentHeader, InputStyle, StyledButton } from '@/common/styledAdmin';
import { Flex, FlexRow } from '@/common/styledComponents';
import { fenxyBlue } from '@/util/constants/style';
import SearchProductCategoryNavigator from '@/common/input/SearchProductCategoryNavigator';

const AdminProductListScreen: React.FC = () => {
  const hookMember = useAdminProductListScreen();

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
            상품 관리
          </div>
          <FlexRow>
            <StyledButton
              onClick={hookMember.handleCreateProduct}
              style={{ background: fenxyBlue }}>
              새 상품 생성
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
                <option value="name">상품명</option>
                <option value="code">상품코드</option>
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
          <ContentHeader>상품 카테고리</ContentHeader>
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
                카테고리 선택
              </div>
              <SearchProductCategoryNavigator
                onSearchAction={hookMember.handleProductCategoryChange}
                curProductCategoryId={hookMember.selectedProductCategoryId}
              />
            </FlexRow>
          </Flex>
        </BorderRoundedContent>

        {/* 상품품 목록 섹션 */}
        <BorderRoundedContent>
          <Flex style={{ padding: 30 }}>
            <AdminTable
              headers={[
                { name: '상품명', minWidth: 300, selector: 'name' },
                {
                  name: '카테고리',
                  minWidth: 100,
                  selector: 'categoryName',
                  cell: ({ data }) => {
                    return <div>{data.categoryName || '-'}</div>;
                  }
                },
                {
                  name: '상품코드',
                  selector: 'code',
                  minWidth: 200,
                  cell: ({ data }) => {
                    return <div>{data.code}</div>;
                  },
                },
                {
                  name: '상품가격',
                  selector: 'price',
                  minWidth: 200,
                  cell: ({ data }) => {
                    return <div>{data.price}</div>;
                  },
                },
                // { name: '댓글허용', minWidth: 100, selector: 'isReplyAvaliable' },
                {
                  name: '생성일',
                  minWidth: 150,
                  selector: 'createdAt',
                  cell: ({ data }) => {
                    return <div>{data.createdAt}</div>;
                  },
                },
                {
                  name: '작업',
                  minWidth: 150,
                  cell: ({ data }: { data: { id: number } }) => (
                    <FlexRow style={{ gap: '8px' }}>
                      <StyledButton
                        onClick={() => hookMember.handleEditProduct(data.id)}
                        style={{ background: fenxyBlue, fontSize: '12px', padding: '6px 12px' }}>
                        수정
                      </StyledButton>
                      <StyledButton
                        onClick={() => hookMember.handleDeleteProduct(data.id)}
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
              datas={hookMember.products.map(product => ({
                id: product.id,
                name: product.name,
                categoryName: product.ProductCategory?.name || '-',
                code: product.code || '-',
                price: product.price || '-',
                createdAt: product.createdAt ? new Date(product.createdAt).toLocaleDateString('ko-KR') : '-'
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

export default AdminProductListScreen;
