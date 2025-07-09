import { LoginType } from '@/data/prisma-client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useFindDuplicateUserDataMutation } from '@/api/usersApi';
import * as accountSlice from '@/store/slices/accountSlice';
import { useAppDispatch } from '@/store/hooks';

interface hookMember {
  loading: boolean;

  isBusiness: boolean;

  generalUserDataErrorDisplayState: 'flex' | 'none';
  generalUserData: GeneralUserData;
  errorMessage: unknown;
  duplicateId: boolean;
  duplicateNickname: boolean;
  duplicateEmailnumber: boolean;
  checkPassword: boolean | undefined;
  username: string;

  onClickHistoryBack: () => void;
  onClickRouterGeneralSignup: () => void;
  onClickRouterBusinessSignup: () => void;

  onClickDiplucateUserId: () => void;
  onClickDiplucateNickname: () => void;
  onClickDiplucateEmailNumber: () => void;
  onChangeGeneralUserId: () => void;
  onChangeGeneralNickname: () => void;

  onChangeGeneralUserData: (
    item:
      | 'userId'
      | 'password'
      | 'repassword'
      | 'username'
      | 'nickname'
      | 'email',
    value: string,
  ) => void;
  checkSignUpInform: () => boolean;
  onClickSignup: () => void;

  onClickGeneralUserDataErrorModal: () => void;
}

export function useSignupScreen(): hookMember {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState<boolean>(false);

  const [generalUserData, setGeneralUserData] = useState<GeneralUserData>({
    userId: '',
    password: '',
    repassword: '',
    username: '',
    nickname: '',
    email: '',
  });

  const [isBusiness, setIsBussiness] = useState<boolean>(false);

  const queryCode = searchParams.get('code');
  const queryBusiness = searchParams.get('business');

  useEffect(() => {
    console.log(queryCode);
    if (queryCode) {
      setLoading(true);
    }
  }, [queryCode]);

  useEffect(() => {
    if (queryBusiness) {
      setIsBussiness(true);
    }
  }, [queryBusiness]);

  const [
    generalUserDataErrorDisplayState,
    setGeneralUserDataErrorDisplayState,
  ] = useState<'flex' | 'none'>('none');

  const onClickGeneralUserDataErrorModal = () => {
    if (generalUserDataErrorDisplayState === 'flex') {
      setGeneralUserDataErrorDisplayState('none');
    } else {
      setGeneralUserDataErrorDisplayState('flex');
    }
  };

  const [duplicateId, setDuplicateId] = useState<boolean>(false);
  const [duplicateNickname, setDuplicateNickname] = useState<boolean>(false);
  const [duplicateEmailnumber, setDuplicateEmailnumber] =
    useState<boolean>(false);
  //
  const [checkPassword, setCheckPassword] = useState<boolean | undefined>(
    undefined,
  );

  const [username] = useState<string>('');

  const [loginType] = useState<LoginType>();

  const [errorMessage, setErrorMessage] = useState<unknown>(<div></div>);

  const [duplicateMutaion] = useFindDuplicateUserDataMutation();

  const onChangeGeneralUserData = (
    item:
      | 'userId'
      | 'password'
      | 'repassword'
      | 'username'
      | 'nickname'
      | 'email',
    value: string,
  ) => {
    const clone = { ...generalUserData };
    if (item === 'userId') {
      // eslint-disable-next-line no-useless-escape
      const regExp = /[ \{\}\[\]\/?.,;:|\)*~`!^\-_+┼<>@\#$%&\'\"\\\(\=]/gi;

      if (regExp.test(value)) {
        clone[item] = '';
        setGeneralUserData(clone);
        return;
      }
    }
    if (item === 'password' || item === 'repassword') {
    }
    if (item === 'repassword') {
      if (generalUserData.password === value) {
        setCheckPassword(true);
      } else {
        setCheckPassword(false);
      }
    }
    clone[item] = value;
    setGeneralUserData(clone);
  };

  const checkSignUpInform = (): boolean => {
    // TODO 회원가입 검사 내용 필요
    // 아이디 중복 검사
    // 아이디 글자수 검사

    if (
      generalUserData.userId.length < 3 ||
      generalUserData.userId.length > 11
    ) {
      setErrorMessage(
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontWeight: 'bold' }}>아이디</span>
          <br />
          3자이상, 15자 이하로 작성해주세요.
        </div>,
      );
      setGeneralUserDataErrorDisplayState('flex');
      return false;
    }

    if (
      /[^a-zA-Z0-9-_]/g.test(generalUserData.userId)
    ) {
      setErrorMessage(
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontWeight: 'bold' }}>아이디</span>
          <br />
          영어와 숫자로 입력해주세요.
        </div>,
      );
      setGeneralUserDataErrorDisplayState('flex');
      return false;
    }

    if (duplicateId) {
      setErrorMessage(
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontWeight: 'bold' }}>아이디</span>
          <br />
          아이디 중복확인을 해주세요.
        </div>,
      );
      setGeneralUserDataErrorDisplayState('flex');
      return false;
    }
    // 비밀번호 글자수 검사
    // 비밀번호 특수문자 숫자 등 검사
    let pw = generalUserData.password;
    // let checkNumber = pw.search(/[0-9]/g);
    // let checkEnglish = pw.search(/[a-z]/gi);

    if (pw.length < 8 || pw.length > 16) {
      setErrorMessage(
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontWeight: 'bold' }}>비밀번호</span>
          <br />
          8자 이상, 16자 이하로 작성해주세요.
        </div>,
      );
      setGeneralUserDataErrorDisplayState('flex');
      return false;
    }
    else {
      console.log('통과')
    }

    pw = generalUserData.repassword;

    if (pw.length < 8 || pw.length > 16) {
      setErrorMessage(
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontWeight: 'bold' }}>비밀번호 확인</span>
          <br />
          8자 이상, 16자 이하로 작성해주세요.
        </div>,
      );
      setGeneralUserDataErrorDisplayState('flex');
      return false;
    }
    else {
      console.log('통과')
    }
    if (generalUserData.password !== generalUserData.repassword) {
      setErrorMessage(
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontWeight: 'bold' }}>비밀번호 확인</span>
          <br />
          비밀번호와 비밀번호 확인이
          <br />
          일치하지 않습니다.
        </div>,
      );
      setGeneralUserDataErrorDisplayState('flex');

      return false;
    }

    return true;
  }

  const onClickSignup = async () => {

    if (loginType === 'ADMIN' || loginType === undefined) {
      setErrorMessage(
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontWeight: 'bold' }}>로그인 타입</span>
          <br />
          로그인 타입을 확인해주세요.
        </div>,
      );
      setGeneralUserDataErrorDisplayState('flex');
      return;
    }

    if (!checkSignUpInform()) return;

    await dispatch(
      accountSlice.signup({
        loginId: generalUserData.userId,
        loginPw: generalUserData.password,
        username: generalUserData.username,
        nickname: generalUserData.nickname,
        loginType: loginType,
        userType: 'GENERAL',
        email: generalUserData.email || '',
      }),
    );

    router.push('/');

  }


  return {
    loading,

    isBusiness,

    generalUserData,
    generalUserDataErrorDisplayState,
    errorMessage,
    duplicateId,
    duplicateNickname,
    duplicateEmailnumber: duplicateEmailnumber,
    checkPassword,
    username,

    onClickHistoryBack: () => {
      window.history.back();
    },
    onClickRouterGeneralSignup: () => {
      router.replace(`/signup/general`);
    },
    onClickRouterBusinessSignup: () => {
      router.replace(`/signup/business`);
    },
    onChangeGeneralUserData,

    onClickGeneralUserDataErrorModal,

    onClickDiplucateUserId: async () => {
      const result = await duplicateMutaion({
        type: 'loginId',
        content: generalUserData.userId,
      });
      if (!result?.data || generalUserData.userId.length < 3) {
        setGeneralUserDataErrorDisplayState('flex');
        setErrorMessage(
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontWeight: 'bold' }}>아이디 중복 확인</span>
            <br />
            중복된 아이디 또는 사용 불가 아이디입니다.
          </div>,
        );
        setDuplicateId(true);
      } else {
        setDuplicateId(false);
        setGeneralUserDataErrorDisplayState('flex');
        setErrorMessage(
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontWeight: 'bold' }}>아이디 중복 확인</span>
            <br />
            사용가능한 아이디입니다.
          </div>,
        );
      }
    },
    onClickDiplucateNickname: async () => {
      const result = await duplicateMutaion({
        type: 'nickname',
        content: generalUserData.nickname,
      });
      if (!result?.data || generalUserData.nickname.length < 2) {
        setGeneralUserDataErrorDisplayState('flex');
        setErrorMessage(
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontWeight: 'bold' }}>닉네임 중복 확인</span>
            <br />
            이미 사용중이거나 사용불가한 닉네임입니다.
          </div>,
        );
        setDuplicateNickname(true);
      } else {
        setDuplicateNickname(false);
        setGeneralUserDataErrorDisplayState('flex');
        setErrorMessage(
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontWeight: 'bold' }}>닉네임 중복 확인</span>
            <br />
            사용가능한 닉네임입니다.
          </div>,
        );
      }
    },
    onClickDiplucateEmailNumber: async () => {
      const result = await duplicateMutaion({
        type: 'email',
        content: generalUserData.email,
      });
      if (!result?.data) {
        setGeneralUserDataErrorDisplayState('flex');
        setErrorMessage(
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontWeight: 'bold' }}>휴대폰 번호 중복 확인</span>
            <br />
            이미 사용중이거나 사용불가한 휴대폰 번호입니다.
          </div>,
        );
        setDuplicateEmailnumber(true);
      } else {
        setDuplicateEmailnumber(false);
        setGeneralUserDataErrorDisplayState('flex');
        setErrorMessage(
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontWeight: 'bold' }}>휴대폰 중복 확인</span>
            <br />
            사용가능한 휴대폰 번호입니다.
          </div>,
        );
      }
    },
    onChangeGeneralUserId: () => {
      setDuplicateId(true);
    },
    onChangeGeneralNickname: () => {
      setDuplicateNickname(true);
    },
    checkSignUpInform,
    onClickSignup,
  };
}

export interface GeneralUserData {
  userId: string;
  password: string;
  repassword: string;
  username: string;
  nickname: string;
  email: string;
}