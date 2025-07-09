"use client"

import { Flex, FlexCenter } from '@/common/styledComponents';
// import { useVertifyEmailScreen } from './hooks/useVerifyEmailScreen';

const VerifyEmailScreen = () => {
    // const hookMember = useVertifyEmailScreen();

    return (
        <Flex>
            <Flex style={{ minHeight: '100vh' }}>
                <div>
                    <FlexCenter
                        style={{
                            maxWidth: 640,
                            margin: '0 auto',
                            textAlign: 'left',
                            fontSize: 40,
                            color: '#333',
                            fontWeight: 400,
                            paddingTop: 20,
                            paddingRight: 20,
                            paddingLeft: 20,
                        }}>

                        <Flex
                            style={{
                                textAlign: 'left',
                                fontSize: 17,
                                color: '#666',
                                fontWeight: 400,
                                paddingTop: 20,
                                paddingBottom: 40,
                            }}>
                            <span>화면을 끄지 말고 기다려주세요.</span>
                            <span>로그인 하는 중입니다.</span>
                        </Flex>
                    </FlexCenter>
                </div>
            </Flex>
        </Flex>
    );
};
export default VerifyEmailScreen;
