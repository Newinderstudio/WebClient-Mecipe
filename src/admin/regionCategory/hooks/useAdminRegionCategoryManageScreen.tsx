import { RegionCategoryResult, RegionCategoryTreeTable } from "@/api/regionCategoriesApi";
import { useEffect, useRef, useState } from "react";
import { RegionCategorySelectorHandler } from "../components/RegionCategorySelector";

interface hookMember {
    parentCandidates: {list: RegionCategoryResult[], target?:number};
    setParentCategories: (data: RegionCategoryResult[], targetId?: number) => void;

    getCategories: (data: RegionCategoryTreeTable) => void;

    selectorRef: React.RefObject<RegionCategorySelectorHandler|null>;
}

function useAdminRegionCategoryManageScreen(): hookMember {

    const selectorRef = useRef<RegionCategorySelectorHandler>(null);

    const [parentCandidates, setParentCandidates] = useState<{list: RegionCategoryResult[], target?:number}>({list:[],target:undefined})


    const setParentCategories = (data: RegionCategoryResult[], targetId?: number) => {
        setParentCandidates({
            list: data,
            target: targetId
        });
    }

    const getCategories = (data: RegionCategoryTreeTable) => {
        selectorRef.current?.updateCategories(data);
    }

    useEffect(() => {

    })

    return {
        parentCandidates,
        setParentCategories,
        getCategories,

        selectorRef
    }
}

export default useAdminRegionCategoryManageScreen;