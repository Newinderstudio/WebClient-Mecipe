"use client"

import AdminHeader from '@/common/header/AdminHeader';
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
    SearchUserTypeArray,
    useAdminUserScreen,
} from './hooks/useAdminUserScreen';
import GetSeoulTime from '@/common/time/GetSeoulTime';
import { UserResult } from '@/api/usersApi';

const btnCheckBoxStyle = {
    width: 120,
    marginLeft: -1,
    lineHeight: '36px',
    border: '1px solid #eee',
    display: 'inline-flex',
    justifyContent: 'center',
    color: '#999',
    cursor: 'pointer',
    '&.active': {
        background: fenxyBlue,
        borderColor: fenxyBlue,
        color: 'white',
    },
};

const AdminUserScreen = () => {
    const hookMember = useAdminUserScreen();
    return (
        <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
            <AdminHeader active={'회원관리'} activeItem={'회원관리'} />
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
                        회원관리
                    </div>
                    <FlexRow>
                        <StyledButton
                            onClick={hookMember.onClickRouteCreate}
                            style={{ background: fenxyBlue }}>
                            유저 추가
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
                                <option value="닉네임">닉네임</option>
                                <option value="아이디">아이디</option>
                                <option value="이름">이름</option>
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
                        <FlexRow
                            style={{
                                minHeight: 60,
                                alignItems: 'center',
                                borderBottom: '1px solid #eee',
                            }}>
                            <div
                                style={{
                                    minWidth: 150,
                                    paddingLeft: 30,
                                }}>
                                유형
                            </div>
                            {SearchUserTypeArray.map((el, i) => (
                                <div
                                    style={btnCheckBoxStyle}
                                    onClick={() => hookMember.onClickUserType(el)}
                                    key={i.toString()}
                                    className={hookMember.userType === el ? 'active' : ''}>
                                    {el === 'MANAGER'
                                        ? '매니저'
                                        : el === 'ADMIN'
                                            ? '관리자'
                                            : el === 'GENERAL'
                                                ? '일반회원'
                                                : el === 'BUSINESS'
                                                    ? '관장'
                                                    : el === '전체'
                                                        ? '전체'
                                                        : undefined}
                                </div>
                            ))}
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
                                categories={[
                                    { title: '운영 회원' },
                                    {
                                        name: '관리자',
                                        value: hookMember.userTypeCount?.['ADMIN'] || 0,
                                    },
                                    {
                                        name: '매니저',
                                        value: hookMember.userTypeCount?.['MANAGER'] || 0,
                                    },
                                    { title: '/' },
                                    {
                                        name: '일반회원',
                                        value: hookMember.userTypeCount?.['GENERAL'] || 0,
                                    },
                                ]}
                                headers={[
                                    {
                                        name: '아이디',
                                        selector: 'loginId',
                                        cell: ({ data }: { data: UserResult }) => {
                                            return <>{data.loginId}</>;
                                        },
                                    },
                                    {
                                        name: '닉네임',
                                        selector: 'nickname',
                                        cell: ({ data }: { data: UserResult }) => {
                                            console.log(data);
                                            return (
                                                <div>
                                                    {data.nickname}
                                                </div>
                                            );
                                        },
                                    },
                                    {
                                        name: '이름',
                                        selector: 'username',
                                        cell: ({ data }: { data: UserResult }) => {
                                            return <>{data.username}</>;
                                        },
                                    },
                                    {
                                        name: '구분',
                                        selector: 'userType',
                                        cell: ({ data }: { data: UserResult }) => {
                                            let type = '-';
                                            if (data.userType === 'ADMIN') {
                                                type = '관리자';
                                            } else if (data.userType === 'GENERAL') {
                                                type = '일반회원';
                                            } else if (data.userType === 'MANAGER') {
                                                type = '매니저';
                                            }
                                            return <>{type}</>;
                                        },
                                    },
                                    {
                                        name: '가입일',
                                        selector: 'createdAt',
                                        minWidth: 200,
                                        cell: ({ data }: { data: UserResult }) => {
                                            return <GetSeoulTime time={data.createdAt} long />;
                                        },
                                    },
                                    {
                                        name: '관리',
                                        selector: 'management',
                                        cell: ({ data }: { data: UserResult }) => {
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

export default AdminUserScreen;
