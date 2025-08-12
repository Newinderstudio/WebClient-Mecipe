import { useState } from 'react';
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
  onClickMenu: (item: { title: string, name: string, url: string }) => void;
  onClickSubMenu: (active: string) => void;
  onClickAdminMain: () => void;
  onClickCloseConfirmModal: () => void;
  onClickRouterMain: () => void;

  onClickModify: () => void;
}

export const navArray = [
  // { title: '결제관리', name: '전체조회', url: '/admin/payment' },
  { title: '카페관리', name: '카페관리', url: '/admin/cafeinfo' },
  { title: '지역카테고리관리', name: '지역카테고리관리', url: '/admin/region' },
  { title: '쿠폰관리', name: '쿠폰관리', url: '/admin/coupons' },
];

export function useAdminHeader(): hookMember {
  const userType = useTypedSelector((state) => state.account.user?.userType);
  const user = useTypedSelector((state) => state.account.user);

  const dispatch = useAppDispatch();
  const router = useRouter();

  const [confirmModal, setConfirmModal] = useState<'flex' | 'none'>('none');

  return {
    userType,
    adminName: user?.nickname || '',
    confirmModal,

    onClickLogout: () => {
      dispatch(accountSlice.logout());
      router.push('/login');
    },
    onClickMenu: (item) => {
      router.push(item.url);
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
