import { Category } from "@/common/input/SearchCategoryNavigator"
import { CafeInfo } from "@/data/prisma-client"

// 예시 계층형 데이터
export const categoryTreeDummyData: Category[] = [
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


export const cafeDummyData: CafeInfo[] = [
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
    name: '수통골 카페숲',
    regionCategoryId: 19, // 수통골
    address: '대전 유성구 수통골로 321',
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