"use client"

import MainHeader from '@/common/header/MainHeader';
import { Flex } from '@/common/styledComponents';

interface Props {
    backSpace?: boolean;
    headerOverlap?: boolean;
    fullScreen?: boolean;
    children: React.ReactNode;
}

const UserScreen = ({
    children,
    headerOverlap,
    backSpace,
    fullScreen
}: Props) => {

    let marginStyle = {}
    if (fullScreen === true) {
        marginStyle = {
            marginLeft: 0,
            marginRight: 0,
        }
    } else {
        marginStyle = {
            marginLeft: 30,
            marginRight: 30,
        }
    }

    return <Flex style={{ minHeight: '100vh' }}>
        <MainHeader
            backSpace={backSpace}
            isOverlap={headerOverlap}
        />
        <Flex
            style={{
                textAlign: 'left',
                fontSize: 40,
                color: '#333',
                height: '100%',
                flexGrow: 1,
                ...marginStyle
            }}>
            {children}
        </Flex>
    </Flex>
}

export default UserScreen;