import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { MetaViewerInfoResult, useFindAllMetaViewerInfosMutation } from '@/api/metaViewerInfosApi';

interface hookMember {
  table: MetaViewerInfoResult[] | [];
  onClickRouterDetail: (id: number) => void;
  onClickRouteCreate: () => void;

  page: number;
  take: number;
  totalCount: number;
  setPage: (page: number) => void;

  searchText: string;
  searchType: string;

  onChangeSearchType: (val: string) => void;
  onChangeSearchText: (val: string) => void;
  onClickSearch: () => void;
  onClickReset: () => void;
}

export function useAdminMetaViewerInfosListScreen(): hookMember {
  const router = useRouter();

  const [findAllMetaViewerInfos] = useFindAllMetaViewerInfosMutation();

  const [resultData, setResultData] = useState<MetaViewerInfoResult[]>([]);

  //***  페이징 */
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>();
  const take: number = 10;

  const [searchType, setSearchType] = useState<string>('');
  const [searchText, setSearchText] = useState<string>('');

  const resetData = useCallback(async () => {
    const result = await findAllMetaViewerInfos({ page: 1, limit: take });
    console.log(result)
    if (result?.data) {
      const success = result.data;
      setResultData(success.metaViewerInfos);
      setTotalCount(success.pagination.total);
    }
  }, [findAllMetaViewerInfos, take]);

  const changePageAndSearch = useCallback(async (page: number, item?: whereQuery) => {
    const whereRaw = {
      searchType: item?.searchType || searchType,
      searchText: item?.searchText || searchText,
    };
    
    // searchType에 따라 DTO 매핑
    let mappedSearchType: 'code' | 'cafeInfoId' | undefined;
    if (whereRaw.searchType === '코드') {
      mappedSearchType = 'code';
    } else if (whereRaw.searchType === '카페ID') {
      mappedSearchType = 'cafeInfoId';
    }

    const where = {
      searchType: mappedSearchType,
      searchText: whereRaw.searchText,
    };

    const result = await findAllMetaViewerInfos({ page, limit: take, ...where });

    if (result?.data) {
      const success = result.data;
      if (success.metaViewerInfos?.length === 0 && page - 1 > 0) {
        changePageAndSearch(page - 1, item);
      } else {
        setPage(page);
        setResultData(success.metaViewerInfos);
        setTotalCount(success.pagination.total);
      }
    }
  }, [searchType, searchText, findAllMetaViewerInfos, take]);

  useEffect(() => {
    if (resetData) {
      setSearchType('코드');
      resetData();
    }
  }, [resetData]);

  useEffect(() => {
    if (changePageAndSearch && page !== undefined) changePageAndSearch(page);
  }, [changePageAndSearch, page]);

  const onClickSearch = async () => {
    changePageAndSearch(1, { searchType, searchText });
  }

  const onClickReset = () => {
    setSearchText('');
    resetData();
  };

  //***페이징 */

  useEffect(() => {
    if (resultData) {
      console.log('success');
      setTable(resultData);
    }
  }, [resultData]);

  const [table, setTable] = useState<MetaViewerInfoResult[]>([]);

  return {
    table,
    onClickRouterDetail: (id: number) => {
      router.push(`/admin/metaviewerinfos/${id}`);
    },
    onClickRouteCreate: () => {
      router.push(`/admin/metaviewerinfos/create`);
    },

    page: page ?? 1,
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
    onClickReset,
    onClickSearch,
  };
}

interface whereQuery {
  searchType?: string;
  searchText?: string;
}

