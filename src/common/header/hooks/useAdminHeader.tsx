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
  onClickMenu: (item: NavItem) => void;
  onClickSubMenu: (activeItem: {name:string, url:string}) => void;
  onClickAdminMain: () => void;
  onClickCloseConfirmModal: () => void;
  onClickRouterMain: () => void;

  onClickModify: () => void;
}

export interface NavItem {
  title: string;
  children: { name: string, url: string }[];
}

export const navArray:NavItem[] = [
  // { title: '결제관리', name: '전체조회', url: '/admin/payment' },
  { title: '카페관리', children: [
    { name: '카페관리', url: '/admin/cafeinfo' },
  ] },
  { title: '지역카테고리관리', children: [
    { name: '지역카테고리관리', url: '/admin/region' },
  ] },
    { title: '쿠폰관리', children: [
    { name: '쿠폰생성', url: '/admin/coupons/create' },
    { name: '쿠폰관리', url: '/admin/coupons/list' },
  ] },
  { title: '상품관리', children: [
    { name: '상품관리', url: '/admin/product' },
    { name: '상품카테고리관리', url: '/admin/product/category' },
  ] },
  { title: '게시판관리', children: [
    { name: '게시판관리', url: '/admin/board' },
  ] },
  { title: '메타뷰어관리', children: [
    { name: '메타뷰어관리', url: '/admin/metaviewerinfos' },
  ] },
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
    onClickMenu: (item: NavItem) => {
      router.push(item.children[0].url);
    },
    onClickSubMenu: (activeItem: {name:string, url:string}) => {
      router.push(activeItem.url);
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
