import { useRouter } from "next/navigation";

interface hookMember {
    onClickHistoryBack: () => void;
    onClickNavigation:(url:string)=>void;
}

export function useMainHeader(): hookMember {

    const router = useRouter();

    const onClickHistoryBack = () => {
        window.history.back();
    }

    const onClickNavigation = (url:string) => {
        router.push(url);
    }

    return {
        onClickHistoryBack,
        onClickNavigation
    }
};