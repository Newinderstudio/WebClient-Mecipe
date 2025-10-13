"use client"

import {
    BorderRoundedContent,
    ContentHeader,
    InputStyle,
    StyledButton,
} from '@/common/styledAdmin';
import { Flex, FlexRow } from '@/common/styledComponents';
import AdminTable from '@/common/table/AdminTable';
import { fenxyBlue } from '@/util/constants/style';
import { useAdminMetaViewerInfosListScreen } from './hooks/useAdminMetaViewerInfosListScreen';
import GetSeoulTime from '@/common/time/GetSeoulTime';
import { MetaViewerInfoResult } from '@/api/metaViewerInfosApi';

const MetaViewerInfosListScreen = () => {
    const hookMember = useAdminMetaViewerInfosListScreen();
    return (
        <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', width:'100%' }}>
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
                        메타 뷰어 관리
                    </div>
                    <FlexRow>
                        <StyledButton
                            onClick={hookMember.onClickRouteCreate}
                            style={{ background: fenxyBlue }}>
                            메타 뷰어 추가
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
                                <option value="코드">코드</option>
                                <option value="카페ID">카페ID</option>
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

                <BorderRoundedContent>
                    <Flex style={{ padding: 30 }}>
                        <FlexRow
                            style={{
                                justifyContent: 'space-between',
                                alignItems: 'flex-end',
                                height: 32,
                            }}>
                        </FlexRow>
                        <Flex style={{ paddingTop: 20 }}>
                            <AdminTable
                                totalCount={hookMember.totalCount}
                                page={hookMember.page}
                                setPage={hookMember.setPage}
                                take={hookMember.take}
                                headers={[
                                    {
                                        name: 'ID',
                                        selector: 'id',
                                        minWidth: 80,
                                    },
                                    {
                                        name: '코드',
                                        selector: 'code',
                                        minWidth: 200,
                                    },
                                    {
                                        name: '카페 ID',
                                        selector: 'cafeInfoId',
                                        minWidth: 100,
                                    },
                                    {
                                        name: '활성화 상태',
                                        minWidth: 120,
                                        cell: ({ data }: { data: MetaViewerInfoResult }) => {
                                            return (
                                                <div style={{
                                                    color: data.isDisable ? '#999' : '#4CAF50',
                                                    fontWeight: 'bold'
                                                }}>
                                                    {data.isDisable ? '비활성' : '활성'}
                                                </div>
                                            );
                                        },
                                    },
                                    {
                                        name: '활성 맵 설정',
                                        minWidth: 120,
                                        cell: ({ data }: { data: MetaViewerInfoResult }) => {
                                            return (
                                                <div style={{
                                                    color: data.ActiveMaps ? '#4CAF50' : '#f44336',
                                                    fontWeight: 'bold'
                                                }}>
                                                    {data.ActiveMaps ? '설정됨' : '미설정'}
                                                </div>
                                            );
                                        },
                                    },
                                    {
                                        name: 'World Data',
                                        minWidth: 120,
                                        cell: ({ data }: { data: MetaViewerInfoResult }) => {
                                            return (
                                                <div style={{
                                                    color: data.worldData && Object.keys(data.worldData).length > 0 ? '#4CAF50' : '#999',
                                                    fontWeight: 'bold'
                                                }}>
                                                    {data.worldData && Object.keys(data.worldData).length > 0 ? '설정됨' : '미설정'}
                                                </div>
                                            );
                                        },
                                    },
                                    {
                                        name: '생성일',
                                        selector: 'createdAt',
                                        minWidth: 200,
                                        cell: ({ data }: { data: MetaViewerInfoResult }) => {
                                            return <GetSeoulTime time={data.createdAt} long />;
                                        },
                                    },
                                    {
                                        name: '관리',
                                        cell: ({ data }: { data: MetaViewerInfoResult }) => {
                                            return (
                                                <FlexRow
                                                    style={{
                                                        alignItems: 'center',
                                                    }}>
                                                    <StyledButton
                                                        style={{
                                                            height: 28,
                                                            padding: '0 6px',
                                                            lineHeight: '26px',
                                                            minHeight: 'auto',
                                                            color: '#999',
                                                            border: '1px solid #999',
                                                            margin: 0,
                                                        }}
                                                        onClick={() =>
                                                            hookMember.onClickRouterDetail(data.id)
                                                        }>
                                                        상세보기
                                                    </StyledButton>
                                                </FlexRow>
                                            );
                                        },
                                    },
                                ]}
                                datas={hookMember.table}
                            />
                        </Flex>
                    </Flex>
                </BorderRoundedContent>
            </div>
        </div>
    );
};

export default MetaViewerInfosListScreen;

