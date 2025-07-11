"use client"

import MainSearchComponent from '@/common/input/MainSearchComponent';
import UserScreen from '@/common/screen/UserScreen';
import { FlexCenter } from '@/common/styledComponents';
import { fenxyYellowTransparency } from '@/util/constants/style';
// import { useMainScreen } from './hooks/useMainScreen';

function MainScreen() {
    // const hookMember = useMainScreen();

    return (
        <UserScreen
            headerOverlap={true}
            backSpace={false}
            fullScreen={true}
            navigationList={[{ name: "카페탐색", routerUrl: "/search" }]}
        >
            <FlexCenter style={{ flexGrow: 1, backgroundColor: '#aaae' }}>
                <MainSearchComponent
                    onSearchAction={(text: string) => {
                        //
                        console.log(text);
                    }}
                    height={72}
                    maxWidth={800}
                    backgroundColor='#0005'
                    borderColor={fenxyYellowTransparency}
                    full={true}
                    style={{ padding: '0 20px' }}
                />
            </FlexCenter>
        </UserScreen>
    );
};
export default MainScreen;
