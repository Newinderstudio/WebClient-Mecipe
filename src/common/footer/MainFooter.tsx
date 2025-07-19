"use client"

import { appContentWidth } from '@/util/constants/style';
import { Flex, FlexCenter } from '../styledComponents';
import { useMainFooter } from './hooks/useMainFooter';
import Image from 'next/image';

// const titleCss = {
//   color: '#2d2d2d',
//   fontWeight: 400,
//   fontSize: 20,
//   // marginBottom: 16,
//   marginBottom: 4,
//   display: 'flex',
//   fontFamily: 'Jost',
// };
// const contentCss = (style:any) => {
//   const {fontSize} = style as {fontSize:number|undefined};
//   return {
//     color: '#e7e7e7',
//     fontWeight: 300,
//     fontSize: fontSize || 16,
//     // marginBottom: 8,
//     marginBottom: 4,
//     display: 'flex',
//     alignItems:'center'
//   }
// };
// const detailCss = {
//   color: '#e7e7e7',
//   fontWeight: 400,
//   fontSize: 12,
//   display: 'flex',
// };
// const lineCss = {
//   width: '100%',
//   borderColor: '#848484',
//   borderWidth: 0.5,
//   borderStyle: 'solid',
//   borderBottom: 0,
//   // marginTop: 8,
//   marginTop: 4,
//   // marginBottom: 16,
//   marginBottom: 10,
// };


export function MainFooter() {
  const hookMember = useMainFooter();

  return (
    <div
      style={{
        marginTop: hookMember.marginTop,
        background: 'linear-gradient(#555, #333)'
        // '-webkit-font-smoothing': 'antialiased',
      }}
      ref={hookMember.disEle}>
      <div>
        <FlexCenter
          style={{
            padding: 20,
            paddingTop: 24,
            maxWidth: appContentWidth,
            margin: '0 auto',
            //
            paddingBottom: 10,
          }}>
          <div
            style={{
              position: 'relative', width: '200px', height: '50px'
            }}>
            <Image
              src="/image/logo/logo-mecipe-text.svg"
              alt="logo"
              fill
            />
          </div>
        </FlexCenter>
      </div >
      <div >
        <Flex
          style={{
            padding: 20,
            paddingTop: 0,
            // paddingBottom: 40,
            paddingBottom: 30,
            height: 100
          }}>
        </Flex>
      </div>
    </div >
  );
};
