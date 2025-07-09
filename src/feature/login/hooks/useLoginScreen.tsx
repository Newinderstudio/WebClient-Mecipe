import { LoginType } from '@/data/prisma-client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useFindExistUserByIdMutation as useFindExistUserByIdMutation } from '@/api/usersApi';
import * as accountSlice from '@/store/slices/accountSlice';
import { useTypedSelector } from '@/store';
import { redirectUrl } from '@/util/constants/app';
import { useAppDispatch } from '@/store/hooks';

interface LoginData {
  loginId: string;
  loginPw: string;
}

interface HookMember {
  loginData: LoginData;

  // isWaitLogin: boolean;
  verifyTargetEmail: string | null;
  verifyKaKaoCode: string | null;

  onClickLogin: () => void;
  onClickKakaoLogin: () => void;
  onChangeLoginData: (type: 'loginId' | 'loginPw', value: string) => void;

  onEndVerify: (authCode: string) => void;
}

export function useLoginScreen(): HookMember {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const searchParams = useSearchParams()

  const userType = useTypedSelector((state) => state.account.user?.userType);

  // const [isWaitLogin, setIsWaitLogin] = useState<boolean>(false);

  const [loginData, setLoginData] = useState<LoginData>({
    loginId: '',
    loginPw: '',
  });

  const [findExistUserById] = useFindExistUserByIdMutation();

  const [loginType, setLoginType] = useState<LoginType | undefined>();

  const [verifyTargetEmail, setVerifyTargetEmail] = useState<string|null>(null);

  useEffect(() => {
    if (loginType === 'KAKAO') {
      // 카카오 로그인 실행
      vertifyKakaoLogin();
    } else if (loginType === 'EMAIL') {
      vertifyEmailLogin(loginData.loginId);
    }

  }, [loginType]);

  const onChangeLoginData = (type: 'loginId' | 'loginPw', value: string) => {
    const clone = { ...loginData };
    clone[type] = value;
    setLoginData(clone);
  };

  const verifyKaKaoCode = searchParams.get("code")


  useEffect(() => {
    if (userType === 'ADMIN') {
      router.push('/admin');
    } else if (userType) {
      router.push('/');
    } else if (userType === undefined) {
      if (loginType === 'EMAIL') {

      }
      setLoginType(undefined);
      return;
    }
  }, [userType]);

  const onClickKakaoLogin = () => {
    setLoginType('KAKAO');
  };

  const onClickLogin = () => {
    if (loginData.loginId === '') return alert('이메일를 입력해주세요.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginData.loginId)) return alert('이메일 형식이 아닙니다.');
    if (loginData.loginPw === '') return alert('비밀번호를 입력해주세요.');

    setLoginType('EMAIL');
  };

  const vertifyEmailLogin = async (loginId: string) => {
    const result = await findExistUserById({ loginId });

    if (result?.data?.isExist === false) {
      if (confirm("입력하신 정보로 회원가입하시겠습니까?")) {
        setVerifyTargetEmail(loginId);
      } else {
        dispatch(accountSlice.login({ ...loginData, loginType: 'EMAIL' }));
        setVerifyTargetEmail(null);
        // setIsWaitLogin(false);
      }
    }
  }

  const vertifyKakaoLogin = async () => {
    console.log('카카오로그인');
    const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_KAKAO}&redirect_uri=${redirectUrl}/login&response_type=code`;
    router.replace(KAKAO_AUTH_URL);
  };

  const onEndVerify = (authCode: string) => {
    setVerifyTargetEmail(null);
    // setIsWaitLogin(false);
    setLoginType(undefined);

    router.replace(`/signup?$code=${authCode}`)
  }

  return {
    loginData,

    // isWaitLogin,
    verifyTargetEmail,
    verifyKaKaoCode,

    onClickKakaoLogin,
    onClickLogin,
    onChangeLoginData,
    onEndVerify,
  };
}
