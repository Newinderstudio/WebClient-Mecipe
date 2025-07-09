"use client"

import styled from '@emotion/styled';
import Image from 'next/image';
import { MainFooter } from '@/common/footer/MainFooter';
import Header from '@/common/header/Header';
import { ContentFlex, Flex, FlexCenter, FlexRow } from '@/common/styledComponents';
import { useSignupScreen } from './hooks/useSignupScreen';
import BasicModal from '@/common/modal/BasicModal';
import { use } from 'react';

const underTextCss = { marginLeft: 12, fontSize: 12, color: '#999', marginTop: 4, }

const InputField = styled.input({
  '::placeholder': { color: '#888' }
})
const RePasswordInputField = styled(InputField)({
  ':focus': {
    '~ #pwText': {
      display: 'block',
    },
  }
})

type SearchParams = Promise<{ code: string, business:string }>;

const SignupScreen = ({searchParams}: { searchParams: SearchParams })  => {

  const { code: queryCode, business: queryBusiness } = use(searchParams);

  const hookMember = useSignupScreen({queryCode, queryBusiness});
  if (hookMember.loading) {
    return (
      <Flex style={{ flex: 1, backgroundColor: 'white' }}>
        <Flex
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.3)',
            zIndex: 10,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
        </Flex>
      </Flex>
    );
  }
  return (
    <Flex>
      <Flex style={{ minHeight: '100vh' }}>

        <BasicModal
          display={hookMember.generalUserDataErrorDisplayState}
          content={hookMember.errorMessage}
          confirmBtn={() => {
            hookMember.onClickGeneralUserDataErrorModal();
          }}
        />
        <div>
          <Header
            hasBorder
            LeftComponent={
              <div
                onClick={hookMember.onClickHistoryBack}
                style={{
                  transform: 'rotate(-180deg)',
                  height: 24,
                  width: 24,
                  position: 'relative',
                  cursor: 'pointer',
                }}>
                <Image
                  src="/image/icon/arrow-right-black-tail.svg"
                  layout="fill"
                  alt="arrow"
                />
              </div>
            }
            CenterComponent={<span>회원가입</span>}
          />
        </div>
        <ContentFlex
          style={{
            padding: 20,
            alignContent: 'center',
          }}>



          {/*  */}
          {(
            <>
              <RePasswordInputField
                type="password"
                placeholder="비밀번호"
                style={{
                  marginTop: 16,
                  padding: 10,
                  paddingLeft: 12,
                  fontSize: 16,
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  color: '#222',
                  flexGrow: 1,
                  flexShrink: 1
                }}
                value={hookMember.generalUserData.password}
                maxLength={16}
                minLength={8}
                onChange={(e) => {
                  hookMember.onChangeGeneralUserData(
                    'password',
                    e.target.value,
                  );
                }}
              />
              <div
                id="pwText"
                style={{
                  ...underTextCss,
                }}>
                영문 대소문자, 숫자, 특수문자(!@#~^*&)중 3가지 이상을 <br />혼합하여 8~16자로 입력해주세요.
              </div>
              <InputField
                type="password"
                placeholder="비밀번호 확인"
                style={{
                  padding: 10,
                  paddingLeft: 12,
                  fontSize: 14,
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  color: '#333',
                  marginTop: 16,
                }}
                maxLength={16}
                value={hookMember.generalUserData.repassword}
                onChange={(e) => {
                  hookMember.onChangeGeneralUserData(
                    'repassword',
                    e.target.value,
                  );
                }}
              />
              {hookMember.checkPassword ===
                undefined ? undefined : hookMember.checkPassword ? (
                  <div style={{ ...underTextCss, color: 'blue' }}>
                    비밀번호가 일치합니다.
                  </div>
                ) : (
                <div
                  style={{ ...underTextCss, color: '#C12B2B' }}>
                  비밀번호가 일치하지 않습니다.
                </div>
              )}
            </>
          )}

          <InputField
            type="text"
            placeholder="이름"
            style={{
              padding: 10,
              paddingLeft: 12,
              fontSize: 14,
              border: '1px solid #ddd',
              borderRadius: 4,
              color: '#333',
              marginTop: 16,
            }}
            value={hookMember.generalUserData.username}
            maxLength={20}
            minLength={2}
            onChange={(e) => {
              hookMember.onChangeGeneralUserData('username', e.target.value);
            }}
          />
          <div style={underTextCss}>
            실명을 입력해주세요.
          </div>

          <FlexRow style={{ marginTop: 16 }}>
            <InputField
              type="text"
              placeholder="닉네임"
              style={{
                padding: 10,
                paddingLeft: 12,
                fontSize: 14,
                border: '1px solid #ddd',
                borderRadius: 4,
                color: '#333',
                flexGrow: 1,
              }}
              value={hookMember.generalUserData.nickname}
              maxLength={8}
              minLength={2}
              onChange={(e) => {
                const text = e.target.value;
                // text = text.replace(/[^a-zA-Z0-9가-힣ㄱ-ㅎㅏ-ㅣ-_ ]/g, '');
                hookMember.onChangeGeneralUserData('nickname', text);
                hookMember.onChangeGeneralNickname();
              }}
            />
            <FlexCenter
              onClick={hookMember.onClickDiplucateNickname}
              style={{
                backgroundColor: '#666',
                borderRadius: 4,
                height: 40,
                width: 100,
                marginLeft: 10,
                color: 'white',
                fontSize: 12,
                cursor: 'pointer',
              }}>
              중복확인
            </FlexCenter>
          </FlexRow>

          <FlexRow style={{ marginTop: 16 }}>
            <InputField
              type="tel"
              inputMode='tel'
              placeholder="이메일"
              style={{
                flex: 1,
                padding: 10,
                paddingLeft: 12,
                fontSize: 14,
                border: '1px solid #ddd',
                borderRadius: 4,
                color: '#333',
              }}
              maxLength={13}
              value={hookMember.generalUserData.email}
              onChange={(e) => {
                let text = e.target.value;
                text = text
                  .replace(/[^0-9]/g, '')
                  .replace(
                    /(^02|^0505|^1[0-9]{3}|^0[0-9]{2})([0-9]+)?([0-9]{4})$/,
                    '$1-$2-$3',
                  )
                  .replace('--', '-');
                hookMember.onChangeGeneralUserData('email', text);
              }}
            />
            <FlexCenter
              onClick={hookMember.onClickDiplucateEmailNumber}
              style={{
                backgroundColor: '#666',
                borderRadius: 4,
                height: 40,
                width: 100,
                marginLeft: 10,
                color: 'white',
                fontSize: 12,
                cursor: 'pointer',
              }}>
              중복확인
            </FlexCenter>
          </FlexRow>
          {hookMember.generalUserData.email !== '' ?
            hookMember.duplicateEmailnumber ?
              (
                <div
                  style={{
                    ...underTextCss,
                    color: '#C12B2B',
                  }}>
                  중복 확인을 해주세요.
                </div>
              ) :
              <div
                style={{
                  ...underTextCss,
                  color: 'blue',
                }}>
                사용할 수 있는 전화번호입니다.
              </div> :
            <div style={{ ...underTextCss }}>
              휴대폰 번호를 입력해주세요.
            </div>}
          {!hookMember.isBusiness ?
            <FlexCenter
              onClick={() => {
                //
                hookMember.onClickSignup();
              }}
              style={{
                backgroundColor: 'orange',
                padding: 11,
                marginTop: 16,
                cursor: 'pointer',
                borderRadius: 8,
              }}>
              <div style={{ color: 'white', fontSize: 18, lineHeight: '28px' }}>
                회원가입
              </div>
            </FlexCenter> : undefined}
        </ContentFlex>
        {/* {hookMember.isBusiness ?
          <BusinessInfoWrite checkSignUpInform={hookMember.checkSignUpInform} generalUserData={hookMember.generalUserData} />
          : undefined
        } */}
      </Flex>
      <MainFooter />
    </Flex>
  );
};
export default SignupScreen;
