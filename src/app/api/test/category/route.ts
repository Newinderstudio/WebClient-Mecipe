import { Category } from "@/common/input/SearchCategoryNavigator"
import { NextResponse } from "next/server";

const categoryTreeDummyData: Category[] = [
    {
        id: 1,
        name: '경기도',
        children: [
            {
                id: 2,
                name: '의정부',
                children: [
                    { id: 4, name: '의정부동' },
                    { id: 5, name: '용현동' },
                ],
            },
            {
                id: 3,
                name: '용인시',
                children: [
                    { id: 6, name: '처인구', children: [{ id: 13, name: '삼가동' }] },
                    { id: 7, name: '기흥구', children: [{ id: 14, name: '보라동' }] },
                ],
            },
        ],
    },
    {
        id: 8,
        name: '대전광역시',
        children: [
            {
                id: 9,
                name: '서구',
                children: [
                    { id: 15, name: '갈마동' },
                    { id: 16, name: '둔산동' },
                ],
            },
            {
                id: 17,
                name: '유성구',
                children: [
                    { id: 18, name: '덕명동' },
                    { id: 19, name: '수통골' },
                ],
            },
        ],
    },
]

export async function GET() {
    try {
        const response = categoryTreeDummyData;

        return NextResponse.json(response)
    } catch (e) {
        console.error(e)
    }
}