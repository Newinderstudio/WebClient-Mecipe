"use client"

import MainSearchComponent from '@/common/input/MainSearchComponent';
import UserScreen from '@/common/screen/UserScreen';
import { FlexCenter } from '@/common/styledComponents';
import { fenxyYellowTransparency } from '@/util/constants/style';
import FullscreenImageRotator from './components/FullscreenImageRotator';
import { useMainScreen } from './hooks/useMainScreen';
import ContactUsPopUp from '@/common/popup/ContactUsPopUp';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function MainScreen() {

    const searchParams = useSearchParams();
    const isContactUs = searchParams.get('contact') ? true : false;

    const hookMember = useMainScreen({ isContactUs });

    return (
        <UserScreen
            headerOverlap={true}
            backSpace={false}
            fullScreen={true}
            navigationList={[{ name: "카페탐색", routerUrl: "/search", isPulse: true }]}
        >
            <FlexCenter style={{ flexGrow: 1 }}>
                <FullscreenImageRotator
                    imgList={[
                        '/image/cover/cover_1.jpg',
                        '/image/cover/cover_2.jpg',
                        '/image/cover/cover_3.jpg',
                        '/image/cover/cover_4.jpg',
                    ]}
                />
                <MainSearchComponent
                    onSearchAction={(text: string) => {
                        hookMember.onSearchText(text);
                    }}
                    height={6}
                    unit="rem"
                    maxWidth={800}
                    backgroundColor='#0009'
                    borderColor={fenxyYellowTransparency}
                    full={true}
                    style={{
                        padding: '0 20px',

                    }}
                    fontColor='#fff'
                    fontWeight={600}
                />
            </FlexCenter>
            <Suspense>
                {hookMember.popUpOn && (
                    <ContactUsPopUp
                        isOpen={hookMember.popUpOn}
                        onClose={hookMember.onPopUpClose}
                        linkUrl="https://newinderstudio.com/contect"
                        scale={0.5}
                    />
                )}
            </Suspense>

        </UserScreen>
    );
};
export default MainScreen;
