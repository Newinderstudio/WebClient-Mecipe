// import { is } from 'immer/dist/internal';
import { UserType } from '@/data/prisma-client';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';;
import {
  useFindUserQuery,
  UserResult,
  useUpdateUserByAdminMutation,
} from '@/api/usersApi';

interface hookMember {
  user: UserResult | undefined;
  userType: UserType;

  userId: number;
  loginId: string;
  username: string;
  nickname: string;

  password: string;
  repassword: string;

  onClickRouterUser: () => void;
  onClickSaveUser: () => void;
  onClickUserType: (uT: UserType) => void;
  onClickUpdateUser: () => void;

  onChangeLoginId: (loginId: string) => void;
  onChangeUsername: (username: string) => void;
  onChangeNickname: (nickname: string) => void;

  onChangePw: (password: string) => void;
  onChangeRePw: (repassword: string) => void;

  modalDisplayState: 'flex' | 'none';
  onClickCompleted: () => void;
  modalContent: React.JSX.Element | string;
}

export function useAdminUserDetailScreen(props:{id:number}): hookMember {
  const router = useRouter();

  // const adminUserId = useTypedSelector((state) => state.account.user?.id || -1);

  const { data: user, refetch: userRefetch } = useFindUserQuery({
    id: Number(props.id),
  });

  const [updateUserByAdmin] = useUpdateUserByAdminMutation();

  const [modalDisplayState, setModalDisplayState] = useState<'flex' | 'none'>(
    'none',
  );
  const [modalContent, setModalContent] = useState<React.JSX.Element | string>(<div></div>);

  const onClickCompleted = () => {
    setModalDisplayState('none');
  };
  // 회원분류
  const [userType, setUserType] = useState<UserType>('GENERAL');

  // 유저정보
  const [userId, setUserId] = useState<number>(-1);
  const [loginId, setLoginId] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [nickname, setNickname] = useState<string>('');

  const [password, setPassword] = useState<string>('');
  const [repassword, setRepassword] = useState<string>('');

  useEffect(() => {
    userRefetch();
  }, [userRefetch]);


  useEffect(()=>{
    if(props.id) {
      const userId = Number(props.id);
      console.log(userId,'router!!')
      setUserId(userId)
    }
  },[props.id])

  useEffect(() => {
    if (user) {
      setUserType(user.userType);
      setLoginId(user.loginId);
      setUsername(user.username);
      setNickname(user.nickname);
    }
  }, [user]);

  const onClickUpdateUser = async () => {
    //
    console.log(userType);

    let isModified = false;

    if (password !== '' || repassword !== '') {
      let pw = password;
      // let checkNumber = pw.search(/[0-9]/g);
      // let checkEnglish = pw.search(/[a-z]/gi);

      if(pw.length < 8 || pw.length > 16) {
        setModalContent(
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontWeight: 'bold' }}>비밀번호</span>
            <br />
            8자 이상, 16자 이하로 작성해주세요.
          </div>,
        );
        setModalDisplayState('flex');
        return;
      }  
      else {
        console.log('통과')
      }
      //
      pw = repassword;
      // checkNumber = pw.search(/[0-9]/g);
      // checkEnglish = pw.search(/[a-z]/gi);

      if(pw.length < 8 || pw.length > 16) {
        setModalContent(
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontWeight: 'bold' }}>비밀번호 확인</span>
            <br />
            8자 이상, 16자 이하로 작성해주세요.
          </div>,
        );
        setModalDisplayState('flex');
        return;
      }      
      else {
        console.log('통과')
      }

      if (password !== repassword) {
        setModalDisplayState('flex');
        setModalContent(
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontWeight: 'bold' }}>비밀번호</span>
            <br />
            비밀번호와 비밀번호 확인이 일치하지 않습니다.
          </div>,
        );
        return;
      }
    }

    if (user) {
      const updateUser: {
        userId: number;
        userType?: string;
        username?: string;
        password?: string;
      } = { userId: Number(user.id) };
      if (userType !== user.userType) updateUser.userType = userType;
      if (username !== user.username) updateUser.username = username;
      if (password !== user.loginPw) updateUser.password = password;
      console.log(updateUser, 'updateUser');

      const resultUser = await updateUserByAdmin(updateUser);
      if (resultUser.data) isModified = true;

    }


    if (isModified) {
      if(confirm('수정되었습니다!(확인 시 목록으로)')) router.back();
      setPassword('');
      setRepassword('');
      userRefetch();
      
    }
  };

  const onChangeLoginId = (loginId: string) => {
    setLoginId(loginId);
  };
  const onChangeUsername = (username: string) => {
    setUsername(username);
  };
  const onChangeNickname = (nickname: string) => {
    setNickname(nickname);
  };


  return {
    user,
    userType,
    userId,
    loginId,
    username,
    nickname,

    password,
    repassword,

    modalDisplayState,
    modalContent,
    onClickCompleted,

    onClickRouterUser: () => {
      router.push(`/admin/user/`);
    },
    onClickSaveUser: () => {
      console.log(user);
    },
    onClickUserType: async (uT: UserType) => {
      setUserType(uT);
    },
    onClickUpdateUser,

    onChangeLoginId,
    onChangeNickname,
    onChangeUsername,

    onChangePw: (password: string) => {
      setPassword(password);
    },
    onChangeRePw: (repassword: string) => {
      setRepassword(repassword);
    },

  };
}
