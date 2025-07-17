import { createApi } from '@reduxjs/toolkit/query/react';
import { LoginType, User, UserType } from '@/data/prisma-client';
import fetchCompat from '@/util/fetchCompat';
import { fetchCompatBaseQuery } from '@/util/fetchCompatBaseQuery';
import { DeepPartial, FilteredPropertiesOnlyPrimitiveAndEnum, MakePrimitiveRequiredWithObject } from '@/util/types';

export const usersApi = createApi({
    reducerPath: 'usersApi',
    baseQuery: fetchCompatBaseQuery('users'),
    tagTypes: ['Users'],
    endpoints: (builder) => ({
        // NOTE 유저생성시 중복확인 // 아이디, 닉네임, 상호명 등등
        findDuplicateUserData: builder.mutation<
            unknown,
            {
                type: string;
                content: string;
            }
        >({
            query: (arg) => ({
                method: 'GET',
                url: `duplicate?type=${arg.type}&content=${arg.content}`,
            }),
        }),
        // NOTE 관리자 회원 목록
        findAllUser: builder.query<UserResult[], void>({
            query: () => ({
                method: 'GET',
                url: '',
            }),
        }),
        // NOTE 관리자 userType 회원 목록
        findUserByType: builder.query<
            UserResult[],
            { userType?: 'ADMIN' | 'GENERAL' }
        >({
            query: (arg) => ({
                method: 'GET',
                url: `userType/${arg.userType}`,
            }),
        }),
        // NOTE 관리자 회원 상세
        findUser: builder.query<UserResult, { id: number }>({
            query: (arg) => ({
                method: 'GET',
                url: `${arg.id}`,
            }),
        }),
        // NOTE 회원 정보 불러오기
        findOneUser: builder.mutation<UserResult, { id: number }>({
            query: (arg) => ({
                method: 'GET',
                url: `${arg.id}`,
            }),
        }),
        // NOTE 관리자 업데이트
        updateUserByAdmin: builder.mutation<
            unknown,
            {
                userId: number;
                userType?: string;
                username?: string;
                password?: string;
            }
        >({
            query: (arg) => ({
                method: 'PATCH',
                url: `admin/user/${arg.userId}?${(arg.userType) ? `userType=${arg.userType}&` : ''}` +
                    `${(arg.username) ? `username=${arg.username}&` : ''}` +
                    `${(arg.password) ? `password=${arg.password}&` : ''}`,
            }),
        }),

        // 닉네임 변경
        updateUserNickname: builder.mutation<
            unknown,
            {
                userId: number;
                body: UserUpdateInput;
            }
        >({
            query: (arg) => ({
                method: 'PATCH',
                url: `${arg.userId}`,
                body: arg.body,
            }),
        }),
        //
        updateUserByUserSelf: builder.mutation<
            unknown,
            {
                userId: number;
                body: {
                    loginType: LoginType;
                    loginId: string;
                    loginPw?: string;
                    password?: string;
                    nickname?: string;
                };
            }
        >({
            query: (arg) => ({
                method: 'PATCH',
                url: `${arg.userId}/update`,
                body: arg.body,
            }),
        }),
        //
        updatePwByFindPw: builder.mutation<
            unknown,
            {
                userId: number;
                body: {
                    loginType: LoginType;
                    loginId: string;
                    password?: string;
                };
            }
        >({
            query: (arg) => ({
                method: 'PATCH',
                url: `${arg.userId}/updatepw`,
                body: arg.body,
            }),
        }),
        // 아이디 찾기
        findUserId: builder.mutation<
            UserResult,
            {
                username: string;
                phone: string;
            }
        >({
            query: (arg) => ({
                method: 'GET',
                url: `find/id?username=${arg.username}&phone=${arg.phone}`,
            }),
        }),

        findAdminAllUsers: builder.mutation<
            { count: number; data: UserResult[]; userCount: { [key: string]: number } },
            {
                page: number;
                take: number;
                searchType?: string;
                searchText?: string;
                userType?: string;
            }
        >({
            query: (arg) => ({
                method: 'GET',
                url: `admin?page=${arg.page}&take=${arg.take}&searchType=${arg.searchType}&searchText=${arg.searchText}&userType=${arg.userType}`,
            }),
        }),

        createUserByAdmin: builder.mutation<
            UserResult,
            {
                adminId: number;
                body: UserCreateInput;
            }
        >({
            query: (arg) => ({
                method: 'POST',
                url: `admin`,
                body: arg,
            }),
        }),

        // 개별 삭제
        removeUserByAdmin: builder.mutation<
            UserResult,
            {
                adminId: number;
                id: number;
            }
        >({
            query: (arg) => ({
                method: 'DELETE',
                url: `admin?adminId=${arg.adminId}&id=${arg.id}`,
            }),
        }),

        findUserTypeWithNoLogin: builder.query<
            { userType: UserTypeOrNoLogin },
            {
                id: number
            }
        >({
            query: ({ id }) => ({
                method: 'GET',
                url: `checkLogin/${id}`
            }),
        }),

        findExistUserById: builder.mutation<
            { isExist: boolean },
            {
                loginId: string
            }
        >({
            query: ({ loginId }) => ({
                method: 'GET',
                url: `find/${loginId}`
            }),
        })

    }),
});

export const {
    useFindDuplicateUserDataMutation,
    useFindAllUserQuery,
    useFindUserByTypeQuery,
    useUpdateUserByAdminMutation,
    useFindUserQuery,
    useUpdateUserNicknameMutation,
    useUpdateUserByUserSelfMutation,
    useFindUserIdMutation,
    useUpdatePwByFindPwMutation,
    useFindAdminAllUsersMutation,

    useCreateUserByAdminMutation,
    useRemoveUserByAdminMutation,

    useFindOneUserMutation,
    
    useFindExistUserByIdMutation,
} = usersApi;

// export const { useFindDuplicateUserDataMutation, useFindAllUserQuery } =
//   usersApi;

export const createUser = async (body: UserResult) => {
    return await fetchCompat('POST', 'signup', undefined, JSON.stringify(body));
};

// NOTE User에 대한 타입
export type UserTypeOrNoLogin = UserType | 'NoLogin';

// NOTE AccessToken에 대한 타입
export type AccessToken = string;

export type UserResult = MakePrimitiveRequiredWithObject<User>;
export type UserUpdateInput = Omit<DeepPartial<FilteredPropertiesOnlyPrimitiveAndEnum<User>>,"id">;

export type UserCreateInput = Omit<Omit<Omit<Required<FilteredPropertiesOnlyPrimitiveAndEnum<User>>,"id">, "createdAt">, "isDisable">;
