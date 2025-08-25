import AdminHeader from '@/common/header/AdminHeader';

function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {

    return (
        <div>
            <AdminHeader active={"쿠폰관리"} activeItem='쿠폰관리' />
            {children}
        </div>
    );
}

export default AdminLayout