import { useState, useCallback, useEffect } from 'react';
import { useFindAllProductsByAdminMutation, useRemoveProductMutation, ProductResult } from '@/api/productsApi';
import { SearchProductDto } from '@/api/dto/productsApiDto';
import { useRouter } from 'next/navigation';

export const useAdminProductListScreen = () => {

  const router = useRouter();
  const [selectedProductCategoryId, setSelectedProductCategoryId] = useState<number | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const [products, setProducts] = useState<ProductResult[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const [searchType, setSearchType] = useState<string>('전체');
  const [searchText, setSearchText] = useState<string>('');

  const [findAllProductsByAdmin, { isLoading: isSearching }] = useFindAllProductsByAdminMutation();
  const [removeProduct, { isLoading: isDeleting }] = useRemoveProductMutation();

  const onChangeSearchType = (type: string) => {
    setSearchType(type);
  };
  const onChangeSearchText = (text: string) => {
    setSearchText(text);
  };
  

  const searchProducts = useCallback(async (searchDto: SearchProductDto) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await findAllProductsByAdmin(searchDto).unwrap();
      setProducts(result.products);
      setTotalCount(result.pagination.total);
    } catch (err) {
      setError(err as Error);
      console.error('게시판 검색 실패:', err);
    } finally {
      setIsLoading(false);
    }
  }, [findAllProductsByAdmin]);

  const onClickSearch = () => {
    searchProducts({
      page: currentPage,
      limit: pageSize,
      categoryId: selectedProductCategoryId,
      searchType: searchType,
      searchText: searchText
    });
  };

  useEffect(() => {
    searchProducts({
      page: currentPage,
      limit: pageSize,
    });
  }, [currentPage, pageSize, searchProducts]);

  const handleProductCategoryChange = (productCategoryId: number | undefined) => {
    setSelectedProductCategoryId(productCategoryId);
    setCurrentPage(1); // 페이지 초기화
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleCreateProduct = () => {
    router.push('/admin/product/create');
  };

  const handleEditProduct = (id: number) => {
    router.push(`/admin/product/${id}`);
  };

  const handleDeleteProduct = async (id: number) => {
    if (window.confirm('정말로 이 상품을 삭제하시겠습니까?')) {
      try {
        await deleteProduct(id);
        // 삭제 후 현재 페이지 데이터 다시 로드
        searchProducts({
          page: currentPage,
          limit: pageSize,
          categoryId: selectedProductCategoryId,
          searchType: searchType,
          searchText: searchText
        });
      } catch (error) {
        console.error('상품 삭제 실패:', error);
        alert('상품 삭제에 실패했습니다.');
      }
    }
  };

  const deleteProduct = useCallback(async (id: number) => {
    try {
      await removeProduct({ id }).unwrap();
      // 삭제 성공 시 목록에서 제거
      setProducts(prev => prev.filter(product => product.id !== id));
      setTotalCount(prev => prev - 1);
    } catch (err) {
      console.error('상품 삭제 실패:', err);
      throw err;
    }
  }, [removeProduct]);

  return {
    products,
    totalCount,
    isLoading: isLoading || isSearching,
    error,
    isDeleting,
    handleProductCategoryChange,
    handlePageChange,
    handleCreateProduct,
    handleEditProduct,
    handleDeleteProduct,
    currentPage,
    pageSize,
    selectedProductCategoryId,
    searchType,
    searchText,
    onChangeSearchType,
    onChangeSearchText,
    onClickSearch
  };
};
