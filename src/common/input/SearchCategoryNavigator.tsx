'use client'

import { useEffect, useState } from 'react'
import { SelectDropDown } from '../styledComponents'

export interface Category {
    id: number
    name: string
    children?: Category[]
}

interface Props {
    onSearchAction: (text: number) => void;
    style?: React.CSSProperties
    categoryTree: Category[] | undefined
}

export default function SearchCategoryNavigator(props: Props) {
    const [selectedIds, setSelectedIds] = useState<number[]>([])

    // 현재 depth 기준으로 보여줄 카테고리 목록 추출
    const getCategoriesAtDepth = (categoryTree: Category[], depth: number): Category[] => {
        let current: Category[] = categoryTree
        for (let i = 0; i < depth; i++) {
            const found = current.find((cat) => cat.id === selectedIds[i])
            if (found && found.children) {
                current = found.children
            } else {
                return []
            }
        }
        return current
    }

    const handleChange = (depth: number, id: number) => {
        const newSelected = [...selectedIds.slice(0, depth), id]
        setSelectedIds(newSelected)
    }

    useEffect(() => {
        if (props) props.onSearchAction(selectedIds[selectedIds.length - 1]);
    }, [props, selectedIds])

    const maxDepth = 5

    if(props.categoryTree === undefined) return undefined;

    return (
        <div style={{ display: 'flex', gap: '1rem', ...props.style }}>
            { [...Array(maxDepth)].map((_, depth) => {
                const options = getCategoriesAtDepth(props.categoryTree!, depth)
                if (options.length === 0) return null

                const selected = selectedIds[depth] || ''

                return (
                    <SelectDropDown
                        key={depth}
                        value={selected}
                        onChange={(e) => handleChange(depth, Number(e.target.value))}
                    >
                        <option value="">선택</option>
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