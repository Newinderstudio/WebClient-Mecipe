import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import * as accountSlice from '@/store/slices/accountSlice';
import { useTypedSelector } from '@/store';
import { useAppDispatch } from '@/store/hooks';

interface LoginData {
    loginId: string;
    loginPw: string;
}

interface HookMember {
    loginData: LoginData;

    onClickLogin: () => void;
    onChangeLoginData: (type: 'loginId' | 'loginPw', value: string) => void;
}

export function useAdminLoginScreen(): HookMember {
    const dispatch = useAppDispatch();
    const router = useRouter();
    

    const userType = useTypedSelector((state) => state.account.user?.userType);

    // const [isWaitLogin, setIsWaitLogin] = useState<boolean>(false);

    const [loginData, setLoginData] = useState<LoginData>({
        loginId: '',
        loginPw: '',
    });

    const onChangeLoginData = (type: 'loginId' | 'loginPw', value: string) => {
        const clone = { ...loginData };
        clone[type] = value;
        setLoginData(clone);
    };

    useEffect(() => {
        console.log(userType);
        if (userType === 'ADMIN') {
            router.push('/admin/cafeinfo');
        } else if (userType) {
            router.push('/');
        } else if (userType === undefined) {
            return;
        }
    }, [ router, userType]);


    const onClickLogin = () => {
        if (loginData.loginId === '') return alert('이메일를 입력해주세요.');
        if (loginData.loginPw === '') return alert('비밀번호를 입력해주세요.');

        dispatch(accountSlice.login({
            ...loginData,
            loginType: 'ADMIN'
        }));
    };

    return {
        loginData,
        onClickLogin,
        onChangeLoginData,
    };
}
