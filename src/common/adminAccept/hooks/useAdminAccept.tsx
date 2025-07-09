import { useRouter } from "next/router";
import { useEffect } from "react"
import { UserType } from "@/data/prisma-client"
import { useTypedSelector } from "@/store";

type hookMember = object

interface accessableUrl {
    url:RegExp;
    userType: UserType[];
}

export const useAdminAccept = ():hookMember => {
    const router = useRouter();
    const userType = useTypedSelector((state) => state.account.user?.userType);

    const unAccessableUrlArray: accessableUrl[] = [
        //상품관리
        // {url:/^(\/admin\/product\/estproduct)+([?]\S*)?/, userType:['MANAGER']},
        // {url:/^(\/admin\/product\/estraservice)+([?]\S*)?/, userType:['MANAGER']},
        // //쿠폰관리
        // {url:/^(\/admin\/coupon\/payment)+([?]\S*)?/, userType:['HAPPYCALL']},
        // {url:/^(\/admin\/coupon)+([?]\S*)?$/, userType:['HAPPYCALL']},
        // //깃발관리
        // {url:/^(\/admin\/flag\/price)+([?]\S*)?/, userType:['MANAGER']},
        // {url:/^(\/admin\/flag)+([?]\S*)?$/, userType:['MANAGER']},
        // //게시판관리
        // {url:/^(\/admin\/board\/notice)\S*/, userType:['HAPPYCALL']},
        // {url:/^(\/admin\/board\/event)\S*/, userType:['ACCOUNTANT','HAPPYCALL']},
        // {url:/^(\/admin\/board\/qna)\S*/, userType:['ACCOUNTANT','HAPPYCALL']},
        // {url:/^(\/admin\/board\/portfolio)\S*/, userType:['ACCOUNTANT','HAPPYCALL']},
        
    ]


    useEffect(()=>{
        if(checkRouter()) {
            // console.log('접근할 수 없는 권합니다.')
            // r
            router.push('/admin');
            alert('접근할 수 없는 권합니다.');
        }
    },[userType]);

    const checkRouter = (): boolean => {
        const url = router.asPath;
        console.log(url ,userType);
        if(userType && userType !== 'ADMIN')
            for(let i=0;i<unAccessableUrlArray.length;i++) {
                console.log(unAccessableUrlArray[i].url.test(url) , unAccessableUrlArray[i].url)
                if( unAccessableUrlArray[i].url.test(url) === true &&
                    unAccessableUrlArray[i].userType.indexOf(userType) > -1
                ) {
                    return true;
                }
            }

        return false;
    }

    return {

    }
}