import { fenxyBlue } from '@/util/constants/style';
import { Flex, FlexCenter, FlexRow } from '../styledComponents';
import Image from 'next/image';
import { useAdminTable } from './hooks/useAdminTable';
import { Interpolation } from '@emotion/serialize';
import { Theme } from '@emotion/react';
import { useAssetCategoryTable } from './hooks/useAssetCategoryTable';

const AssetCategoryTable = ({
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
}: {
    minWidth?: number;
    headers: any[];
    datas: any[];
    categories?: any[];
    take?: number;
    totalCount?: number;
    page: number;
    pageGroupCount?: number;
    tableCss?: (item?: any) => Interpolation<Theme>;
    setPage: (page: number) => void;
}) => {
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
                            <Flex style={{ color: '#333', marginBottom: 4, marginLeft: 10 }}>
                                {item.title}
                            </Flex>
                        );
                    else if (item.name && (item.value || item.value === 0))
                        return (
                            <Flex style={{ color: '#999', marginBottom: 4, marginLeft: 10 }}>
                                {item.name} {item.value}
                            </Flex>
                        );
                    else return undefined;
                })}
            </FlexRow>

            {/* 테이블 헤더 */}
            <FlexRow
                style={{
                    borderTop: '2px solid #4A5864',
                    backgroundColor: '#f5f5f5',
                    color: '#333',
                    fontSize: 14,
                    '>div': {
                        borderLeft: 0,
                        borderTop: 0,
                        padding: 10,
                    },
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
            </FlexRow>
            {/* 페이징 */}
            <Flex>
                <FlexRow
                    style={{
                        marginTop: 30,
                        gap: 4,
                        justifyContent: 'center',
                        alignItems: 'center',
                        '>div': {
                            fontsize: 12,
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
                    }}>
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
                </FlexRow>
            </Flex>
            {/* 테이블 로우 */}
            <Flex style={{ fontSize: 14, color: '#333' }}>
                {datas.map((item, index) => {
                    const tableCssTheme: any = tableCss ? tableCss(item) : {};
                    return (
                        <FlexRow
                            key={'row_' + index.toString()}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                borderBottom: '1px solid #f5f5f5',
                                '>div': {
                                    padding: 10,
                                },
                                ...tableCssTheme,
                            }}>
                            {headers.map((inItem, inIndex) => {
                                let minw = 0;
                                let maxw = 0;
                                if (inItem?.minWidth) minw = inItem.minWidth;
                                if (inItem?.maxWidth) maxw = inItem.maxWidth;
                                return (
                                    <div
                                        key={'cel_' + inIndex.toString()}
                                        style={{
                                            minWidth: minw ? `${minw}px` : undefined,
                                            maxWidth: maxw ? maxw + 'px' : undefined,
                                            '&, &>*': {
                                                flex: 1,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            },
                                        }}
                                    // { inItem?.minWidth ? minWidth : inItem?.minWidth}
                                    >
                                        {inItem?.cell ? (
                                            <inItem.cell data={item} />
                                        ) : (
                                            item?.[inItem?.selector]
                                        )}
                                    </div>
                                );
                            })}
                        </FlexRow>
                    );
                })}
            </Flex>
        </Flex>
    );
};

export default AssetCategoryTable;
