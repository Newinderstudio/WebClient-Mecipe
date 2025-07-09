"use client"

import { Flex, FlexCenter, FlexRow } from '@/common/styledComponents';
import Header from '@/common/header/Header';
import { useMainScreen } from './hooks/useMainScreen';

function MainScreen() {
    const hookMember = useMainScreen();

    return (
        <Flex>
            <Flex style={{ minHeight: '100vh' }}>
                <Header
                    hasBorder
                    CenterComponent={
                        <div style={{ color: '#222', fontSize: 16, fontWeight: 500 }}>
                            메인화면
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
                            ) : (
                                <Flex
                                    style={{ fontSize: 14 }}
                                    onClick={hookMember.onClickSignin}>
                                    <div
                                        style={{
                                            cursor: 'pointer',
                                            color: 'gray',
                                            marginLeft: 8,
                                            lineHeight: '18px',
                                        }}>
                                        로그인
                                    </div>
                                </Flex>
                            )}
                        </Flex>
                    }

                    RightComponent={
                        <Flex>
                            {hookMember.user ? (
                                <Flex
                                    style={{ fontSize: 14 }}
                                    onClick={hookMember.onClickMyPage}>
                                    <div
                                        style={{
                                            cursor: 'pointer',
                                            color: 'gray',
                                            marginRight: 8,
                                            lineHeight: '18px',
                                        }}>
                                        마이 페이지
                                    </div>
                                </Flex>
                            ) : (
                                <></>
                            )}
                        </Flex>
                    }
                />
                <FlexCenter
                    style={{
                        maxWidth: 640,
                        margin: '0 auto',
                        textAlign: 'left',
                        fontSize: 30,
                        color: '#333',
                        fontWeight: 400,
                        paddingTop: 20,
                        paddingRight: 20,
                        paddingLeft: 20,
                        width: '100%'
                    }}>
                    <>페이지 요청 중</>

                </FlexCenter>
                {/* <FlexCenter>
            {hookMember.debugText}
        </FlexCenter> */}
            </Flex>
        </Flex>
    );
};
export default MainScreen;
