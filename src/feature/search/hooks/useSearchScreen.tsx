import { Category } from "@/common/input/SearchCategoryNavigator";
import { categoryTreeDummyData } from "./searchDummyData";
import { CafeInfo } from "@/data/prisma-client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { redirectUrl } from "@/util/constants/app";
interface HookMember {
    categoryTree: Category[] | undefined
    cafeInfos: CafeInfo[] | undefined
    onChangeCategory: (id: number) => void;
    onSetSearchText: (text: string) => void;
    onClickDetail: (id: number) => void;
}

export function useSearchScreen(): HookMember {
    const router = useRouter();

    const categoryTree = categoryTreeDummyData;


    const [curCategory, setCurCategory] = useState<number>();
    const [cafeInfos, setCafeInfos] = useState<CafeInfo[]>();
    const [searchText, setSearchText] = useState<string>('');

    useEffect(() => {
        fetch(`${redirectUrl}/api/test/info?category=${curCategory}&search=${searchText}`).then(
            (res) => res.json()
        ).then((data) => {
            setCafeInfos(data);
        });
    }, [categoryTree, curCategory, searchText])


    const onChangeCategory = useCallback((id: number) => {
        console.log(id);
        setCurCategory(id);
    }, [])

    const onSetSearchText = (text: string) => {
        setSearchText(text);
    }

    const onClickDetail = (id: number) => {
        router.push("/detail/" + id.toString());
    }

    return {
        categoryTree,
        cafeInfos,
        onChangeCategory,
        onSetSearchText,
        onClickDetail
    }
}