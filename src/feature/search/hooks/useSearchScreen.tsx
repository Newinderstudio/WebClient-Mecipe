import { CafeInfo } from "@/data/prisma-client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useFindAllPlacesBySearchMutation } from "@/api/cafeInfosApi";
import { getShortRegionCategoryNameByTree, useFindAllRegionCategoriesQuery } from "@/api/regionCategoriesApi";
interface HookMember {
    cafeInfos: CafeInfo[] | undefined;
    searchCount: number;
    searchTextParams: string;
    onChangeCategory: (id: number | undefined) => void;
    onSetSearchText: (text: string) => void;
    onClickDetail: (id: number) => void;

    getShortRegionCategoryNameById: (regionCategoryId: number) => string;

}

export function useSearchScreen(): HookMember {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [findSearch] = useFindAllPlacesBySearchMutation();

    const { data: categoryTree } = useFindAllRegionCategoriesQuery();

    const [cafeInfos, setCafeInfos] = useState<CafeInfo[]>();
    const [searchCount, setSearchCount] = useState<number>(0);

    // URL 파라미터 읽기
    const searchTextParams = searchParams.get('searchText') ?? '';
    const regionCategoryIdParams = Number(searchParams.get('regionCategoryId'));
    
    // regionCategoryId가 NaN이면 undefined로 변환
    const normalizedRegionCategoryId = isNaN(regionCategoryIdParams) ? undefined : regionCategoryIdParams;
    
    // 이전 파라미터를 추적하여 불필요한 router.replace 방지
    const prevParamsRef = useRef<{searchText: string, regionCategoryId: number | undefined} | null>(null);

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
        // URL 파라미터가 변경되었을 때만 검색 실행
        const prevParams = prevParamsRef.current;
        if (!prevParams || 
            searchTextParams !== prevParams.searchText || 
            normalizedRegionCategoryId !== prevParams.regionCategoryId) {
            prevParamsRef.current = { searchText: searchTextParams, regionCategoryId: normalizedRegionCategoryId };
            searchCafeInfos(searchTextParams, normalizedRegionCategoryId);
        }
    }, [searchTextParams, normalizedRegionCategoryId, searchCafeInfos])

    const setSearchParams = useCallback(({searchText, regionCategoryId}: {searchText?: string, regionCategoryId?: number}) => {
        // 현재 URL 파라미터를 기본값으로 사용
        const currentSearchText = searchTextParams;
        const currentRegionCategoryId = normalizedRegionCategoryId;
        
        const _searchText = searchText !== undefined ? searchText : currentSearchText;
        const _regionCategoryId = regionCategoryId !== undefined ? regionCategoryId : currentRegionCategoryId;
        
        // 파라미터가 실제로 변경되지 않으면 아무것도 하지 않음
        if (_searchText === currentSearchText && 
            _regionCategoryId === currentRegionCategoryId) {
            return;
        }
        
        const params = new URLSearchParams();
        if (_searchText) params.set('searchText', _searchText);
        if (_regionCategoryId !== undefined) params.set('regionCategoryId', _regionCategoryId.toString());
        
        router.replace(`/search?${params.toString()}`);
    }, [router, searchTextParams, normalizedRegionCategoryId])


    const onChangeCategory = useCallback((id: number | undefined) => {
        console.log(id);
        setSearchParams({ regionCategoryId: id });
    }, [setSearchParams])

    const onSetSearchText = useCallback((text: string) => {
        setSearchParams({ searchText: text });
    }, [setSearchParams])

    const onClickDetail = (id: number) => {
        router.push("/detail/" + id.toString());
    }

    return {
        cafeInfos,
        searchCount,
        searchTextParams,
        onChangeCategory,
        onSetSearchText,
        onClickDetail,

        getShortRegionCategoryNameById
    }
}