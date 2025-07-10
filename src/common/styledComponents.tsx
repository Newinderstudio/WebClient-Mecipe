'use client'

import styled from '@emotion/styled';
import { appContentWidth, fenxyBlue, fenxyWhite } from '@/util/constants/style';

export const Flex = styled.div({
  display: 'flex',
  flexDirection: 'column',
});

export const ContentFlex = styled(Flex)({
  maxWidth: appContentWidth,
  width: '100%',
  margin: '0 auto',
});

export const FlexRow = styled.div({
  display: 'flex',
  flexDirection: 'row',
});

export const FlexCenter = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
});

export const FlexRowCenter = styled.div({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
});

export const Grid = styled.div({
  display: 'grid',
});

export const ShadowBox = styled(FlexCenter)({
  filter: 'drop-shadow(0px 0px 10px rgba(0, 0, 0, 0.1))',
  borderRadius: 4,
  backgroundColor: fenxyWhite,
});

export const ShadowBoxRow = styled(FlexRowCenter)({
  filter: 'drop-shadow(0px 0px 10px rgba(0, 0, 0, 0.1))',
  borderRadius: 4,
  backgroundColor: fenxyWhite,
});

export const FooterLayout = styled(FlexRowCenter)`
  justify-content: space-evenly;
  position: fixed;
  background-color: white; /*임의색상*/
  left: 0;
  right: 0;
  bottom: 0;
  height: 66px;
`;

export const InlineFlex = styled.div({
  display: 'inline-flex',
  flexDirection: 'column',
});

export const Tooltip = styled.div({
  ':hover': {
    '~ span': {
      display: 'flex',
      bottom: -32,
    },
  },
});

export const Tooltiptext = styled.span({
  display: 'none',

  backgroundColor: '#f5f5f5',
  borderRadius: 8,
  padding: '7px 12px',
  color: '#666',
  fontSize: 12,
  lineHeight: '150%',

  position: 'absolute',
  zIndex: 10,
});

export const CheckBoxStyleButton = styled.div({
  width: 'auto',
  marginLeft: -1,
  lineHeight: '36px',
  border: '1px solid #eee',
  display: 'inline-flex',
  justifyContent: 'center',
  color: '#999',
  // cursor: 'pointer',
  '&.active': {
      background: fenxyBlue,
      borderColor: fenxyBlue,
      color: 'white',
  },
  cursor: 'pointer'
});

export default function StyledWrapper({ children }: { children: React.ReactNode }) {
  return <Flex>{children}</Flex> // ✅ children은 그대로 유지됨
}