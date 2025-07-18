import { Flex } from '@/common/styledComponents';
import AdminPageContainer from '@/common/admin/AdminPageContainer';

function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {

    return (
        <Flex style={{ minHeight: '100vh' }}>
            <AdminPageContainer>
                {children}
            </AdminPageContainer>
        </Flex>
    );
}

export default AdminLayout