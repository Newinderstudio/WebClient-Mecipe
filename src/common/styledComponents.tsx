'use client'

import styled from '@emotion/styled';
import { appContentWidth, fenxyBlue, fenxyWhite } from '@/util/constants/style';
import Image from 'next/image';

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

export const ResponsiveWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  width: 100%;

  @media (max-width: 768px) {
    flex-direction: column;
    justify-content: initial;
    align-items: stretch;
  }
`

const _SelectBox = styled.div`
  position: relative;
  border-radius: 2rem;
  box-shadow: 0 1px 0 1px rgba(0,0,0,.04);
  color: #444;
  background-color: #ddd;
  font-size: 1rem;
  select {
    width:100%;
    -moz-appearance: none;
    -webkit-appearance: none;
    appearance: none;
    display:block;
    background: transparent;
    border: 0 none;
    outline: 0 none;
    padding: 0.5rem 3rem 0.5rem 1rem;
    position: relative;
    z-index: 3; // select가 위로 올라와야 함
  }
  option {
    background: #ddd;
    color: #222;
    padding: 3px 0;
  }
  .icoArrow {
    position: absolute; 
    top: 0.5rem; 
    right: 0.8rem; 
    z-index: 1; 
    width: 1rem; 
    height: 1rem;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .icoArrow img {
    width: 50%;
    transition: .3s; // 부드럽게 회전
    transform: rotate(90deg)
  }
  select:focus + .icoArrow img {
    transform: rotate(270deg);
  }
`

export const SelectDropDown = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => {
  return (
    <_SelectBox>
      <select
        value={props.value}
        onChange={props.onChange}
      >
        {props.children}
      </select>
      <div className='icoArrow'>
        <Image
          src="/image/icon/arrow-right-black-no-tail.svg"
          layout="fill"
          alt="arrow"
        />
      </div>
    </_SelectBox >)
}

// export const SelectDropDown = styled.select`
//   -moz-appearance: none;
//   -webkit-appearance: none;
//   appearance: none;

//   font-family: "Noto Sansf KR", sans-serif;
//   font-size: 1rem;
//   font-weight: 400;
//   line-height: 1.5;

//   color: #444;
//   background-color: #fff;

//   padding: .6em 1.4em .5em .8em;
//   margin: 0;

//   border: 1px solid #aaa;
//   border-radius: .5em;
//   box-shadow: 0 1px 0 1px rgba(0,0,0,.04)
//   :hover: {
//     border-color: #888;
//   };
//   :focus : {
//     border-color: #aaa;
//     box-shadow: 0 0 1px 3px rgba(59, 153, 252, .7);
//     box-shadow: 0 0 0 3px -moz-mac-focusring;
//     color: #222;
//     outline: none;
//   }
//   :disabled: {
//     opacity: 0.5;
//   }
// `


export default function StyledWrapper({ children }: { children: React.ReactNode }) {
  return <Flex>{children}</Flex> // ✅ children은 그대로 유지됨
}