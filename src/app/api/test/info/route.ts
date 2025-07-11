import { Category } from "@/common/input/SearchCategoryNavigator";
import { CafeInfo } from "@/data/prisma-client";
import { redirectUrl } from "@/util/constants/app";
import { NextRequest, NextResponse } from "next/server";

const cafeDummyData: CafeInfo[] = [
    {
        id: 101,
        createdAt: '2025-07-10T09:00:00',
        isDisable: false,
        name: '의정부 감성카페',
        regionCategoryId: 4, // 의정부동
        address: '경기도 의정부시 의정부동 123-4',
        directions: '의정부역 2번 출구에서 도보 5분',
        businessNumber: '129-87-54321',
        ceoName: '김민준',
    },
    {
        id: 102,
        createdAt: '2025-07-10T09:30:00',
        isDisable: false,
        name: '용인 삼가동 커피하우스',
        regionCategoryId: 13, // 삼가동
        address: '경기도 용인시 처인구 삼가동 78-9',
        directions: '삼가역에서 버스 15번 탑승 후 3정거장',
        businessNumber: '201-12-98765',
        ceoName: '이서연',
    },
    {
        id: 103,
        createdAt: '2025-07-10T10:00:00',
        isDisable: true,
        name: '보라동 빈티지카페',
        regionCategoryId: 14, // 보라동
        address: '경기도 용인시 기흥구 보라동 45-2',
        directions: '보라초등학교 맞은편',
        businessNumber: '301-55-65432',
        ceoName: '정우성',
    },
    {
        id: 104,
        createdAt: '2025-07-10T10:30:00',
        isDisable: false,
        name: '갈마동 브런치카페',
        regionCategoryId: 15, // 갈마동
        address: '대전 서구 갈마동 100-1',
        directions: '갈마역 1번 출구 앞',
        businessNumber: '401-66-11223',
        ceoName: '배수지',
    },
    {
        id: 105,
        createdAt: '2025-07-10T11:00:00',
        isDisable: false,
        name: '카페 레오',
        regionCategoryId: 19, // 수통골
        address: '대전 유성구 수통골로55번길 52 지상1층',
        directions: '수통골 등산로 입구 근처',
        businessNumber: '509-33-77889',
        ceoName: '장예진',
    },
    {
        id: 106,
        createdAt: '2025-07-10T11:30:00',
        isDisable: false,
        name: '레몬트리 의정부',
        regionCategoryId: 5, // 용현동
        address: '경기도 의정부시 용현동 87-11',
        directions: '용현시장 옆 골목길',
        businessNumber: '155-88-34567',
        ceoName: '한지훈',
    },
]

const extractAllChildIds = (categoryId: number | undefined, tree: Category[]): number[] => {
    const result: number[] = [];

    const traverse = (nodes: Category[], parentMatch: boolean = false) => {
        for (const node of nodes) {
            const isMatch = node.id === categoryId || parentMatch

            if (isMatch) result.push(node.id)

            if (node.children) {
                traverse(node.children, isMatch)
                if (isMatch) {
                    node.children.forEach((child) => result.push(child.id))
                }
            }
        }
    }

    traverse(tree)
    return [...new Set(result)]
}

const filterCafeListByHierarchy = (
    cafes: CafeInfo[],
    categoryId: number | undefined,
    searchText: string,
    tree: Category[]
): CafeInfo[] => {
    const keyword = searchText.trim().toLowerCase()
    const validCategoryIds = extractAllChildIds(categoryId, tree)

    console.log(`search: ${categoryId}(${validCategoryIds.join(',')})/${searchText}`);

    return cafes.filter((cafe) => {
        const matchCategory = categoryId === undefined || categoryId < 1 || validCategoryIds.includes(cafe.regionCategoryId)
        const matchText =
            keyword.trim().length === 0 ||
            cafe.name.toLowerCase().includes(keyword) ||
            cafe.address.toLowerCase().includes(keyword)

        return matchCategory && matchText
    })
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;

        const categoryQuery = Number(searchParams.get('category'));
        const category = Number.isNaN(categoryQuery) ? undefined : categoryQuery;
        const search = searchParams.get('search') ?? ""

        const response = cafeDummyData;

        const resCategory = await fetch(redirectUrl+"/api/test/category")
        const categoryTree = await resCategory.json() as Category[]

        const result = filterCafeListByHierarchy(response, category, search, categoryTree).filter((cafe) => !cafe.isDisable);

        return NextResponse.json(result)
    } catch (e) {
        console.error(e)
    }
}