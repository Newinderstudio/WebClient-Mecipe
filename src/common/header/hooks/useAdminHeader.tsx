import { useEffect, useState } from 'react';
import { useTypedSelector } from '@/store';
import * as accountSlice from '@/store/slices/accountSlice';
import { useRouter } from 'next/navigation';
import { redirectUrl } from '@/util/constants/app';
import { UserType } from '@/data/prisma-client';
import { useAppDispatch } from '@/store/hooks';

interface hookMember {
  userType: UserType | undefined;
  adminName: string;
  confirmModal: 'flex' | 'none';

  onClickLogout: () => void;
  onClickMenu: (item: string) => void;
  onClickSubMenu: (active: string) => void;
  onClickAdminMain: () => void;
  onClickCloseConfirmModal: () => void;
  onClickRouterMain: () => void;

  onClickModify: () => void;
}

export const navArray = [
  // { title: '결제관리', name: '전체조회', url: '/admin/payment' },
  { title: '유저관리', name: '유저관리', url: '/admin/user' },
];

export function useAdminHeader(): hookMember {
  const userType = useTypedSelector((state) => state.account.user?.userType);
  const user = useTypedSelector((state) => state.account.user);

  const dispatch = useAppDispatch();
  const router = useRouter();

  const [confirmModal, setConfirmModal] = useState<'flex' | 'none'>('none');

  useEffect(() => {
    const sessionUserData = sessionStorage.getItem('userData');
    if (sessionUserData) {
      const userData: { user: accountSlice.UserResult; accessToken: string } =
        JSON.parse(sessionUserData);
      // if (userData.user.userType === 'ADMIN') {
      //   dispatch(accountSlice.saveUserDataInSession(userData));
      // } else if (userData.user.userType === 'HAPPYCALL') {
      //   dispatch(accountSlice.saveUserDataInSession(userData));
      // } else {
      //   router.push('/admin/login');
      // }
      if (userData.user.loginType === 'ADMIN') {
        dispatch(accountSlice.saveUserDataInSession(userData));
      } else {
        router.push('/login');
      }
    } else {
      router.push('/login');
    }
  }, []);

  return {
    userType,
    adminName: user?.nickname || '',
    confirmModal,

    onClickLogout: () => {
      dispatch(accountSlice.logout());
      router.push('/login');
    },
    onClickMenu: (item) => {
      if (item === '유저관리') {
        router.push('/admin/user');
      }
    },
    onClickSubMenu: (active: string) => {
      navArray.map((item) => {
        if (item.name === active) router.push(item.url);
      });
    },
    onClickAdminMain: () => {
      router.push('/admin');
    },
    onClickCloseConfirmModal: () => {
      if (confirmModal === 'flex') {
        setConfirmModal('none');
      } else {
        setConfirmModal('flex');
      }
    },
    onClickRouterMain: () => {
      window.open(redirectUrl, '_blank');
    },

    onClickModify: () => {
      const userId = user?.id;
      if (userId) router.push('/admin/user/' + userId);
    },
  };
}
