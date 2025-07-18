"use client"

import styled from '@emotion/styled';
import Image from 'next/image';
import { fenxyBlue } from '@/util/constants/style';
import AdminAccept from '../adminAccept/AdminAccept';
import ConfirmModal from '../modal/ConfirmModal';
import { Flex, FlexCenter, FlexRow } from '../styledComponents';
// import AdminOrderAlarmList from './AdminOrderAlarmList';
import { navArray, useAdminHeader } from './hooks/useAdminHeader';

const AdminHeaderButton = styled.button({
  width: 165,
  height: 44,
  lineHeight: '44px',
  paddingLeft: 10,
  cursor: 'pointer',
  ':active': {
    backgroundColor: '#37414A',
  },
});

const AccountSettingBox = styled.div({
  position: 'relative',
  ':hover': {
    '>.accountSetting': {
      display: 'block',
    },
  }
})

const AdminHeader = ({
  hidden = false,
  active,
  activeItem
}: {
  hidden?: boolean;
  active?: string;
  activeItem?: string;
}) => {

  const hookMember = useAdminHeader();

  const Nav = ({
    parent,
    activeItem,
  }: {
    parent: string;
    activeItem?: string;
  }) => {
    return (
      <>
        <div
          style={{
            backgroundColor: '#37414A',
            fontSize: 14,
            lineHeight: '40px',
            padding:
              navArray.filter((e) => e.title === parent).length > 0
                ? '10px 0'
                : 0,
          }}>
          {navArray.map((item, index) => {
            if (item.title === parent)
              return (
                <Flex
                  key={index.toString()}
                  onClick={() => {
                    hookMember.onClickSubMenu(item.name);
                  }}
                  style={{
                    color: item.name === activeItem ? '#fff' : '#999',
                    height: 40,
                    cursor: 'pointer',
                    paddingLeft: 20,
                  }}>
                  {item.name}
                </Flex>
              );
          })}
        </div>
      </>
    );
  };

  return (
    <div style={{ display: hidden ? 'none' : 'block' }}>
      <AdminAccept />
      <ConfirmModal
        display={hookMember.confirmModal}
        content={'로그아웃 하시겠습니까?'}
        confirmBtn={hookMember.onClickLogout}
        closeBtn={hookMember.onClickCloseConfirmModal}
      />
      <FlexRow
        style={{
          backgroundColor: '#4A5864',
          height: 60,
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingRight: 20,
        }}>
        <AccountSettingBox>
          <FlexRow
            style={{
              width: 165,
              height: 60,
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
            }}>
            <Flex style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>
              {hookMember.adminName}님
            </Flex>
            <div
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                width: 16,
                height: 16,
                transform: 'rotate(90deg)',
                position: 'relative',
              }}>
              <Image
                src={'/image/icon/arrow-right-white-no-tail.svg'}
                layout="fill"
                alt="계정관리 버튼"
              />
            </div>
          </FlexRow>
          <div
            className="accountSetting"
            style={{
              position: 'absolute',
              top: 60,
              backgroundColor: '#4A5864',
              color: 'white',
              fontSize: 14,
              display: 'none',
            }}>
            <AdminHeaderButton
              onClick={hookMember.onClickCloseConfirmModal}>
              로그아웃
            </AdminHeaderButton>
            {hookMember.userType === 'ADMIN' ? (
              <>
                <div style={{ height: 1, backgroundColor: 'white' }} />
                <AdminHeaderButton
                  onClick={hookMember.onClickModify}>
                  정보수정
                </AdminHeaderButton>
              </>
            ) : undefined}
          </div>
        </AccountSettingBox>
      </FlexRow>
      {/* NOTE 좌측 카테고리 고정 */}
      <div
        style={{
          position: 'absolute',
          backgroundColor: '#4A5864',
          left: 0,
          top: 0,
          bottom: 0,
          width: 240,
        }}>
        <FlexCenter
          onClick={hookMember.onClickAdminMain}
          style={{
            width: 240,
            height: 60,
            backgroundColor: '#37414A',
            color: 'white',
            fontSize: 20,
            fontWeight: 'bold',
            cursor: 'pointer',
          }}>
          관리자
        </FlexCenter>
        {/*  */}
        {navArray.map((item, index) => {
          const title = item.title;
          return (
            <div key={index.toString()}>
              <Flex
                onClick={() => {
                  hookMember.onClickMenu(item);
                }}
                style={{
                  marginTop: 10,
                  width: 240,
                  height: 50,
                  paddingLeft: 20,
                  justifyContent: 'center',
                  fontSize: 18,
                  color: 'white',
                  fontWeight: 500,
                  cursor: 'pointer',
                  backgroundColor: active === title ? fenxyBlue : undefined,
                }}>
                {title}
              </Flex>
              {/* {active === item ? activeItem : undefined} */}
              {active === title ? (
                <Nav parent={title} activeItem={activeItem} />
              ) : undefined}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminHeader;
