"use client"

import { NextPage } from 'next';
import { Flex, FlexCenter, FlexRow } from '@/common/styledComponents';
import Header from '@/common/header/Header';
import { MainFooter } from '@/common/footer/MainFooter';
import { useMyPageScreen } from './hooks/useMyPageScreen';

const MyPageScreen: NextPage = () => {
    const hookMember = useMyPageScreen();

    return (
        <Flex>
            <Flex style={{ minHeight: '100vh' }}>
                <Header
                    hasBorder
                    CenterComponent={
                        <div style={{ color: '#222', fontSize: 16, fontWeight: 500 }}>
                            마이 페이지
                        </div>
                    }
                    LeftComponent={
                        <Flex>
                            {hookMember.user ? (
                                <FlexRow
                                    style={{
                                        fontSize: 12,
                                        color: 'black',
                                        fontWeight: 600,
                                    }}>
                                    <Flex
                                        style={{ fontSize: 14 }}
                                        onClick={hookMember.onClickLogout}>
                                        <div
                                            style={{
                                                cursor: 'pointer',
                                                color: 'gray',
                                                marginRight: 8,
                                                lineHeight: '18px',
                                            }}>
                                            로그아웃
                                        </div>
                                    </Flex>
                                    {hookMember.user?.nickname}님
                                </FlexRow>
                            ) : <></>}
                        </Flex>
                    }

                    RightComponent={
                        <Flex>
                            <Flex
                                style={{ fontSize: 14 }}
                                onClick={hookMember.onClickBack}>
                                <div
                                    style={{
                                        cursor: 'pointer',
                                        color: 'gray',
                                        marginRight: 8,
                                        lineHeight: '18px',
                                    }}>
                                    뒤로
                                </div>
                            </Flex>
                        </Flex>
                    }
                />
                <FlexCenter
                    style={{
                        maxWidth: 640,
                        margin: '0 auto',
                        textAlign: 'left',
                        fontSize: 12,
                        color: '#333',
                        fontWeight: 400,
                        paddingTop: 20,
                        paddingRight: 20,
                        paddingLeft: 20,
                        width: '100%'
                    }}>

                </FlexCenter>
            </Flex>
            <MainFooter />
        </Flex>
    );
};
export default MyPageScreen;