"use client"

import styled from '@emotion/styled';
import { fenxyBlue } from '@/util/constants/style';
import { Flex, FlexCenter, FlexRow } from '../styledComponents';
import Image from 'next/image';
import { useAssetCategoryTable } from './hooks/useAssetCategoryTable';
import { CSSProperties } from 'react';

const TableHeaderRow = styled(FlexRow)({
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
    setPage: (page: number) => void
}

const AssetCategoryTable = <T,>({
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
}: Props<T>) => {
    const hookMember = useAssetCategoryTable(totalCount, take, pageGroupCount, setPage);

    return (
        <Flex>
            <FlexRow>
                <Flex style={{ color: '#333', marginBottom: 4, fontWeight: 500 }}>
                    전체 {totalCount}
                </Flex>
                {categories?.map((item, index) => {
                    if (item.title)
                        return (
                            <Flex key={index.toString()} style={{ color: '#333', marginBottom: 4, marginLeft: 10 }}>
                                {item.title}
                            </Flex>
                        );
                    else if (item.name && (item.value || item.value === 0))
                        return (
                            <Flex key={index.toString()} style={{ color: '#999', marginBottom: 4, marginLeft: 10 }}>
                                {item.name} {item.value}
                            </Flex>
                        );
                    else return undefined;
                })}
            </FlexRow>

            {/* 테이블 헤더 */}
            <TableHeaderRow
                style={{
                    minWidth: minWidth, // TODO
                }}>
                {headers.map((item, index) => {
                    let minw = 0;
                    let maxw = 0;
                    if (item?.minWidth) minw = item.minWidth;
                    if (item?.maxWidth) maxw = item.maxWidth;
                    return (
                        <Flex
                            key={index.toString()}
                            style={{
                                minWidth: `${minw}px`,
                                maxWidth: maxw ? maxw + 'px' : undefined,
                                flex: 1,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}>
                            {item?.name}
                        </Flex>
                    );
                })}
            </TableHeaderRow>
            {/* 페이징 */}
            <Flex>
                <PagingElement>
                    <FlexCenter onClick={hookMember.onClickPrevPageGroup}>
                        <Image
                            src={'/image/admin/table/arrow-left.svg'}
                            width={16}
                            height={16}
                            alt="이전 버튼"
                        />
                    </FlexCenter>
                    {/*  */}
                    {/* {console.log(datas.length % basicItemCount)} */}
                    {hookMember.pageArray.map((item) => (
                        <FlexCenter
                            onClick={() => {
                                setPage(item);
                            }}
                            className={'btnPageNum ' + (item === page && 'active')}
                            key={item}>
                            {item}
                        </FlexCenter>
                    ))}
                    <FlexCenter onClick={hookMember.onClickNextPageGroup}>
                        <Image
                            src={'/image/admin/table/arrow-right.svg'}
                            width={16}
                            height={16}
                            alt="다음 버튼"
                        />
                    </FlexCenter>
                </PagingElement>
            </Flex>
            {/* 테이블 로우 */}
            <Flex style={{ fontSize: 14, color: '#333' }}>
                {datas.map((item, index) => {
                    const tableCssTheme = tableCss?.(item) ?? {}
                    return (
                        <TableRow
                            key={'row_' + index.toString()}
                            style={{
                                ...tableCssTheme,
                            }}>
                            {headers.map((inItem, inIndex) => {
                                const minw = inItem.minWidth ?? 0
                                const maxw = inItem.maxWidth

                                return (
                                    <TableCell
                                        key={'cel_' + inIndex.toString()}
                                        style={{
                                            minWidth: minw,
                                            maxWidth: maxw,
                                        }}
                                    // { inItem?.minWidth ? minWidth : inItem?.minWidth}
                                    >
                                        {inItem.cell ? (
                                            <inItem.cell data={item} />
                                        ) : inItem.selector ? (
                                            String(item[inItem.selector])
                                        ) : (
                                            ''
                                        )}
                                    </TableCell>
                                );
                            })}
                        </TableRow>
                    );
                })}
            </Flex>
        </Flex>
    );
};

export default AssetCategoryTable;
