"use client"

import MainSearchComponent from '@/common/input/MainSearchComponent';
import UserScreen from '@/common/screen/UserScreen';
import { FlexCenter } from '@/common/styledComponents';
import { fenxyYellowTransparency } from '@/util/constants/style';
import FullscreenImageRotator from './components/FullscreenImageRotator';
import { useMainScreen } from './hooks/useMainScreen';

function MainScreen() {
    const hookMember = useMainScreen();

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
        </UserScreen>
    );
};
export default MainScreen;
