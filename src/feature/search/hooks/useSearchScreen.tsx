import { CafeInfo } from "@/data/prisma-client";
import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useFindAllPlacesBySearchMutation } from "@/api/cafeInfosApi";
import { getShortRegionCategoryNameByTree, useFindAllRegionCategoriesQuery } from "@/api/regionCategoriesApi";
interface HookMember {
    cafeInfos: CafeInfo[] | undefined;
    searchCount: number;
    initialSearchText: string;
    onChangeCategory: (id: number | undefined) => void;
    onSetSearchText: (text: string) => void;
    onClickDetail: (id: number) => void;

    getShortRegionCategoryNameById: (regionCategoryId: number) => string;

}

export function useSearchScreen(): HookMember {
    const router = useRouter();
    const searchParams = useSearchParams();

    const searchTextQuery = searchParams.get('searchText') ?? '';
    const regionCategoryIdQuery = Number(searchParams.get('regionCategoryId'));

    const [findSearch] = useFindAllPlacesBySearchMutation();

    const { data: categoryTree } = useFindAllRegionCategoriesQuery();

    const [curCategory, setCurCategory] = useState<number | undefined>(isNaN(regionCategoryIdQuery) ? regionCategoryIdQuery : undefined);
    const [cafeInfos, setCafeInfos] = useState<CafeInfo[]>();
    const [searchText, setSearchText] = useState<string>(searchTextQuery);

    const [searchCount, setSearchCount] = useState<number>(0);

    const getShortRegionCategoryNameById = useCallback((regionCategoryId: number): string => {
        if (!categoryTree) return "";
        return getShortRegionCategoryNameByTree(regionCategoryId, categoryTree.categories, categoryTree.closure);
    }, [categoryTree])

    const searchCafeInfos = useCallback(async (_searchText: string, _regionCategoryId: number | undefined) => {
        try {
            const result = await findSearch({
                skip: 0,
                take: 30,
                searchText: _searchText,
                regionCategoryId: _regionCategoryId
            }).unwrap();

            setSearchCount(result.count);
            setCafeInfos(result.data);
        } catch {

        }

    }, [findSearch])

    useEffect(() => {
        searchCafeInfos(searchText, curCategory);
    }, [curCategory, searchCafeInfos, searchText])


    const onChangeCategory = useCallback((id: number | undefined) => {
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
        cafeInfos,
        searchCount,
        initialSearchText: searchTextQuery,
        onChangeCategory,
        onSetSearchText,
        onClickDetail,

        getShortRegionCategoryNameById
    }
}