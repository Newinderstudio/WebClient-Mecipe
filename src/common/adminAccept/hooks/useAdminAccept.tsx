import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect } from "react"
import { UserType } from "@/data/prisma-client"
import { useTypedSelector } from "@/store";

type hookMember = object

interface accessableUrl {
    url: RegExp;
    userType: UserType[];
}

export const useAdminAccept = (): hookMember => {
    const router = useRouter();
    const pathname = usePathname()

    const userType = useTypedSelector((state) => state.account.user?.userType);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const unAccessableUrlArray: accessableUrl[] = []

    const checkRouter = useCallback((): boolean => {
        const url = pathname;
        console.log(url, userType);
        if (userType && userType !== 'ADMIN')
            for (let i = 0; i < unAccessableUrlArray.length; i++) {
                console.log(unAccessableUrlArray[i].url.test(url), unAccessableUrlArray[i].url)
                if (unAccessableUrlArray[i].url.test(url) === true &&
                    unAccessableUrlArray[i].userType.indexOf(userType) > -1
                ) {
                    return true;
                }
            }

        return false;
    }, [pathname, userType, unAccessableUrlArray])


    useEffect(() => {
        if (checkRouter()) {
            // console.log('접근할 수 없는 권합니다.')
            // r
            router.push('/admin');
            alert('접근할 수 없는 권합니다.');
        }
    }, [userType, pathname, router, checkRouter]);

    return {

    }
}