import { useEffect, useState } from 'react';

interface hookMember {
  pageArray: number[];

  onClickPrevPageGroup: () => void;
  onClickNextPageGroup: () => void;
}

export function useAdminTable(
  totalCount: number,
  take: number,
  pageGroupCount: number,
  setPage: (page: number) => void,
): hookMember {
  //
  const [pageGroup, setPageGroup] = useState<number[][]>([]);
  const [pageArray, setPageArray] = useState<number[]>([]);
  const [pageIndex, setPageIndex] = useState<number>(0);

  useEffect(() => {
    if (totalCount && take) {
      const inPageGroup: number[][] = [];
      const size = Math.ceil(totalCount / take);
      const tempArray = range(Math.floor(size / pageGroupCount) + 1, 0);
      tempArray.map((item, index) => {
        if (index === tempArray.length - 1) {
          inPageGroup.push(
            range(size % pageGroupCount, pageGroupCount * item + 1),
          );
          return;
        }
        inPageGroup.push(range(pageGroupCount, pageGroupCount * item + 1));
      });

      setPageGroup(inPageGroup);
      setPageArray(inPageGroup[pageIndex]);
    }
  }, [totalCount, take]);

  function range(size: number, start: number) {
    return Array(size)
      .fill(start)
      .map((x, y) => x + y);
  }

  const onClickPrevPageGroup = () => {
    if (pageGroup[pageIndex - 1]) {
      setPageArray(pageGroup[pageIndex - 1]);
      setPage(pageGroup[pageIndex - 1][0]);
      setPageIndex(pageIndex - 1);
    }
  };

  const onClickNextPageGroup = () => {
    if (pageGroup[pageIndex + 1]) {
      setPageArray(pageGroup[pageIndex + 1]);
      setPage(pageGroup[pageIndex + 1][0]);
      setPageIndex(pageIndex + 1);
    }
  };

  useEffect(() => {
    //
  }, []);

  return {
    pageArray,

    onClickPrevPageGroup,
    onClickNextPageGroup,
  };
}
