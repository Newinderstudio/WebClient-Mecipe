import AdminHeader from '@/common/header/AdminHeader';

function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {

    return (
        <div>
            <AdminHeader active={"상품관리"} activeItem='상품관리' />
            {children}
        </div>
    );
}

export default AdminLayout