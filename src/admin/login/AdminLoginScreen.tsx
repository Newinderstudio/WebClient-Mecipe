"use client"

import styled from '@emotion/styled';
import { Flex, FlexCenter } from '@/common/styledComponents';
import { useAdminLoginScreen } from './hooks/useAdminLoginScreen';

const InputField = styled.input({
  '::placeholder': { color: '#888' }
})

const PasswordInputField = styled(InputField)({
  ':focus': {
    '~ #pwText': {
      display: 'block',
    },
  }
})
const LoginScreen = () => {

  const hookMember = useAdminLoginScreen();

  return (
    <Flex>
      <Flex style={{ minHeight: '100vh' }}>
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
                <span style={{}}>MECIPE</span>

                <Flex
                  style={{
                    textAlign: 'left',
                    fontSize: 17,
                    color: '#666',
                    fontWeight: 400,
                    paddingTop: 20,
                    paddingBottom: 40,
                  }}>
                  <span>환영합니다. 로그인하여 접속하세요.</span>
                </Flex>
              </FlexCenter>
              {/*  */}
              <Flex
                style={{
                  maxWidth: 640,
                  margin: '0 auto',
                  paddingRight: 20,
                  paddingLeft: 20,
                }}>
                <InputField
                  type="text"
                  placeholder="이메일"
                  style={{
                    padding: 10,
                    paddingLeft: 12,
                    fontSize: 16,
                    border: '1px solid #ddd',
                    borderRadius: 4,
                    color: '#222',
                    // flexGrow: 1,
                    width: '100%',
                  }}
                  value={hookMember.loginData.loginId}
                  maxLength={50}
                  minLength={4}
                  onChange={(e) => {
                    const text = e.target.value;
                    // text = text.replace(/[^a-zA-Z0-9-_]/g, '');
                    hookMember.onChangeLoginData('loginId', text);
                  }}
                />
                <PasswordInputField
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
                    flexShrink: 1,
                  }}
                  value={hookMember.loginData.loginPw}
                  maxLength={16}
                  onChange={(e) => {
                    hookMember.onChangeLoginData('loginPw', e.target.value);
                  }}
                  onKeyPress={
                    e => {
                      if (e.key === "Enter") hookMember.onClickLogin();
                    }
                  }
                />
                <FlexCenter
                  onClick={() => {
                    //
                    hookMember.onClickLogin();
                  }}
                  style={{
                    backgroundColor: 'blue',
                    padding: 11,
                    marginTop: 16,
                    cursor: 'pointer',
                    borderRadius: 8,
                  }}>
                  <div style={{ color: 'white', fontSize: 18, lineHeight: '28px' }}>
                    로그인
                  </div>
                </FlexCenter>
                <FlexCenter
                  style={{
                    marginTop: 50,
                    marginBottom: 50,
                  }}>
                </FlexCenter>
              </Flex>
      </Flex>
    </Flex>
  );
};
export default LoginScreen;
