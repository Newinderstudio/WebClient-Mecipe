import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { CafeInfoResult, useFindAllPlacesByAdminMutation, useUpdateDisablePlaceByAdminMutation } from '@/api/cafeInfosApi';

interface hookMember {
  tableTitle: string;
  table: CafeInfoResult[] | [];
  onClickRouterDetail: (id: number) => void;
  onClickRouteCreate: () => void;
  onClickChangeTable: (cate: string) => void;

  page: number;
  take: number;
  totalCount: number;
  setPage: (page: number) => void;

  searchText: string;
  searchType: string;

  onClickRemoveOne: (id: number, isDisable: boolean) => void;
  onClickCheckItem: (notice: CafeInfoResult) => void;
  onClickCheckAll: () => void;
  onClickSetDisableChecked: (isDisable: boolean) => void;
  deleteArray: CafeInfoResult[];

  onChangeSearchType: (val: string) => void;
  onChangeSearchText: (val: string) => void;
  onClickSearch: () => void;
  onClickReset: () => void;

}

export function useAdminCafeInfoScreen(): hookMember {
  const router = useRouter();

  // const { data: userData, refetch: userRefetch } = useFindAllUserQuery();
  const [findAllBySearch] = useFindAllPlacesByAdminMutation();
  const [removeByAdmin] = useUpdateDisablePlaceByAdminMutation();

  const [resultData, setResultData] = useState<CafeInfoResult[]>([]);

  // const { data: generalData } = useFindUserByTypeQuery({ userType: 'GENERAL' });
  // const { data: businessData } = useFindUserByTypeQuery({
  //   userType: 'BUSINESS',
  // });


  //***  페이징?? */
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>();
  const take: number = 10;

  const [searchType, setSearchType] = useState<string>('');
  const [searchText, setSearchText] = useState<string>('');


  const resetData = useCallback(async () => {
    const result = await findAllBySearch({ page: 1, take });
    console.log(result)
    if (result?.data) {
      const success = result.data;
      setResultData(success.data);
      setTotalCount(success.count);
    }
  }, [findAllBySearch]);

  const changePageAndSearchUser = useCallback(async (page: number, item?: whereQuery) => {
    const where = {
      searchType: item?.searchType || searchType,
      searchText: item?.searchText || searchText,
    };
    const result = await findAllBySearch({ page, take, ...where });

    if (result?.data) {
      const success = result.data;
      if (success.data?.length === 0 && page - 1 > 0) {
        changePageAndSearchUser(page - 1, item);
      } else {
        setPage(page);
        setResultData(success.data);
        setTotalCount(success.count);
      }
    }
  }, [searchType, searchText, findAllBySearch]);

  useEffect(() => {
    if (resetData) {
      setSearchType('이름');
      resetData();
    }
  }, [resetData]);

  useEffect(() => {
    if (changePageAndSearchUser && page !== undefined) changePageAndSearchUser(page);
  }, [changePageAndSearchUser, page]);

  const onClickSearch = async () => {
    changePageAndSearchUser(1, { searchType, searchText });
  }

  const onClickReset = () => {

  };

  //***페이징 */

  useEffect(() => {
    if (resultData) {
      console.log('success');
      // setUser(userData);
      setTable(resultData);
    }
  }, [resultData]);

  const [tableTitle, setTableTitle] = useState<string>('user');
  const [table, setTable] = useState<CafeInfoResult[]>([]);

  const [deleteUserArray, setDeleteUserArray] = useState<CafeInfoResult[]>([]);

  const onClickCheckAll = () => {
    const array: CafeInfoResult[] = [];
    if (table) {
      if (deleteUserArray.length === table.length) {
        setDeleteUserArray([]);
      } else {
        table?.map((item) => {
          array.push(item);
        });
        setDeleteUserArray(array);
      }
    }
  };

  const onClickCheckItem = (user: CafeInfoResult) => {

    const clone = [...deleteUserArray];
    console.log(clone.includes(user));
    if (clone.includes(user)) {
      const idx = clone.indexOf(user);
      if (idx > -1) clone.splice(idx, 1);
    } else {
      clone.push(user);
    }
    setDeleteUserArray(clone);
  };

  const onClickSetDisableChecked = async (isDisable: boolean) => {
    console.log(deleteUserArray);

    await Promise.all(
      deleteUserArray.map(async (item) => {
        console.log(item.name);
        if (item.id) await removeByAdmin({ id: item.id, isDisable: isDisable });
      }),
    );
    setDeleteUserArray([]);
    // noticeRefetch();
    if (page) changePageAndSearchUser(page);
  };

  return {
    tableTitle,
    table,
    onClickRouterDetail: (id: number) => {
      router.push(`/admin/cafeinfo/${id}`);
    },
    onClickRouteCreate: () => {
      router.push(`/admin/cafeinfo/create`);
    },
    onClickChangeTable: (cate: string) => {
      // ChangeTable(cate);
      setTableTitle(cate);
    },

    page: page ?? 1,
    take,
    totalCount,
    setPage,

    searchText,
    searchType,

    onClickCheckItem,
    onClickCheckAll,
    onClickSetDisableChecked,
    deleteArray: deleteUserArray,
    onClickRemoveOne: async (id: number, isDisable: boolean) => {
      await removeByAdmin({ id, isDisable });
      // noticeRefetch();
      if (page) changePageAndSearchUser(page);
    },
    onChangeSearchType: (val: string) => {
      setSearchType(val);
    },
    onChangeSearchText: (val: string) => {
      setSearchText(val);
    },
    onClickReset,
    onClickSearch,
  };
}

interface whereQuery {
  searchType?: string;
  searchText?: string;
}