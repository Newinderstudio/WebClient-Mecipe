import { useState, useCallback, useEffect } from 'react';
import { useFindAllBoardsByAdminMutation, useRemoveBoardMutation, BoardResult } from '@/api/boardsApi';
import { SearchBoardDto } from '@/api/dto/boardsApiDto';
import { useRouter } from 'next/navigation';
import { BoardType } from '@/data/prisma-client';

// interface hookMember {
//   boards: BoardResult[]
//   totalCount: number
//   isLoading: boolean
//   error: Error | null
//   isDeleting: boolean
//   handleBoardTypeChange: (boardType: BoardType | undefined) => void
//   handlePageChange: (page: number) => void
//   handleCreateBoard: () => void
//   handleEditBoard: (id: number) => void
//   handleDeleteBoard: (id: number) => Promise<void>
//   boardTypeOptions: { value: BoardType | undefined, label: string }[]
//   currentPage: number
//   pageSize: number
//   selectedBoardType: BoardType | undefined

// }

export const useAdminBoardScreen = () => {

  const router = useRouter();
  const [selectedBoardType, setSelectedBoardType] = useState<BoardType | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const [boards, setBoards] = useState<BoardResult[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const [searchType, setSearchType] = useState<string>('전체');
  const [searchText, setSearchText] = useState<string>('');

  const [findAllBoardsByAdmin, { isLoading: isSearching }] = useFindAllBoardsByAdminMutation();
  const [removeBoard, { isLoading: isDeleting }] = useRemoveBoardMutation();

  const onChangeSearchType = (type: string) => {
    setSearchType(type);
  };
  const onChangeSearchText = (text: string) => {
    setSearchText(text);
  };
  

  const searchBoards = useCallback(async (searchDto: SearchBoardDto) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await findAllBoardsByAdmin(searchDto).unwrap();
      setBoards(result.boards);
      setTotalCount(result.pagination.total);
    } catch (err) {
      setError(err as Error);
      console.error('게시판 검색 실패:', err);
    } finally {
      setIsLoading(false);
    }
  }, [findAllBoardsByAdmin]);

  const onClickSearch = () => {
    searchBoards({
      page: currentPage,
      limit: pageSize,
      boardType: selectedBoardType,
      title: searchText,
      content: searchText
    });
  };

  useEffect(() => {
    searchBoards({
      page: currentPage,
      limit: pageSize,
      boardType: selectedBoardType
    });
  }, [currentPage, pageSize, selectedBoardType, searchBoards]);

  const handleBoardTypeChange = (boardType: BoardType | undefined) => {
    setSelectedBoardType(boardType);
    setCurrentPage(1); // 페이지 초기화
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleCreateBoard = () => {
    router.push('/admin/board/create');
  };

  const handleEditBoard = (id: number) => {
    router.push(`/admin/board/${id}`);
  };

  const handleDeleteBoard = async (id: number) => {
    if (window.confirm('정말로 이 게시판을 삭제하시겠습니까?')) {
      try {
        await deleteBoard(id);
        // 삭제 후 현재 페이지 데이터 다시 로드
        searchBoards({
          page: currentPage,
          limit: pageSize,
          boardType: selectedBoardType
        });
      } catch (error) {
        console.error('게시판 삭제 실패:', error);
        alert('게시판 삭제에 실패했습니다.');
      }
    }
  };

  const boardTypeOptions = [
    { value: undefined, label: '전체' },
    { value: 'NOTICE', label: '공지사항' },
    { value: 'EVENT', label: '이벤트' },
    { value: 'NEWS', label: '뉴스' },
    { value: 'FAQ', label: 'FAQ' },
    { value: 'GENERAL', label: '일반' }
  ];

  const deleteBoard = useCallback(async (id: number) => {
    try {
      await removeBoard({ id }).unwrap();
      // 삭제 성공 시 목록에서 제거
      setBoards(prev => prev.filter(board => board.id !== id));
      setTotalCount(prev => prev - 1);
    } catch (err) {
      console.error('게시판 삭제 실패:', err);
      throw err;
    }
  }, [removeBoard]);

  return {
    boards,
    totalCount,
    isLoading: isLoading || isSearching,
    error,
    isDeleting,
    handleBoardTypeChange,
    handlePageChange,
    handleCreateBoard,
    handleEditBoard,
    handleDeleteBoard,
    boardTypeOptions,
    currentPage,
    pageSize,
    selectedBoardType,
    searchType,
    searchText,
    onChangeSearchType,
    onChangeSearchText,
    onClickSearch
  };
};
