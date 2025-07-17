import AdminHeader from '@/common/header/AdminHeader';

function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {

    return (
        <div>
            <AdminHeader active={"카페관리"} activeItem='카페관리' />
            {children}
        </div>
    );
}

export default AdminLayout