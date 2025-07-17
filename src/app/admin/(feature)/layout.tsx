import { AdminPageContinaer, Flex } from '@/common/styledComponents';

function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {

    return (
        <Flex style={{ minHeight: '100vh' }}>
            <AdminPageContinaer>
                {children}
            </AdminPageContinaer>
        </Flex>
    );
}

export default AdminLayout