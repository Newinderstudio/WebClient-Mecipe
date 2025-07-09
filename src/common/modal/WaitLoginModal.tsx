import { Flex, FlexCenter } from '@/common/styledComponents';

import { useWaitLoginModal } from './hooks/useWaitLoginModal';
import { AuthCodeInput } from '../input/AuthCodeInput';

interface ModalProps {
  verifyTargetEmail: string | null;
  verifyKaKaoCode: string | null;

  onEndVerify: (authCode:string) => void;
}

const WaitLoginModal = (props: ModalProps) => {
    const hookMember = useWaitLoginModal(props.verifyTargetEmail, props.verifyKaKaoCode, props.onEndVerify);

    return (
        <FlexCenter
            style={{
                position: 'fixed',
                left: 0,
                right: 0,
                bottom: 0,
                top: 0,
                backgroundColor: 'rgba(0,0,0,0.3)',
                zIndex: 100,
            }}>
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
                            {
                                props.verifyTargetEmail? <AuthCodeInput onSubmit={(code)=>{
                                    hookMember.onCheckAuthNumber(code);
                                }} /> : <></>
                            }

                        <span>화면을 끄지 말고 기다려주세요.</span>
                        <span>로그인 하는 중입니다.</span>
                    </Flex>
                </FlexCenter>
            </div>
        </FlexCenter>
    );
};
export default WaitLoginModal;
