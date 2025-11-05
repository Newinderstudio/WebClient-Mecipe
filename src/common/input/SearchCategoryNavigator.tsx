'use client'

import { useEffect, useState } from 'react'
import { SelectDropDown } from '../styledComponents'
import { RegionCategoryResult, useFindAllRegionCategoriesQuery } from '@/api/regionCategoriesApi'

interface Props {
    onSearchAction: (selectedId: number | undefined) => void
    style?: React.CSSProperties
    curRegionCategoryId?: number
}

export default function SearchCategoryNavigator({
    onSearchAction,
    style,
    curRegionCategoryId
}: Props) {

    const { data: categoryTree } = useFindAllRegionCategoriesQuery();

    const [categories, setCategories] = useState<RegionCategoryResult[]>([])
    const [closure, setClosure] = useState<{ ancestor: number, descendant: number, depth: number }[]>([])

    const [maxDepth, setMaxDepth] = useState<number>(0);

    useEffect(() => {
        if (categoryTree) {
            setCategories(categoryTree.categories)
            setClosure(categoryTree.closure)
            setMaxDepth(categoryTree.closure.reduce((max, rel) => Math.max(max, rel.depth), 0) + 1);
        }
    }, [categoryTree])

    useEffect(() => {
        if (curRegionCategoryId && closure.length > 0) {
            const path: number[] = [];
            let current = curRegionCategoryId
            while (true) {
                path.unshift(current)
                const parentRel = closure.find(
                    (rel) => rel.descendant === current && rel.depth === 1
                )
                if (!parentRel || parentRel.ancestor === current) break
                current = parentRel.ancestor
            }
            console.log("Cur Category Path", path);
            setSelectedIds(path)
        }
    }, [closure, curRegionCategoryId])

    const [selectedIds, setSelectedIds] = useState<number[]>([])

    const getCategoriesAtDepth = (depth: number): RegionCategoryResult[] => {
        if (depth === 0) {
            const allDescendants = new Set(
                closure.filter((rel) => rel.depth > 0).map((rel) => rel.descendant)
            )
            return categories.filter((cat) => !allDescendants.has(cat.id))
        }

        const parentId = selectedIds[depth - 1]
        if (!parentId) return []

        const childIds = closure
            .filter((rel) => rel.depth === 1 && rel.ancestor === parentId)
            .map((rel) => rel.descendant)

        return categories.filter((cat) => childIds.includes(cat.id))
    }

    const handleChange = (depth: number, id: number) => {
        const prev = selectedIds.slice(0, depth);
        let newSelected: number[] = [];
        if(prev[prev.length - 1] === id) {
            newSelected = prev;
        } else {
            newSelected = [...prev, id];
        }
        
        setSelectedIds(newSelected)
    }

    useEffect(() => {
        const target = selectedIds[selectedIds.length - 1]
        onSearchAction(target >= 0 ? target : undefined)
    }, [selectedIds, onSearchAction])

    return (
        <div style={{ display: 'flex', gap: '1rem', ...style }}>
            {[...Array(maxDepth)].map((_, depth) => {
                const options = getCategoriesAtDepth(depth)
                if (options.length === 0) return null

                const selected = selectedIds[depth] || ''

                const parentId = selectedIds[depth - 1] ?? -1;

                return (
                    <SelectDropDown
                        key={depth}
                        value={selected}
                        onChange={(e) => handleChange(depth, Number(e.target.value))}
                    >
                        <option value={parentId}>선택</option>
                        {options.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                                {opt.name}
                            </option>
                        ))}
                    </SelectDropDown>
                )
            })}
        </div>
    )
}