import AdminHeader from '@/common/header/AdminHeader';

function AdminMetaViewerLayout({
    children,
}: {
    children: React.ReactNode
}) {

    return (
        <div>
            <AdminHeader active={"메타뷰어관리"} activeItem='메타뷰어관리' />
            {children}
        </div>
    );
}

export default AdminMetaViewerLayout
