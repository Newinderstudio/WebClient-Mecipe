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
import {
    useAdminCafeInfoScreen,
} from './hooks/useAdminCafeInfoScreen';
import GetSeoulTime from '@/common/time/GetSeoulTime';
import { CafeInfoResult } from '@/api/cafeInfosApi';

const AdminCafeInfoScreen = () => {
    const hookMember = useAdminCafeInfoScreen();
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
                        카페관리
                    </div>
                    <FlexRow>
                        <StyledButton
                            onClick={hookMember.onClickRouteCreate}
                            style={{ background: fenxyBlue }}>
                            카페 추가
                        </StyledButton>
                        {/* <StyledButton
              onClick={() => hookMember.onClickDeleteChecked()}
              style={{ backgroundColor: '#4A5864' }}>
              선택삭제
            </StyledButton> */}
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
                                <option value="이름">이름</option>
                                <option value="주소">주소</option>
                                <option value="사업자번호">사업자번호</option>
                                <option value="사업자명">사업자명</option>
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
                                        name: '이름',
                                        selector: 'name',
                                    },
                                    {
                                        name: '주소',
                                        selector: 'address',
                                        minWidth: 300,
                                        cell: ({ data }: { data: CafeInfoResult }) => {
                                            return <div style={{whiteSpace:'break-spaces', overflow:'visible'}}>{data.address}</div>
                                        },
                                    },
                                    {
                                        name: '사업자번호',
                                        selector: 'businessNumber',
                                    },
                                    {
                                        name: '사업자명',
                                        selector: 'ceoName',
                                    },

                                    {
                                        name: '가입일',
                                        selector: 'createdAt',
                                        minWidth: 200,
                                        cell: ({ data }: { data: CafeInfoResult }) => {
                                            return <GetSeoulTime time={data.createdAt} long />;
                                        },
                                    },
                                    {
                                        name: '관리',
                                        cell: ({ data }: { data: CafeInfoResult }) => {
                                            return (
                                                <FlexRow
                                                    style={{
                                                        alignItems: 'center',
                                                        // justifyContent: 'center',
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

export default AdminCafeInfoScreen;
