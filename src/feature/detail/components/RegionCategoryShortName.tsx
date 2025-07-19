'use client'

import { getShortRegionCategoryNameById, useFindAncestorCategoriesQuery } from "@/api/regionCategoriesApi";

const RegionCategoryShortName = ({ regionId }: { regionId: number }) => {
    const { data: categories } = useFindAncestorCategoriesQuery({categoryId: regionId});


    return <span>{getShortRegionCategoryNameById(regionId, categories?? [])}</span>
}

export default RegionCategoryShortName;