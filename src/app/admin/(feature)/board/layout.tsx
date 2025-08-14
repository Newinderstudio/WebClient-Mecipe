import AdminHeader from '@/common/header/AdminHeader';

function AdminBoardLayout({
    children,
}: {
    children: React.ReactNode
}) {

    return (
        <div>
            <AdminHeader active={"게시판관리"} activeItem='게시판관리' />
            {children}
        </div>
    );
}

export default AdminBoardLayout
