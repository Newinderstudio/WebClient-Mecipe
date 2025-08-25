'use client'

import React from 'react';
import { ProxyUserType } from '../../data/prisma-client';
import { BorderRoundedContent } from '@/common/styledAdmin';
import { useAdminCouponListScreen } from './hooks/usAdminCouponListScreen';
import { Flex } from '@/common/styledComponents';
import AdminTable from '@/common/table/AdminTable';
import GetSeoulTime from '@/common/time/GetSeoulTime';

const AdminCouponListScreen: React.FC = () => {
    const hookMember = useAdminCouponListScreen();

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
                                value={hookMember.searchParams.groupCode}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => hookMember.handleInputChange('groupCode', e.target.value)}
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
                                value={hookMember.searchParams.memberId}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => hookMember.handleInputChange('memberId', e.target.value)}
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
                                value={hookMember.searchParams.userType}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => hookMember.handleInputChange('userType', e.target.value as ProxyUserType)}
                                style={{
                                    padding: '12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    backgroundColor: 'white'
                                }}
                            >
                                {['ALL', ...Object.values(ProxyUserType)].map(type => (
                                    <option key={type} value={type === 'ALL' ? undefined : type}>{type}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button
                        onClick={hookMember.handleSearch}
                        disabled={hookMember.isSearching}
                        style={{
                            padding: '12px 24px',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            backgroundColor: '#007bff',
                            color: 'white',
                            opacity: hookMember.isSearching ? 0.6 : 1
                        }}
                    >
                        {hookMember.isSearching ? '검색 중...' : '쿠폰 검색'}
                    </button>
                </BorderRoundedContent>


                
                {
                    // 시리얼 번호, 쿠폰명, 내용, 시작일, 종료일, 상태, 그룹코드, 회원 ID, 사용자 타입
                hookMember.searchPerformed && (
                    <BorderRoundedContent>
                        <Flex style={{ padding: 30 }}>
                            <AdminTable
                                headers={[
                                    { name: '이름', minWidth: 200, selector: 'name', cell: ({ data }) => {
                                        return <div style={{overflow:'scroll', textOverflow:'unset'}}><span>{data.name}</span></div>;
                                    } },
                                    {
                                        name: '시리얼 번호',
                                        minWidth: 200,
                                        selector: 'serialNumber',
                                    },
                                    {
                                        name: '내용',
                                        minWidth: 200,
                                        selector: 'content',
                                        cell: ({ data }) => {
                                            return <div style={{overflow:'scroll', textOverflow:'unset'}}><span>{data.content}</span></div>;
                                        }
                                    },
                                    {
                                        name: '그룹코드',
                                        minWidth: 200,
                                        selector: 'groupCode',
                                        cell: ({ data }) => {
                                            return <div style={{overflow:'scroll', textOverflow:'unset'}}><span>{data.groupCode}</span></div>;
                                        }   
                                    },
                                    {
                                        name: '회원 ID',
                                        selector: 'memberId',
                                        maxWidth: 200,
                                    },
                                    {
                                        name: '닉네임',
                                        selector: 'nickname',
                                        maxWidth: 200,
                                    },
                                    {
                                        name: '사용자 타입',
                                        selector: 'userType',
                                        maxWidth: 100,
                                    },
                                    {
                                        name: '시작일',
                                        selector: 'startDay',
                                        minWidth: 150,
                                        cell: ({ data }) => {
                                            return <GetSeoulTime time={data.startDay} long />;
                                        },
                                    },
                                    {
                                        name: '종료일',
                                        selector: 'endDay',
                                        minWidth: 150,
                                        cell: ({ data }) => {
                                            return data.endDay ? <GetSeoulTime time={data.endDay} long /> : <div>---</div>;
                                        },
                                    },
                                    // { name: '댓글허용', minWidth: 100, selector: 'isReplyAvaliable' },
                                    {
                                        name: '생성일',
                                        minWidth: 150,
                                        selector: 'createdAt',
                                        cell: ({ data }) => {
                                            return <GetSeoulTime time={data.createdAt} long />;
                                        },
                                    }
                                ]}
                                datas={hookMember.coupons.map(coupon => ({
                                    id: coupon.id,
                                    name: coupon.name,
                                    serialNumber: coupon.serialNumber,
                                    content: coupon.content,
                                    groupCode: coupon.CafeCouponGroup?.code,
                                    memberId: coupon.ProxyUser?.memberId || '-',
                                    userType: coupon.ProxyUser?.proxyUserType || '-',
                                    startDay: coupon.startDay || '-',
                                    endDay: coupon.endDay || '-',
                                    nickname: coupon.ProxyUser?.name || '-',
                                    createdAt: coupon.createdAt ? new Date(coupon.createdAt).toLocaleDateString('ko-KR') : '-'
                                }))}
                                totalCount={hookMember.totalCount}
                                page={hookMember.currentPage}
                                take={hookMember.pageSize}
                                setPage={hookMember.handlePageChange}
                            />
                        </Flex>
                    </BorderRoundedContent>
                )}
            </div>
        </div>
    );
};

export default AdminCouponListScreen;
