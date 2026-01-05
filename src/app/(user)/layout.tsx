import { MainFooter } from '@/common/footer/MainFooter';
import MaintenacePopUpWrapper from '@/common/popup/MaintenacePopUpWrapper';

function UserLayout({
    children,
}: {
    children: React.ReactNode
}) {

    return (
        <div>
            {process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true' && <MaintenacePopUpWrapper />}
            {children}

            <MainFooter />
        </div>
    );
}

export default UserLayout