import { useFindAdminAllUsersMutation, UserResult } from "@/api/usersApi";
import { useCallback, useEffect, useState } from 'react';

interface HookMember {
    userList: UserResult[];

    page: number;
    take: number;
    totalCount: number;
    setPage: (page: number) => void;

    searchText: string;
    searchType: string;

    onChangeSearchType: (val: string) => void;
    onChangeSearchText: (val: string) => void;
    onClickSearch: () => void;
}

export function useUserSelectListScreen(): HookMember {

    //***  페이징?? */
    const [totalCount, setTotalCount] = useState<number>(0);
    const [page, setPage] = useState<number>(1);
    const take: number = 10;

    const [searchType, setSearchType] = useState<string>('');
    const [searchText, setSearchText] = useState<string>('');


    const [findPagingAllUsers] = useFindAdminAllUsersMutation();
    const [userList, setUserList] = useState<UserResult[]>([]);

    const resetData = useCallback(async () => {
        const result = await findPagingAllUsers({ page, take });
        console.log(result)
        if (result?.data) {
            const success = result.data;
            setUserList(success.data);
            setTotalCount(success.count);
        }
    }, [page, take, findPagingAllUsers]);

    const changePageAndSearchUser = useCallback(async (page: number, item?: whereQuery) => {
        const where = {
            userType: "GENERAL",
            searchType: item?.searchType || searchType,
            searchText: item?.searchText || searchText,
        };
        const result = await findPagingAllUsers({ page, take, ...where });

        if (result?.data) {
            const success = result.data;
            if (success.data?.length === 0 && page - 1 > 0) {
                changePageAndSearchUser(page - 1, item);
            } else {
                setPage(page);
                setUserList(success.data);
                setTotalCount(success.count);
            }
        }
    }, [searchType, searchText, findPagingAllUsers]);

    useEffect(() => {
        if (resetData) {
            setSearchType('이름');
            resetData();
        }
    }, [resetData]);

    useEffect(() => {
        if (changePageAndSearchUser) changePageAndSearchUser(page);
    }, [page, changePageAndSearchUser]);

    const onClickSearch = async () => {
        changePageAndSearchUser(1, { searchType, searchText });
    }

    return {
        userList,

        page,
        take,
        totalCount,
        setPage,

        searchText,
        searchType,

        onChangeSearchType: (val: string) => {
            setSearchType(val);
        },
        onChangeSearchText: (val: string) => {
            setSearchText(val);
        },
        onClickSearch,
    }
}

interface whereQuery {
    searchType?: string;
    searchText?: string;
}