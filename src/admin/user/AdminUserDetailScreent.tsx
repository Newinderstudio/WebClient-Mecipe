"use client"

import React from 'react';
import AdminHeader from '@/common/header/AdminHeader';
import BasicModal from '@/common/modal/BasicModal';
import {
    BorderRoundedContent,
    InputStyle,
    StyledButton,
    TheadSmall,
} from '@/common/styledAdmin';
import { Flex, FlexRow } from '@/common/styledComponents';
import GetSeoulTime from '@/common/time/GetSeoulTime';
import { fenxyBlue } from '@/util/constants/style';
import { useAdminUserDetailScreen } from './hooks/useAdminUserDetailScreen';

interface Props {
  params: { id: number };
}

const AdminUserDetailScreen = (props:Props) => {
    const hookMember = useAdminUserDetailScreen({id:props.params.id});
    const btnCheckBoxStyle = {
        width: 160,
        marginLeft: -1,
        lineHeight: '36px',
        border: '1px solid #eee',
        display: 'inline-flex',
        justifyContent: 'center',
        color: '#999',
        // cursor: 'pointer',
        '&.active': {
            background: fenxyBlue,
            borderColor: fenxyBlue,
            color: 'white',
        },
        cursor: 'pointer'
    };
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
                        {/* {hookMember.user?.userType === 'BUSINESS' ? (
              <>
                <StyledButton style={{ background: yoksuriBlue }}>
                  승인
                </StyledButton>
                <StyledButton style={{ background: yoksuriBlue }}>
                  반려
                </StyledButton>
              </>
            ) : undefined} */}

                        <StyledButton
                            onClick={hookMember.onClickUpdateUser}
                            style={{ background: fenxyBlue }}>
                            수정
                        </StyledButton>
                        <StyledButton
                            style={{ backgroundColor: '#4A5864' }}
                            onClick={hookMember.onClickRouterUser}>
                            목록
                        </StyledButton>
                    </FlexRow>
                </FlexRow>

                <BorderRoundedContent style={{ padding: 30 }}>
                    <Flex style={{ gap: 20 }}>
                        <FlexRow style={{ gap: 20 }}>
                            <Flex style={{ flex: 1 }}>
                                <TheadSmall>회원번호</TheadSmall>
                                <Flex style={{ color: '#999' }}>{hookMember.user?.id}</Flex>
                            </Flex>
                            <Flex style={{ flex: 1 }}>
                                <TheadSmall>가입일</TheadSmall>
                                <Flex style={{ color: '#999' }}>
                                    {hookMember.user?.createdAt && (
                                        <GetSeoulTime time={hookMember.user.createdAt} long />
                                    )}
                                </Flex>
                            </Flex>
                        </FlexRow>
                        {/* <FlexRow style={{ gap: 20 }}>
              <Flex style={{ flex: 1 }}>
                <TheadSmall>포인트</TheadSmall>
                <Flex style={{ color: '#999' }}>?????</Flex>
              </Flex>
              <Flex style={{ flex: 1 }}>
                <TheadSmall>충전금액</TheadSmall>
                <Flex style={{ color: '#999' }}>??????</Flex>
              </Flex>
            </FlexRow> */}
                    </Flex>
                </BorderRoundedContent>

                <BorderRoundedContent style={{ padding: 30 }}>
                    <Flex style={{ gap: 20, flexFlow: 'wrap' }}>
                        <Flex style={{ flex: 1, flexBasis: '100%' }}>
                            {
                                hookMember.user?.userType !== 'ADMIN' ?
                                    <div>
                                        <TheadSmall>
                                            회원분류<span>*</span>
                                        </TheadSmall>
                                        <FlexRow className="notBottomBorder">
                                            <div
                                                style={btnCheckBoxStyle}
                                                className={`${hookMember.userType === 'GENERAL' && 'active'
                                                    }`}
                                                onClick={() => {
                                                    hookMember.onClickUserType('GENERAL')
                                                }}>
                                                일반 회원
                                            </div>
                                            <div
                                                style={btnCheckBoxStyle}
                                                className={`${hookMember.userType === 'BUSINESS' && 'active'
                                                    }`}
                                                onClick={() => {
                                                    hookMember.onClickUserType('BUSINESS')
                                                }}>
                                                비즈니스
                                            </div>
                                            <div
                                                style={btnCheckBoxStyle}
                                                className={`${hookMember.userType === 'MANAGER' && 'active'
                                                    }`}
                                                onClick={() => {
                                                    hookMember.onClickUserType('MANAGER')
                                                }}>
                                                매니저
                                            </div>
                                        </FlexRow>
                                    </div> : undefined
                            }
                        </Flex>
                        <Flex style={{ width: 'calc(50% - 15px)' }}>
                            <TheadSmall>
                                아이디<span>*</span>
                            </TheadSmall>
                            <Flex style={{ color: '#999', lineHeight: '28px' }}>
                                {hookMember.user?.loginId}
                            </Flex>
                        </Flex>
                        <Flex style={{ width: 'calc(50% - 15px)' }}>
                            <TheadSmall>
                                이름<span>*</span>
                            </TheadSmall>
                            <Flex style={{ color: '#999' }}>
                                <InputStyle
                                    type="text"
                                    value={hookMember.username}
                                    onChange={(e) => hookMember.onChangeUsername(e.target.value)}
                                />
                            </Flex>
                        </Flex>
                        <Flex style={{ width: 'calc(50% - 15px)' }}>
                            <TheadSmall>
                                별명<span>*</span>
                            </TheadSmall>
                            <Flex style={{ color: '#999', lineHeight: '28px' }}>
                                {hookMember.user?.nickname}
                            </Flex>
                        </Flex>
                        <Flex style={{ width: 'calc(50% - 15px)' }}>
                            <TheadSmall>비밀번호(변경 시 기입)</TheadSmall>
                            <Flex style={{ color: '#999' }}>
                                <InputStyle
                                    type="password"
                                    value={hookMember.password}
                                    onChange={(e) => hookMember.onChangePw(e.target.value)}
                                />
                            </Flex>
                        </Flex>
                        <Flex style={{ width: 'calc(50% - 15px)' }}>
                            <TheadSmall>비밀번호 확인</TheadSmall>
                            <Flex style={{ color: '#999' }}>
                                <InputStyle
                                    type="password"
                                    value={hookMember.repassword}
                                    onChange={(e) => hookMember.onChangeRePw(e.target.value)}
                                />
                            </Flex>
                        </Flex>

                    </Flex>
                </BorderRoundedContent>

                {/* <BorderRoundedContent style={{ padding: 30 }}>
          <Flex style={{ gap: 20 }}>

            <FlexRow style={{ gap: 20 }}>
              <Flex style={{ flex: 1 }}>
                <TheadSmall>탈퇴일자</TheadSmall>
                <Flex style={{ color: '#999' }}>
                  {hookMember.user?.EscapeUser?.[0]?.createdAt ? (
                    <GetSeoulTime
                      time={hookMember.user?.EscapeUser?.[0]?.createdAt}
                      long
                    />
                  ) : (
                    '-'
                  )}
                </Flex>
              </Flex>
              <Flex style={{ flex: 1 }}>
                <TheadSmall>탈퇴사유</TheadSmall>
                <Flex style={{ color: '#999' }}>
                  {hookMember.user?.EscapeUser?.[0]?.content
                    ? hookMember.user.EscapeUser[0].content
                    : '-'}
                </Flex>
              </Flex>
            </FlexRow>
          </Flex>
        </BorderRoundedContent> */}
            </div>
            <BasicModal
                display={hookMember.modalDisplayState}
                content={hookMember.modalContent}
                confirmBtn={hookMember.onClickCompleted}
            />
        </div>
    );
};

export default AdminUserDetailScreen;
