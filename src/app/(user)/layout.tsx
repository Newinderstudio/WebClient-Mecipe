import { MainFooter } from '@/common/footer/MainFooter';

function UserLayout({
    children,
}: {
    children: React.ReactNode
}) {

    return (
        <div>
            {children}

            <MainFooter />
        </div>
    );
}

export default UserLayout