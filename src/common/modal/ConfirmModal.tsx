import React, { useEffect } from 'react';
import { Flex, FlexCenter, FlexRow } from '../styledComponents';

interface ConfirmModalProps {
  display: 'flex' | 'none';
  content?: any;
  confirmBtn?: () => void;
  closeBtn?: () => void;
  scroll?: boolean;
}

const ConfirmModal = (props: ConfirmModalProps) => {
  useEffect(() => {
    if(props.scroll === true) return;
    if (props.display === 'flex') {
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100vh';
    } else {
      document.body.style.removeProperty('overflow');
      document.body.style.removeProperty('height');
    }
  }, [props.display]);

  return (
    <FlexCenter
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        top: 0,
        height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.3)',
        display: props.display,
        zIndex: 100,
      }}>
      <FlexCenter style={{ backgroundColor: 'white', borderRadius: 8 }}>
        <Flex style={{ padding: 40, fontSize: 16, color: '#222' }}>
          {props.content || (
            <div style={{ textAlign: 'center', color: 'red' }}>
              모달에 작성한 내용이 없습니다.
              <br />
              코드를 확인해주세요.
            </div>
          )}
        </Flex>
        <FlexRow
          style={{
            border: '0px solid #ddd',
            borderTopWidth: 1,
            height: 50,
            width: 320,
          }}>
          <FlexCenter
            style={{ flex: 1, cursor: 'pointer' }}
            onClick={() => {
              props?.closeBtn
                ? props.closeBtn()
                : alert(
                    '닫기 버튼에 작성된 함수가 없습니다. 코드를 확인해주세요.',
                  );
            }}>
            <div
              style={{
                fontSize: 18,
                color: '#222',
                fontWeight: 500,
              }}>
              닫기
            </div>
          </FlexCenter>
          <div style={{ width: 1, height: 49, backgroundColor: '#ddd' }} />
          <FlexCenter
            style={{ flex: 1, cursor: 'pointer' }}
            onClick={() => {
              props?.confirmBtn
                ? props.confirmBtn()
                : alert(
                    '확인 버튼에 작성된 함수가 없습니다. 코드를 확인해주세요.',
                  );
            }}>
            <div style={{ fontSize: 18, color: '#222', fontWeight: 500 }}>
              확인
            </div>
          </FlexCenter>
        </FlexRow>
      </FlexCenter>
    </FlexCenter>
  );
};

export default ConfirmModal;
