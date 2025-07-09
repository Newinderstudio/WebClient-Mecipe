import React, { useEffect } from 'react';
import Image from 'next/image';
import { fenxyBlue } from '@/util/constants/style';
import { Flex, FlexCenter, FlexRow } from '../styledComponents';
import { StyledLargeButton } from '../styledAdmin';

interface AdminConfirmModalProps {
  display: 'flex' | 'none';
  title?: string;
  content?: any;
  confirmBtn?: () => void;
  confirmBtnName?: string;
  closeBtn?: () => void;
}

const AdminConfirmModal2 = (props: AdminConfirmModalProps) => {

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
      <Flex
        style={{
          width: 500,
          borderRadius: 8,
          backgroundColor: 'white',
          overflowX: 'hidden',
          justifyContent: 'flex-start',
          position: 'relative',
        }}>
        <FlexRow
          style={{
            width: '100%',
            padding: '0 20px',
            minHeight: 60,
            background: fenxyBlue,
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <div
            style={{
              color: '#fff',
              fontSize: 18,
            }}>
            {props.title ? props.title : '미리보기'}
          </div>
          <FlexCenter
            style={{
              cursor: 'pointer',
            }}
            onClick={() => {
              props?.closeBtn
                ? props.closeBtn()
                : alert(
                    '확인 버튼에 작성된 함수가 없습니다. 코드를 확인해주세요.',
                  );
            }}>
            <Image
              src={'/image/admin/icon/x-circle-white.svg'}
              width={24}
              height={24}
              alt="닫기"
              title="닫기"
            />
          </FlexCenter>
        </FlexRow>
        <div
          style={{
            maxHeight: '60vh',
            overflowY: 'auto',
          }}>
          <Flex style={{ padding: 30 }}>
            {props.content ? (
              <div
                style={{
                  width: '100%',
                  minHeight: 200,
                }}>
                {props.content}
              </div>
            ) : (
              <FlexCenter style={{ height: 300 }}>내용이 없습니다.</FlexCenter>
            )}
          </Flex>
          <FlexRow
            style={{
              padding: 30,
              paddingTop: 0,
              '> *': {
                flex: 1,
              },
            }}>
            <StyledLargeButton
              style={{ width: 215 }}
              onClick={() => {
                props?.closeBtn
                  ? props.closeBtn()
                  : alert(
                      '닫기 버튼에 작성된 함수가 없습니다. 코드를 확인해주세요.',
                    );
              }}>
              닫기
            </StyledLargeButton>

            {props?.confirmBtn && (
              <>
                <StyledLargeButton
                  style={{
                    width: 215,
                    background: fenxyBlue,
                    color: 'white',
                    border: 0,
                  }}
                  onClick={() => {
                    props?.confirmBtn
                      ? props.confirmBtn()
                      : alert(
                          '확인 버튼에 작성된 함수가 없습니다. 코드를 확인해주세요.',
                        );
                  }}>
                  {props?.confirmBtnName ? props.confirmBtnName : '확인'}
                </StyledLargeButton>
              </>
            )}
          </FlexRow>
        </div>
      </Flex>
    </FlexCenter>
  );
};

export default AdminConfirmModal2;
