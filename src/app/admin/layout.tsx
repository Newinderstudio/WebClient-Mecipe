import StyledWrapper, { Flex, FlexCenter } from '@/common/styledComponents';
import AdminHeader from '@/common/header/AdminHeader';

function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {

    return (
        <StyledWrapper>
            <Flex style={{ minHeight: '100vh' }}>
                <AdminHeader />
                <FlexCenter
                    style={{
                        maxWidth: 640,
                        margin: '0 auto',
                        textAlign: 'left',
                        fontSize: 30,
                        color: '#333',
                        fontWeight: 400,
                        paddingTop: 20,
                        paddingRight: 20,
                        paddingLeft: 20,
                        width: '100%'
                    }}>
                    {children}
                </FlexCenter>
            </Flex>
        </StyledWrapper>
    );
}

export default AdminLayout