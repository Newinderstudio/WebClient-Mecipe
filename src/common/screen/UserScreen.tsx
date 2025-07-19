import MainHeader, { NavigationSimpleData } from '@/common/header/MainHeader';

interface Props {
    backSpace?: boolean;
    headerOverlap?: boolean;
    fullScreen?: boolean;
    navigationList?: NavigationSimpleData[];
    children: React.ReactNode;
}

const UserScreen = ({
    children,
    headerOverlap,
    backSpace,
    fullScreen,
    navigationList
}: Props) => {

    let marginStyle = {}
    if (fullScreen === true) {
        marginStyle = {
            marginLeft: 0,
            marginRight: 0,
        }
    } else {
        marginStyle = {
            marginLeft: '2rem',
            marginRight: '2rem',
        }
    }

    return <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
    }}>
        <MainHeader
            backSpace={backSpace}
            isOverlap={headerOverlap}
            navigationList={navigationList}
        />
        <div
            style={{
                textAlign: 'left',
                fontSize: 40,
                color: '#333',
                height: '100%',
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                ...marginStyle
            }}>
            {children}
        </div>
    </div>
}

export default UserScreen;