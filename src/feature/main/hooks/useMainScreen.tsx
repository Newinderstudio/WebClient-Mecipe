import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import * as accountSlice from '@/store/slices/accountSlice';
import { UserResult } from '@/store/slices/accountSlice';
import { useTypedSelector } from '@/store';
import { useAppDispatch } from '@/store/hooks';

interface HookMember {
    user: UserResult | undefined;
    onClickSignin(): void;
    onClickLogout(): void;
    onSearchText(text: string): void;
    popUpOn: boolean;
    onPopUpClose(): void;
}

export function useMainScreen({isContactUs}: {isContactUs: boolean}): HookMember {
    const user = useTypedSelector((state) => state.account.user);
    const router = useRouter();


    const [popUpOn, setPopUpOn] = useState<boolean>(false);

    const dispatch = useAppDispatch();

    useEffect(() => {
        setPopUpOn(isContactUs);
    }, [isContactUs]);

    const onPopUpClose = () => {
        setPopUpOn(false);
    };

    useEffect(() => {
        const sessionUserData = sessionStorage.getItem('userData');
        if (sessionUserData) {
            const userData: accountSlice.AccountState =
                JSON.parse(sessionUserData);

            dispatch(accountSlice.saveUserDataInSession(userData));
        }
    }, [dispatch]);

    const onClickSignin = () => {
        router.push('/login');
    };

    const onSearchText = (text: string) => {
        router.push('/search?searchText=' + text);
    };

    const onClickLogout = () => {
        // id,pw를 가져오고 슬라이스의 로그인으로 넘김
        dispatch(accountSlice.logout());
    };



    return {
        user,
        onClickSignin,
        onClickLogout,
        onSearchText,
        popUpOn,
        onPopUpClose,
    };
}
