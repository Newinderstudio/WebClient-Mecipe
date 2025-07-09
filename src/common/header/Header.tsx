"use client"

import React, { useEffect } from 'react';
import { Flex } from '../styledComponents';
import { appContentWidth } from '@/util/constants/style';
import * as accountSlice from '@/store/slices/accountSlice';
import { useRouter } from 'next/navigation';
import { UserType } from '@/data/prisma-client';
import { useAppDispatch } from '@/store/hooks';

interface HeaderProps {
  LeftComponent?: React.ReactElement;
  CenterComponent?: React.ReactElement;
  RightComponent?: React.ReactElement;
  hasBorder?: boolean;
  transparent?: boolean;
  gray?: boolean;
  userType?:UserType
}

const Header = ({
  LeftComponent,
  CenterComponent,
  RightComponent,
  hasBorder = false,
  transparent = false,
  gray = false,
  userType
}: HeaderProps) => {

  const grayColor = gray ? { backgroundColor: '#ddd' } : {};

  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    if(userType===undefined) return;
    const sessionUserData = sessionStorage.getItem('userData');
    if (sessionUserData) {
      const userData: { user: accountSlice.UserResult; accessToken: string } =
        JSON.parse(sessionUserData);
      if (userData.user.userType === userType) {
        dispatch(accountSlice.saveUserDataInSession(userData));
      } else {
        router.push('/');
      }
    } else {
      router.push('/');
    }
  }, [dispatch, router, userType]);

  return (
    <div
      style={{ ...grayColor }}
    >
      <Flex
        style={{
          backgroundColor: transparent ? 'transparent' : 'white',
          zIndex: transparent ? 10 : 0,
          maxWidth: appContentWidth,
          margin: '0 auto',
          position: 'relative',
          ...grayColor
        }}>
        <Flex
          style={{
            flexDirection: 'row',
            paddingLeft: 20,
            paddingRight: 20,
            justifyContent: 'space-between',
            height: 50,
            alignItems: 'center',
          }}>
          {LeftComponent || <Flex style={{ width: 24, height: 24 }} />}

          <Flex
            style={{
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',

              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%,-50%)',
            }}>
            {CenterComponent || <Flex style={{ width: 24, height: 24 }} />}
          </Flex>
          {RightComponent || <Flex style={{ width: 24, height: 24 }} />}
        </Flex>
      </Flex>

      {/* Divider */}
      {hasBorder && (
        <Flex
          style={{
            width: '100%',
            height: 1,
            backgroundColor: '#eee',
          }}
        />
      )}
    </div>
  );
};

export default Header;
