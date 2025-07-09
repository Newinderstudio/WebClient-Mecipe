import { useFindAdminAllUsersMutation, UserResult } from "@/api/usersApi";
import { useEffect, useState } from 'react';

interface HookMember {
    userList: UserResult[];

    page: number;
    take: number;
    totalCount: number;
    setPage: (page:number)=>void;
  
    searchText: string;
    searchType: string;
  
    onChangeSearchType: (val:string)=>void;
    onChangeSearchText: (val:string) =>void;
    onClickSearch: ()=>void;
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
    
        useEffect(() => {
            setSearchType('이름');
            resetData();
        }, []);
    
        const resetData = async () => {
            const result = await findPagingAllUsers({ page, take });
            console.log(result)
            if (result?.data) {
                const success = result.data;
                setUserList(success.data);
                setTotalCount(success.count);
            }
        };
    
        useEffect(() => {
            if (page) changePageAndSearchUser(page);
        }, [page]);
    
    
        async function changePageAndSearchUser(page: number, item?: whereQuery) {
            const where = {
                userType:"GENERAL",
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
        }
    
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