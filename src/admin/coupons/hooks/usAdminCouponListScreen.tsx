import React, { useState } from 'react';
import { useAdminFindAllCouponsMutation, CafeCouponResult } from '@/api/couponsApi';
import { ProxyUserType } from '@/data/prisma-client';

export const useAdminCouponListScreen = () => {
    const [findCoupons, { isLoading: isSearching }] = useAdminFindAllCouponsMutation();

    const [searchParams, setSearchParams] = useState({
        groupCode: '',
        memberId: '',
        userType: 'ALL'
    });

    const [coupons, setCoupons] = useState<CafeCouponResult[]>([]);
    const [searchPerformed, setSearchPerformed] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const handleInputChange = (field: keyof typeof searchParams, value: string | ProxyUserType) => {
        setSearchParams(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSearch = async () => {
        try {
            const searchData = {
                groupCode: searchParams.groupCode,
                memberId: searchParams.memberId,
                userType: searchParams.userType === 'ALL' ? undefined : searchParams.userType
            };

            const result = await findCoupons(searchData).unwrap();

            setCoupons(result.coupons);
            setSearchPerformed(true);
            setTotalCount(result.pagination.total);
            setCurrentPage(result.pagination.page);
            setPageSize(result.pagination.limit);
        } catch (error) {
            console.error('쿠폰 검색 실패:', error);
            alert('쿠폰 검색에 실패했습니다.');
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const getStatusBadge = (endDay: string) => {
        const now = new Date();
        const endDate = new Date(endDay);

        if (endDate < now) {
            return <span style={{
                backgroundColor: '#dc3545',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '12px'
            }}>만료</span>;
        } else {
            return <span style={{
                backgroundColor: '#28a745',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '12px'
            }}>유효</span>;
        }
    };

    return {
        coupons,
        isSearching,
        searchParams,
        handleInputChange,
        handleSearch,
        formatDate,
        getStatusBadge,
        searchPerformed,
        totalCount,
        currentPage,
        pageSize,
        handlePageChange
    }
}