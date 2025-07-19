'use client'

import { useCallback, useEffect, useState } from 'react';
import * as accountSlice from '@/store/slices/accountSlice';
import { useAppDispatch } from '@/store/hooks';
import styled from '@emotion/styled';
import { useRouter } from 'next/navigation';
import { Flex } from '../styledComponents';

const AdminPageFlex = styled(Flex)({
    " > div + div": {
        margin: '0 auto',
        textAlign: 'left',
        fontSize: 30,
        color: '#333',
        fontWeight: 400,
        paddingTop: 20,
        paddingRight: 20,
        paddingLeft: 20,
        width: '100%',
    }
})

const AdminPageContainer = ({children}:{children:React.ReactNode}) => {
    const dispatch = useAppDispatch();
    const router = useRouter();

    const [isReady, setIsReady] = useState<boolean>(false);

    const verifyHeader = useCallback(() => {
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
                setIsReady(true);
            } else {
                setIsReady(false);
                router.push('/');
            }
        } else {
            router.push('/admin/login');
        }
    }, [dispatch, router])

    useEffect(() => {
        verifyHeader();
    }, [verifyHeader]);

    return (<AdminPageFlex>
        {isReady? children : undefined}
    </AdminPageFlex>)
}

export default AdminPageContainer;