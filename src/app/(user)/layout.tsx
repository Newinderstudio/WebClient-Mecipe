import { MainFooter } from '@/common/footer/MainFooter';
import MaintenacePopUpWrapper from '@/common/popup/MaintenacePopUpWrapper';

function UserLayout({
    children,
}: {
    children: React.ReactNode
}) {

    return (
        <div>
            <MaintenacePopUpWrapper />
            {children}

            <MainFooter />
        </div>
    );
}

export default UserLayout