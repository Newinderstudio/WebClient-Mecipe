"use client"

import styled from '@emotion/styled'
import { fenxyBlue } from '@/util/constants/style'
import { Flex, FlexCenter, FlexRow } from '../styledComponents'
import Image from 'next/image'
import { useAdminTable } from './hooks/useAdminTable'
import { CSSProperties } from 'react'

const TableHeader = styled(FlexRow)({
  borderTop: '2px solid #4A5864',
  backgroundColor: '#f5f5f5',
  color: '#333',
  fontSize: 14,
  '>div': {
    borderLeft: 0,
    borderTop: 0,
    padding: 10,
  },
})

const TableRow = styled(Flex)({
  display: 'flex',
  alignItems: 'center',
  borderBottom: '1px solid #f5f5f5',
  '>div': {
    padding: 10,
  },
})

const TableCell = styled.div({
  '&, &>*': {
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
})

const PagingElement = styled(FlexRow)({
  marginTop: 30,
  gap: 4,
  justifyContent: 'center',
  alignItems: 'center',
  '>div': {
    fontSize: 12,
    width: 24,
    height: 24,
    borderRadius: 8,
    color: '#999',
    cursor: 'pointer',
  },
  '>.btnPageNum:hover, >.btnPageNum.active': {
    background: fenxyBlue,
    color: '#fff',
  },
})

interface Header<T> {
  name: string
  selector?: keyof T
  minWidth?: number
  maxWidth?: number
  cell?: ({ data }: { data: T }) => React.JSX.Element
}

interface Category {
  title?: string
  name?: string
  value?: string | number
}

interface Props<T> {
  minWidth?: number
  headers: Header<T>[]
  datas: T[]
  categories?: Category[]
  take?: number
  totalCount?: number
  page: number
  pageGroupCount?: number
  tableCss?: (item: T) => CSSProperties
  headerCss?: CSSProperties
  setPage: (page: number) => void
}

const AdminTable = <T,>({
  minWidth = 500,
  headers = [],
  datas = [],
  categories = [],
  take = 5,
  totalCount = 0,
  page = 1,
  pageGroupCount = 5,
  tableCss,
  setPage,
  headerCss
}: Props<T>) => {
  const hookMember = useAdminTable(totalCount, take, pageGroupCount, setPage)

  return (
    <Flex>
      {/* 상단 카테고리 요약 */}
      <FlexRow>
        <Flex style={{ color: '#333', marginBottom: 4, fontWeight: 500 }}>
          전체 {totalCount}
        </Flex>
        {categories?.map((item, index) => {
          if (item.title)
            return (
              <Flex key={`cat_title_${index}`} style={{ color: '#333', marginBottom: 4, marginLeft: 10 }}>
                {item.title}
              </Flex>
            )
          else if (item.name && (item.value || item.value === 0))
            return (
              <Flex key={`cat_val_${index}`} style={{ color: '#999', marginBottom: 4, marginLeft: 10 }}>
                {item.name} {item.value}
              </Flex>
            )
          else return null
        })}
      </FlexRow>

      {/* 테이블 헤더 */}
      <TableHeader style={{ minWidth }}>
        {headers.map((item, index) => {
          const minw = item.minWidth ?? 0
          const maxw = item.maxWidth

          return (
            <Flex
              key={`head_${index}`}
              style={{
                minWidth: `${minw}px`,
                maxWidth: maxw ? `${maxw}px` : undefined,
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                ...headerCss
              }}
            >
              {item.name}
            </Flex>
          )
        })}
      </TableHeader>

      {/* 테이블 데이터 로우 */}
      <Flex style={{ fontSize: 14, color: '#333' }}>
        {datas.map((item, index) => {
          const tableCssTheme = tableCss?.(item) ?? {}

          return (
            <TableRow key={`row_${index}`} style={tableCssTheme}>
              {headers.map((inItem, inIndex) => {
                const minw = inItem.minWidth ?? 0
                const maxw = inItem.maxWidth

                return (
                  <TableCell
                    key={`cell_${inIndex}`}
                    style={{
                      minWidth: minw,
                      maxWidth: maxw,
                    }}
                  >
                    {inItem.cell ? (
                      <inItem.cell data={item} />
                    ) : inItem.selector ? (
                      String(item[inItem.selector])
                    ) : (
                      ''
                    )}
                  </TableCell>
                )
              })}
            </TableRow>
          )
        })}
      </Flex>

      {/* 페이징 */}
      <Flex>
        <PagingElement>
          <FlexCenter onClick={hookMember.onClickPrevPageGroup}>
            <Image
              src="/image/admin/table/arrow-left.svg"
              width={16}
              height={16}
              alt="이전"
            />
          </FlexCenter>

          {hookMember.pageArray.map((item) => (
            <FlexCenter
              onClick={() => setPage(item)}
              className={`btnPageNum ${item === page ? 'active' : ''}`}
              key={item}
            >
              {item}
            </FlexCenter>
          ))}

          <FlexCenter onClick={hookMember.onClickNextPageGroup}>
            <Image
              src="/image/admin/table/arrow-right.svg"
              width={16}
              height={16}
              alt="다음"
            />
          </FlexCenter>
        </PagingElement>
      </Flex>
    </Flex>
  )
}

export default AdminTable