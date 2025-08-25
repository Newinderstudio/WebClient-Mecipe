'use client'

import React, { useState } from 'react';
import { useFindByCouponByGroupCodeWithUserIdMutation, CreateCouponResponse } from '../../api/couponsApi';
import { ProxyUserType } from '../../data/prisma-client';
import { BorderRoundedContent } from '@/common/styledAdmin';

const AdminCouponListScreen: React.FC = () => {
    const [findCoupons, { isLoading: isSearching }] = useFindByCouponByGroupCodeWithUserIdMutation();
    
    const [searchParams, setSearchParams] = useState({
        groupCode: '',
        memberId: '',
        userType: ProxyUserType.WEB
    });
    
    const [coupons, setCoupons] = useState<CreateCouponResponse[]>([]);
    const [searchPerformed, setSearchPerformed] = useState(false);

    const handleInputChange = (field: keyof typeof searchParams, value: string | ProxyUserType) => {
        setSearchParams(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSearch = async () => {
        if (!searchParams.groupCode && !searchParams.memberId) {
            alert('그룹 코드 또는 회원 ID 중 하나는 입력해야 합니다.');
            return;
        }

        try {
            const searchData = {
                groupCode: searchParams.groupCode,
                memberId: searchParams.memberId,
                userType: searchParams.userType
            };

            const result = await findCoupons(searchData).unwrap();
            
            setCoupons(result);
            setSearchPerformed(true);
            
            if (result.length === 0) {
                alert('검색 결과가 없습니다.');
            } else {
                alert(`${result.length}개의 쿠폰을 찾았습니다.`);
            }
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

    return (
        <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
            <div style={{ marginLeft: 240, padding: 20, minWidth: 1100 }}>
                <h2 style={{ marginBottom: '20px', color: '#333', borderBottom: '2px solid #007bff', paddingBottom: '10px' }}>
                    쿠폰 조회
                </h2>

                <BorderRoundedContent style={{ padding: 30, marginBottom: 30 }}>
                    <h3 style={{ marginBottom: '20px', color: '#333', borderBottom: '1px solid #dee2e6', paddingBottom: '10px' }}>
                        검색 조건
                    </h3>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label style={{ marginBottom: '8px', fontWeight: '600', color: '#555' }}>그룹 코드</label>
                            <input
                                type="text"
                                value={searchParams.groupCode}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('groupCode', e.target.value)}
                                placeholder="쿠폰 그룹 코드를 입력하세요"
                                style={{
                                    padding: '12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    fontSize: '14px'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label style={{ marginBottom: '8px', fontWeight: '600', color: '#555' }}>회원 ID</label>
                            <input
                                type="text"
                                value={searchParams.memberId}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('memberId', e.target.value)}
                                placeholder="회원 ID를 입력하세요"
                                style={{
                                    padding: '12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    fontSize: '14px'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label style={{ marginBottom: '8px', fontWeight: '600', color: '#555' }}>사용자 타입</label>
                            <select
                                value={searchParams.userType}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('userType', e.target.value as ProxyUserType)}
                                style={{
                                    padding: '12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    backgroundColor: 'white'
                                }}
                            >
                                {Object.values(ProxyUserType).map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button
                        onClick={handleSearch}
                        disabled={isSearching}
                        style={{
                            padding: '12px 24px',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            backgroundColor: '#007bff',
                            color: 'white',
                            opacity: isSearching ? 0.6 : 1
                        }}
                    >
                        {isSearching ? '검색 중...' : '쿠폰 검색'}
                    </button>
                </BorderRoundedContent>

                {searchPerformed && (
                    <BorderRoundedContent style={{ padding: 30 }}>
                        <h3 style={{ marginBottom: '20px', color: '#333', borderBottom: '1px solid #dee2e6', paddingBottom: '10px' }}>
                            검색 결과 ({coupons.length}개)
                        </h3>
                        
                        {coupons.length > 0 ? (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ 
                                    width: '100%', 
                                    borderCollapse: 'collapse',
                                    backgroundColor: 'white',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#f8f9fa' }}>
                                            <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #dee2e6', fontWeight: '600' }}>시리얼 번호</th>
                                            <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #dee2e6', fontWeight: '600' }}>쿠폰명</th>
                                            <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #dee2e6', fontWeight: '600' }}>내용</th>
                                            <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #dee2e6', fontWeight: '600' }}>시작일</th>
                                            <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #dee2e6', fontWeight: '600' }}>종료일</th>
                                            <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #dee2e6', fontWeight: '600' }}>상태</th>
                                            <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #dee2e6', fontWeight: '600' }}>그룹 코드</th>
                                            <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #dee2e6', fontWeight: '600' }}>회원 ID</th>
                                            <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #dee2e6', fontWeight: '600' }}>사용자 타입</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {coupons.map((coupon, index) => (
                                            <tr key={coupon.serialNumber} style={{ 
                                                backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa',
                                                borderBottom: '1px solid #e9ecef'
                                            }}>
                                                <td style={{ padding: '15px', borderBottom: '1px solid #e9ecef', fontFamily: 'monospace', fontSize: '12px' }}>
                                                    {coupon.serialNumber}
                                                </td>
                                                <td style={{ padding: '15px', borderBottom: '1px solid #e9ecef' }}>
                                                    {coupon.name || '-'}
                                                </td>
                                                <td style={{ padding: '15px', borderBottom: '1px solid #e9ecef' }}>
                                                    {coupon.content || '-'}
                                                </td>
                                                <td style={{ padding: '15px', borderBottom: '1px solid #e9ecef' }}>
                                                    {coupon.startDay ? formatDate(coupon.startDay.toISOString()) : '-'}
                                                </td>
                                                <td style={{ padding: '15px', borderBottom: '1px solid #e9ecef' }}>
                                                    {coupon.endDay ? formatDate(coupon.endDay.toISOString()) : '-'}
                                                </td>
                                                <td style={{ padding: '15px', borderBottom: '1px solid #e9ecef' }}>
                                                    {coupon.endDay ? getStatusBadge(coupon.endDay.toISOString()) : '-'}
                                                </td>
                                                <td style={{ padding: '15px', borderBottom: '1px solid #e9ecef' }}>
                                                    {coupon.CafeCouponGroup?.code || '-'}
                                                </td>
                                                <td style={{ padding: '15px', borderBottom: '1px solid #e9ecef' }}>
                                                    {coupon.ProxyUser?.memberId || '-'}
                                                </td>
                                                <td style={{ padding: '15px', borderBottom: '1px solid #e9ecef' }}>
                                                    {coupon.ProxyUser?.proxyUserType || '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div style={{ 
                                textAlign: 'center', 
                                padding: '40px', 
                                color: '#6c757d',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '8px'
                            }}>
                                검색 결과가 없습니다.
                            </div>
                        )}
                    </BorderRoundedContent>
                )}
            </div>
        </div>
    );
};

export default AdminCouponListScreen;
