"use client"

import MainSearchComponent from '@/common/input/MainSearchComponent';
import UserScreen from '@/common/screen/UserScreen';
import { FlexCenter } from '@/common/styledComponents';
// import { useMainScreen } from './hooks/useMainScreen';

function MainScreen() {
    // const hookMember = useMainScreen();

    return (
        <UserScreen
            headerOverlap={true}
            backSpace={false}
            fullScreen={true}
        >
            <FlexCenter style={{ flexGrow: 1, backgroundColor:'#aaae' }}>
                <MainSearchComponent
                    onSearchAction={(text: string) => {
                        //
                        console.log(text);
                    }}
                />
            </FlexCenter>
        </UserScreen>
    );
};
export default MainScreen;
