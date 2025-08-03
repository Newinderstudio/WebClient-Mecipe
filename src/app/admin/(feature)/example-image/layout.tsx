import AdminHeader from '@/common/header/AdminHeader';

function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {

    return (
        <div>
            <AdminHeader active={"테스트이미지"} activeItem='테스트이미지' />
            {children}
        </div>
    );
}

export default AdminLayout