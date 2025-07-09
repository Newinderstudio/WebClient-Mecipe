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
import { Flex, FlexCenter, FlexRow } from '@/common/styledComponents';
import { fenxyBlue } from '@/util/constants/style';
import { useAdminUserCreateScreen } from './hooks/useAdminUserCreateScreen';

const AdminUserCreateScreen = () => {
    const hookMember = useAdminUserCreateScreen();
    const btnCheckBoxStyle = {
        width: 160,
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
                        직원 추가
                    </div>
                    <FlexRow>
                        <StyledButton
                            style={{ background: fenxyBlue }}
                            onClick={hookMember.onClickCreateUser}>
                            저장
                        </StyledButton>
                        <StyledButton
                            style={{ backgroundColor: '#4A5864' }}
                            onClick={hookMember.onClickRouterUser}>
                            목록
                        </StyledButton>
                    </FlexRow>
                </FlexRow>

                <BorderRoundedContent style={{ padding: 30 }}>
                    <Flex style={{ gap: 20, flexFlow: 'wrap' }}>
                        <Flex style={{ flex: 1, flexBasis: '100%' }}>
                            <TheadSmall>
                                회원분류<span>*</span>
                            </TheadSmall>
                            <FlexRow className="notBottomBorder">
                                <div
                                    style={btnCheckBoxStyle}
                                    className={`${hookMember.userType === 'GENERAL' && 'active'
                                        }`}
                                    onClick={() => {
                                        hookMember.onChangeUserType('GENERAL')
                                    }}>
                                    일반 회원
                                </div>
                                <div
                                    style={btnCheckBoxStyle}
                                    className={`${hookMember.userType === 'BUSINESS' && 'active'
                                        }`}
                                    onClick={() => {
                                        hookMember.onChangeUserType('BUSINESS')
                                    }}>
                                    비즈니스
                                </div>
                                <div
                                    style={btnCheckBoxStyle}
                                    className={`${hookMember.userType === 'MANAGER' && 'active'
                                        }`}
                                    onClick={() => {
                                        hookMember.onChangeUserType('MANAGER')
                                    }}>
                                    매니저
                                </div>
                            </FlexRow>
                        </Flex>
                        <Flex style={{ width: 'calc(50% - 15px)' }}>
                            <TheadSmall>
                                아이디<span>*</span>
                            </TheadSmall>
                            <FlexRow style={{ color: '#999', lineHeight: '28px' }}>
                                <InputStyle
                                    type="text"
                                    style={{ flexGrow: 1 }}
                                    placeholder="아이디"
                                    value={hookMember.loginId}
                                    onChange={(e) => {
                                        hookMember.onChangeLoginId(e.target.value);
                                    }}
                                />
                                <FlexCenter
                                    onClick={() => hookMember.onClickDiplucateUserId()}
                                    style={{
                                        textAlign: 'center',
                                        border: '1px solid #999',
                                        color: '#999',
                                        borderRadius: 15,
                                        padding: '0 10px',
                                        fontSize: 12,
                                        fontWeight: 400,
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                    }}>
                                    중복검사
                                </FlexCenter>
                            </FlexRow>
                            {hookMember.duplicateId && (
                                <div
                                    className="notBottomBorder"
                                    style={{ paddingTop: 8, marginBottom: 0, color: fenxyBlue }}>
                                    *중복검사를 해주세요.
                                </div>
                            )}
                        </Flex>
                        <Flex style={{ width: 'calc(50% - 15px)' }}>
                            <TheadSmall>
                                비밀번호<span>*</span>
                            </TheadSmall>
                            <Flex style={{ color: '#999' }}>
                                <InputStyle
                                    type="password"
                                    placeholder="비밀번호"
                                    value={hookMember.password}
                                    onChange={(e) => {
                                        hookMember.onChangePw(e.target.value);
                                    }}
                                />
                            </Flex>
                        </Flex>
                        {/* {hookMember.userType === 'GENERAL' && (
              <> */}
                        <Flex style={{ width: 'calc(50% - 15px)' }}>
                            <TheadSmall>
                                이름<span>*</span>
                            </TheadSmall>
                            <Flex style={{ color: '#999' }}>
                                <InputStyle
                                    type="text"
                                    placeholder="이름"
                                    value={hookMember.name}
                                    onChange={(e) => {
                                        hookMember.onChangeName(e.target.value)
                                        // hookMember.onChangeUserData('username', e.target.value);
                                    }}
                                />
                            </Flex>
                        </Flex>
                        <Flex style={{ width: 'calc(50% - 15px)' }}>
                            <TheadSmall>
                                비밀번호 확인<span>*</span>
                            </TheadSmall>
                            <Flex style={{ color: '#999' }}>
                                <InputStyle
                                    type="password"
                                    placeholder="비밀번호 확인"
                                    value={hookMember.repassword}
                                    onChange={(e) => {
                                        hookMember.onChangeRePw(e.target.value);
                                    }}
                                />
                            </Flex>
                        </Flex>
                        <Flex style={{ width: 'calc(50% - 15px)' }}>
                            <TheadSmall>
                                별명<span>*</span>
                            </TheadSmall>
                            <FlexRow style={{ color: '#999', lineHeight: '28px' }}>
                                <InputStyle
                                    style={{
                                        flexGrow: 1,
                                    }}
                                    type="text"
                                    placeholder="별명"
                                    onChange={(e) => {
                                        hookMember.onChangeNickname(e.target.value)
                                        // hookMember.onChangeUserData('nickname', e.target.value);
                                    }}
                                />
                                <FlexCenter
                                    onClick={() => hookMember.onClickDiplucateNickname()}
                                    style={{
                                        textAlign: 'center',
                                        border: '1px solid #999',
                                        color: '#999',
                                        borderRadius: 15,
                                        padding: '0 10px',
                                        fontSize: 12,
                                        fontWeight: 400,
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                    }}>
                                    중복검사
                                </FlexCenter>
                            </FlexRow>
                            {hookMember.duplicateNickname && (
                                <div
                                    className="notBottomBorder"
                                    style={{
                                        paddingTop: 8,
                                        marginBottom: 0,
                                        color: fenxyBlue,
                                    }}>
                                    *중복검사를 해주세요.
                                </div>
                            )}
                        </Flex>
                        <Flex style={{ width: 'calc(50% - 15px)' }}>
                            <TheadSmall>
                                전화번호<span>*</span>
                            </TheadSmall>
                            <Flex style={{ color: '#999' }}>
                                <InputStyle
                                    type="text"
                                    placeholder="전화번호"
                                    value={hookMember.email}
                                    onChange={(e) => {
                                        let text = e.target.value;
                                        text = text
                                          .replace(/[^0-9]/g, '')
                                          .replace(
                                            /(^02|^0505|^1[0-9]{3}|^0[0-9]{2})([0-9]+)?([0-9]{4})$/,
                                            '$1-$2-$3',
                                          )
                                          .replace('--', '-');
                                        hookMember.onChangePhone(text)
                                        // hookMember.onChangeUserData('username', e.target.value);
                                    }}
                                />
                            </Flex>
                        </Flex>
                        {/* </>
            )} */}
                    </Flex>
                </BorderRoundedContent>
            </div>
            <BasicModal
                display={hookMember.modalDisplayState}
                content={hookMember.modalContent}
                confirmBtn={hookMember.onClickCompleted}
            />
        </div>
    );
};

export default AdminUserCreateScreen;
