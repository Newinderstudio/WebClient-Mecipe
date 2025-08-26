import { ProductCategoryResult, ProductCategoryTreeTable } from "@/api/productCategoriesApi";
import { useEffect, useRef, useState } from "react";
import { ProductCategorySelectorHandler } from "../components/ProductCategorySelector";


function useAdminProductCategoryManagerScreen() {

    const selectorRef = useRef<ProductCategorySelectorHandler>(null);

    const [parentCandidates, setParentCandidates] = useState<{list: ProductCategoryResult[], target?:number}>({list:[],target:undefined})


    const setParentCategories = (data: ProductCategoryResult[], targetId?: number) => {
        setParentCandidates({
            list: data,
            target: targetId
        });
    }

    const getCategories = (data: ProductCategoryTreeTable) => {
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

export default useAdminProductCategoryManagerScreen;