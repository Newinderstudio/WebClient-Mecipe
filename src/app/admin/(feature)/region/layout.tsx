import AdminHeader from '@/common/header/AdminHeader';

function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {

    return (
        <div>
            <AdminHeader active={"지역카테고리관리"} activeItem='지역카테고리관리' />
            {children}
        </div>
    );
}

export default AdminLayout