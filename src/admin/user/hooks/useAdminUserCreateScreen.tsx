import { UserType } from '@/data/prisma-client';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useCreateUserByAdminMutation, useFindDuplicateUserDataMutation, UserUpdateInput } from '@/api/usersApi';
import { useTypedSelector } from '@/store';

interface hookMember {
  user: UserUpdateInput;
  loginId: string;
  password: string;
  repassword: string;
  name: string;
  nickname: string;
  email: string;
  userType: UserType | undefined;

  duplicateId: boolean,
  duplicateNickname: boolean,
  duplicatePhonenumber: boolean;

  onChangeLoginId: (val: string) => void;
  onChangePw: (val: string) => void;
  onChangeRePw: (val: string) => void;
  onChangeName: (val: string) => void;
  onChangePhone: (val: string) => void;
  onChangeNickname: (val: string) => void;
  onChangeUserType: (val: UserType) => void;

  onClickDiplucateUserId: () => void;
  onClickDiplucateNickname: () => void;

  onClickRouterUser: () => void;
  onClickCreateUser: () => void;

  modalDisplayState: 'flex' | 'none';
  onClickCompleted: () => void;
  modalContent: React.JSX.Element | string;
}

export function useAdminUserCreateScreen(): hookMember {
  const router = useRouter();
  const [user] = useState<UserUpdateInput>({
    userType: 'GENERAL',
  });

  const adminId = Number(useTypedSelector((state) => state.account.user?.id || -1));



  const [duplicateMutaion] = useFindDuplicateUserDataMutation();
  const [createUserByAdmin] = useCreateUserByAdminMutation();

  const [loginId, setLoginId] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [repassword, setRepassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [nickname, setNickname] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [userType, setUserType] = useState<UserType | undefined>(undefined);
  
  const [duplicateId, setDuplicateId] = useState<boolean>(false);
  const [duplicateNickname, setDuplicateNickname] = useState<boolean>(false);
  const [duplicatePhonenumber] =
    useState<boolean>(false);

  const [modalDisplayState, setModalDisplayState] = useState<'flex'|'none'>('none');
  const [modalContent, setModalContent] = useState<React.JSX.Element | string>(<div></div>);

  const onClickCompleted = () => {
    setModalDisplayState('none');
  }


  //유저 생성
  const onClickCreateUser = async () => {


    if (!userType) {
      setModalContent(
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontWeight: 'bold' }}>회원분류</span>
          <br />
          회원분류를 선택해주세요.
        </div>,
      );
      setModalDisplayState('flex');
      return;
    }

    if (
      loginId.length < 3 ||
      loginId.length > 11
    ) {
      setModalContent(
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontWeight: 'bold' }}>아이디</span>
          <br />
          3자이상, 15자 이하로 작성해주세요.
        </div>,
      );
      setModalDisplayState('flex');
      return;
    }
    if (duplicateId) {
      setModalContent(
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontWeight: 'bold' }}>아이디</span>
          <br />
          아이디 중복확인을 해주세요.
        </div>,
      );
      setModalDisplayState('flex');
      return;
    }
    // 비밀번호 글자수 검사
    // 비밀번호 특수문자 숫자 등 검사
    let pw = password;

    if(pw.length < 4) {
      setModalContent(
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontWeight: 'bold' }}>비밀번호</span>
          <br />
          4자 이상 작성해주세요.
        </div>,
      );
      setModalDisplayState('flex');
      return;
    }  
    else {
      console.log('통과')
    }

    pw = repassword;

    if(pw.length < 4) {
      setModalContent(
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontWeight: 'bold' }}>비밀번호 확인</span>
          <br />
          4자 이상 작성해주세요.
        </div>,
      );
      setModalDisplayState('flex');
      return;
    }      
    else {
      console.log('통과')
    }
    // 비밀번호 확인 일치 검사
    if (password !== repassword) {
      setModalContent(
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontWeight: 'bold' }}>비밀번호 확인</span>
          <br />
          비밀번호와 비밀번호 확인이
          <br />
          일치하지 않습니다.
        </div>,
      );
      setModalDisplayState('flex');

      return;
    }

    // 이름 글자수 검사

    // 닉네임 글자수 검사
    // 닉네임 중복 검사
    if (duplicateNickname) {
      setModalContent(
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontWeight: 'bold' }}>닉네임</span>
          <br />
          닉네임 중복확인을 해주세요.
        </div>,
      );
      setModalDisplayState('flex');
      return;
    }

    if (name.length <= 0) {
      setModalContent(
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontWeight: 'bold' }}>이름</span>
          <br />
          이름을 입력하여 주세요
        </div>,
      );
      setModalDisplayState('flex');
      return;
    }

    // // 휴대폰번호 중복 검사
    // if (duplicatePhonenumber) {
    //   setModalContent(
    //     <div style={{ textAlign: 'center' }}>
    //       <span style={{ fontWeight: 'bold' }}>휴대폰 번호</span>
    //       <br />
    //       휴대폰 번호 중복확인을 해주세요.
    //     </div>,
    //   );
    //   setModalDisplayState('flex');
    //   return;
    // }

    const result = await createUserByAdmin({
      adminId: adminId,
      body:{
        loginId,
        loginPw: password,
        username: name,
        loginType: (userType === 'MANAGER') ? 'ADMIN' : 'EMAIL',
        userType,
        nickname,
        email
      }
    });

    if(result.data) {
      router.back();
    } else {
      setModalContent(
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontWeight: 'bold' }}>에러!</span>
          <br />
          계정 생성 오류!
        </div>,
      );
      setModalDisplayState('flex');
      return;
    }

  };

  return {
    user,
    loginId,
    password,
    repassword,
    name,
    nickname,
    email: email,
    userType,
    duplicateId,
    duplicateNickname,
    duplicatePhonenumber,

    modalDisplayState,
    modalContent,

    onChangeLoginId: (val: string) => {
      setLoginId(val);
      setDuplicateId(true);
    },
    onChangePw: (val: string) => {
      setPassword(val);
    },
    onChangeRePw: (val: string) => {
      setRepassword(val);
    },
    onChangeName: (val: string) => {
      setName(val);
    },
    onChangeNickname: (val: string) => {
      setNickname(val);
      setDuplicateNickname(true);
    },
    onChangePhone: (val: string) => {
      setEmail(val);
    },
    onChangeUserType: (val: UserType) => {
      setUserType(val);
    },

    onClickDiplucateUserId: async () => {
      const result = await duplicateMutaion({
        type: 'loginId',
        content: loginId,
      });
      if (!result?.data || loginId.length < 3) {
        setModalDisplayState('flex');
        setModalContent(
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontWeight: 'bold' }}>아이디 중복 확인</span>
            <br />
            중복된 아이디 또는 사용 불가 아이디입니다.
          </div>,
        );
        setDuplicateId(true);
      } else {
        setDuplicateId(false);
        setModalDisplayState('flex');
        setModalContent(
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
        content: nickname,
      });
      if (!result?.data || nickname.length < 2) {
        setModalDisplayState('flex');
        setModalContent(
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontWeight: 'bold' }}>닉네임 중복 확인</span>
            <br />
            이미 사용중이거나 사용불가한 닉네임입니다.
          </div>,
        );
        setDuplicateNickname(true);
      } else {
        setDuplicateNickname(false);
        setModalDisplayState('flex');
        setModalContent(
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontWeight: 'bold' }}>닉네임 중복 확인</span>
            <br />
            사용가능한 닉네임입니다.
          </div>,
        );
      }
    },

    onClickRouterUser: () => {
      router.push(`/admin/user/`);
    },
    onClickCreateUser,
    onClickCompleted,
  };
}