import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import * as accountSlice from '@/store/slices/accountSlice';
import { useTypedSelector } from '@/store';
import { useAppDispatch } from '@/store/hooks';

interface HookMember {
  user: accountSlice.UserResult | undefined;
  onClickLogout(): void;
  onClickBack(): void;
}

// const membershipColor = '#789DBC';
// const equipmentColor = '#FFE3E3';
// const accessColor = '#C9E9D2';

export function useMyPageScreen(): HookMember {
  const user = useTypedSelector((state) => state.account.user);
  const router = useRouter();

  const dispatch = useAppDispatch();

  useEffect(() => {
    const sessionUserData = sessionStorage.getItem('userData');
    if (sessionUserData) {
      const userData: accountSlice.AccountState =
        JSON.parse(sessionUserData);

      dispatch(accountSlice.saveUserDataInSession(userData));
    } else {
      router.push("/");
    }
  }, [dispatch, router]);

  const onClickLogout = () => {
    // id,pw를 가져오고 슬라이스의 로그인으로 넘김
    dispatch(accountSlice.logout());
    router.push("/");
  };

  const onClickBack = () => {
    router.back();
  }
  return {
    user,
    onClickLogout,
    onClickBack,
  };
}
