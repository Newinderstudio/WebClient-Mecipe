'use client'

import React, { useCallback, useState } from 'react';
import { useCreateCouponMutation, useCreateCouponQRCodeMutation, CreateCouponPayload, CreateCouponQRCodePayload, CreateCouponResponse } from '../../api/couponsApi';
import { ProxyUserType } from '../../data/prisma-client';
import { BorderRoundedContent } from '@/common/styledAdmin';

const AdminCouponCreateScreen: React.FC = () => {
    const [createCoupon, { isLoading: isCreatingCoupon }] = useCreateCouponMutation();
    const [createCouponQRCode, { isLoading: isCreatingQRCode }] = useCreateCouponQRCodeMutation();

    const [formData, setFormData] = useState<CreateCouponPayload>({
        name: '',
        description: '',
        startDay: new Date(),
        endDay: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30일 후
        groupCode: '',
        memberId: '',
        nickname: '',
        userType: ProxyUserType.WEB,
        eventDescription: '',
        duplicate: false,
        force: false,
    });

    const [includeName, setIncludeName] = useState(false);
    const [includeDescription, setIncludeDescription] = useState(false);
    const [includeStartDay, setIncludeStartDay] = useState(false);
    const [includeEventDescription, setIncludeEventDescription] = useState(false);
    const [includeForce, setIncludeForce] = useState(false);
    const [createdCoupon, setCreatedCoupon] = useState<CreateCouponResponse | null>(null);
    const [qrCodeImage, setQrCodeImage] = useState<string>('');

    // QR Matrix 데이터를 이미지로 변환하는 함수
    const convertQrMatrixToImage = (base64Data: string, size: number): string => {
        try {
            // base64를 바이트 배열로 변환
            const bytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

            // Canvas 생성
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Canvas context를 생성할 수 없습니다.');

            // QR 코드 크기 설정 (픽셀 단위)
            const pixelSize = 8; // 각 셀을 8x8 픽셀로 표현 (더 크게)
            const canvasSize = size * pixelSize;

            canvas.width = canvasSize;
            canvas.height = canvasSize;

            // 배경을 흰색으로 설정
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvasSize, canvasSize);

            // QR 코드 그리기
            ctx.fillStyle = '#000000';

            for (let y = 0; y < size; y++) {
                for (let x = 0; x < size; x++) {
                    const bitIndex = y * size + x;
                    const byteIndex = Math.floor(bitIndex / 8);
                    const bitOffset = 7 - (bitIndex % 8); // MSB부터

                    if (byteIndex < bytes.length && (bytes[byteIndex] & (1 << bitOffset))) {
                        // 검은색 셀 그리기
                        ctx.fillRect(
                            x * pixelSize,
                            y * pixelSize,
                            pixelSize,
                            pixelSize
                        );
                    }
                }
            }

            // Canvas를 base64 이미지로 변환
            return canvas.toDataURL('image/png');
        } catch (error) {
            console.error('QR Matrix를 이미지로 변환 실패:', error);
            throw new Error('QR 코드 이미지 생성에 실패했습니다.');
        }
    };

    const isValidFormData = useCallback(() => {
        return formData.groupCode !== '' && formData.memberId !== '' && formData.nickname !== '' && !isNaN(formData.endDay.getTime());
    }, [formData.groupCode, formData.memberId, formData.nickname, formData.endDay]);

    const handleInputChange = (field: keyof CreateCouponPayload, value: string | Date | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleCreateCoupon = async () => {

        if (formData.groupCode === '') {
            alert('그룹 코드를 입력해주세요.');
            return;
        }

        if (formData.memberId === '') {
            alert('회원 ID를 입력해주세요.');
            return;
        }

        if (formData.nickname === '') {
            alert('닉네임을 입력해주세요.');
            return;
        }

        // 종료일이 InvalidDate인지 체크
        if (isNaN(formData.endDay.getTime())) {
            alert('종료일을 입력해주세요.');
            return;
        }

        try {
            // 필수 필드들
            const couponData: CreateCouponPayload = {
                endDay: new Date(formData.endDay.getTime()),
                groupCode: formData.groupCode,
                memberId: formData.memberId,
                nickname: formData.nickname,
                userType: formData.userType,
                duplicate: formData.duplicate,
            };

            // 선택적 필드들
            if (includeName && formData.name) {
                couponData.name = formData.name;
            }
            if (includeDescription && formData.description) {
                couponData.description = formData.description;
            }
            if (includeStartDay && formData.startDay) {
                // 한국 시간을 UTC로 변환 (9시간 빼기)
                const utcStartDay = new Date(formData.startDay.getTime());
                couponData.startDay = utcStartDay;
            }
            if (includeEventDescription && formData.eventDescription) {
                couponData.eventDescription = formData.eventDescription;
            }
            if (includeForce) {
                couponData.force = formData.force;
            }

            const result = await createCoupon(couponData).unwrap();
            setCreatedCoupon(result);
            alert('쿠폰이 성공적으로 생성되었습니다!');
        } catch (error) {
            console.error('쿠폰 생성 실패:', error);
            alert('쿠폰 생성에 실패했습니다.');
        }
    };

    const handleCreateQRCode = async () => {
        if (!createdCoupon?.serialNumber) {
            alert('먼저 쿠폰을 생성해주세요.');
            return;
        }

        try {
            const qrCodePayload: CreateCouponQRCodePayload = {
                serialNumber: createdCoupon.serialNumber
            };

            const result = await createCouponQRCode(qrCodePayload).unwrap();

            // QR Matrix 데이터를 이미지로 변환
            try {
                const imageData = convertQrMatrixToImage(result.base64Data, result.size);
                setQrCodeImage(imageData);
                alert('QR 코드가 성공적으로 생성되었습니다!');
            } catch (error) {
                console.error('QR 코드 이미지 변환 실패:', error);
                alert('QR 코드는 생성되었지만 이미지 변환에 실패했습니다.');
            }
        } catch (error) {
            console.error('QR 코드 생성 실패:', error);
            alert('QR 코드 생성에 실패했습니다.');
        }
    };

    return (
        <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
            <div style={{ marginLeft: 240, padding: 20, minWidth: 1100 }}>
                <h2 style={{ marginBottom: '20px', color: '#333', borderBottom: '2px solid #007bff', paddingBottom: '10px' }}>
                    쿠폰 생성
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ marginBottom: '8px', fontWeight: '600', color: '#555', display: 'flex', alignItems: 'center' }}>
                            <input
                                type="checkbox"
                                checked={includeName}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIncludeName(e.target.checked)}
                                style={{ marginRight: '8px' }}
                            />
                            쿠폰명
                        </label>
                        {includeName && (
                            <input
                                type="text"
                                value={formData.name || ''}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('name', e.target.value)}
                                placeholder="쿠폰명을 입력하세요"
                                style={{
                                    padding: '12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    fontSize: '14px'
                                }}
                            />
                        )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ marginBottom: '8px', fontWeight: '600', color: '#555', display: 'flex', alignItems: 'center' }}>
                            <input
                                type="checkbox"
                                checked={includeDescription}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIncludeDescription(e.target.checked)}
                                style={{ marginRight: '8px' }}
                            />
                            쿠폰 설명
                        </label>
                        {includeDescription && (
                            <textarea
                                value={formData.description || ''}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('description', e.target.value)}
                                placeholder="쿠폰 설명을 입력하세요"
                                rows={3}
                                style={{
                                    padding: '12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    resize: 'vertical'
                                }}
                            />
                        )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ marginBottom: '8px', fontWeight: '600', color: '#555', display: 'flex', alignItems: 'center' }}>
                            <input
                                type="checkbox"
                                checked={includeStartDay}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIncludeStartDay(e.target.checked)}
                                style={{ marginRight: '8px' }}
                            />
                            시작일
                        </label>
                        {includeStartDay && formData.startDay && (
                            <input
                                type="datetime-local"
                                value={formData.startDay.toLocaleString('sv-SE', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(' ', 'T')}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('startDay', new Date(e.target.value))}
                                style={{
                                    padding: '12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    fontSize: '14px'
                                }}
                            />
                        )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ marginBottom: '8px', fontWeight: '600', color: '#555' }}>종료일</label>
                        <input
                            type="datetime-local"
                            value={formData.endDay.toLocaleString('sv-SE', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(' ', 'T')}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('endDay', new Date(e.target.value))}
                            style={{
                                padding: '12px',
                                border: '1px solid #ddd',
                                borderRadius: '6px',
                                fontSize: '14px'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ marginBottom: '8px', fontWeight: '600', color: '#555' }}>그룹 코드</label>
                        <input
                            type="text"
                            value={formData.groupCode}
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
                            value={formData.memberId}
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
                        <label style={{ marginBottom: '8px', fontWeight: '600', color: '#555' }}>닉네임</label>
                        <input
                            type="text"
                            value={formData.nickname}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('nickname', e.target.value)}
                            placeholder="닉네임을 입력하세요"
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
                            value={formData.userType}
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

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ marginBottom: '8px', fontWeight: '600', color: '#555', display: 'flex', alignItems: 'center' }}>
                            <input
                                type="checkbox"
                                checked={includeEventDescription}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIncludeEventDescription(e.target.checked)}
                                style={{ marginRight: '8px' }}
                            />
                            이벤트 설명
                        </label>
                        {includeEventDescription && (
                            <textarea
                                value={formData.eventDescription}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('eventDescription', e.target.value)}
                                placeholder="이벤트 설명을 입력하세요"
                                rows={3}
                                style={{
                                    padding: '12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    resize: 'vertical'
                                }}
                            />
                        )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ marginBottom: '8px', fontWeight: '600', color: '#555', display: 'flex', alignItems: 'center' }}>
                            <input
                                type="checkbox"
                                checked={formData.duplicate}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('duplicate', e.target.checked)}
                                style={{ marginRight: '8px' }}
                            />
                            중복 허용
                        </label>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ marginBottom: '8px', fontWeight: '600', color: '#555', display: 'flex', alignItems: 'center' }}>
                            <input
                                type="checkbox"
                                checked={includeForce}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIncludeForce(e.target.checked)}
                                style={{ marginRight: '8px' }}
                            />
                            강제 생성
                        </label>
                        {includeForce && (
                            <label style={{ marginTop: '8px', display: 'flex', alignItems: 'center' }}>
                                <input
                                    type="checkbox"
                                    checked={formData.force || false}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('force', e.target.checked)}
                                    style={{ marginRight: '8px' }}
                                />
                                강제 생성 활성화
                            </label>
                        )}
                    </div>
                </div>
                <BorderRoundedContent style={{ padding: 30 }}>

                    <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
                        <button
                            onClick={handleCreateCoupon}
                            disabled={isCreatingCoupon || !isValidFormData()}
                            style={{
                                padding: '12px 24px',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                backgroundColor: '#007bff',
                                color: 'white',
                                opacity: isCreatingCoupon || !isValidFormData() ? 0.6 : 1
                            }}
                        >
                            {isCreatingCoupon ? '쿠폰 생성 중...' : '쿠폰 생성'}
                        </button>

                        {createdCoupon && (
                            <button
                                onClick={handleCreateQRCode}
                                disabled={isCreatingQRCode}
                                style={{
                                    padding: '12px 24px',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    backgroundColor: '#6c757d',
                                    color: 'white',
                                    opacity: isCreatingQRCode ? 0.6 : 1
                                }}
                            >
                                {isCreatingQRCode ? 'QR 코드 생성 중...' : 'QR 코드 생성'}
                            </button>
                        )}
                    </div>

                    {createdCoupon && (
                        <div style={{ marginBottom: '30px' }}>
                            <h2 style={{ marginBottom: '20px', color: '#333', borderBottom: '2px solid #007bff', paddingBottom: '10px' }}>
                                생성된 쿠폰 정보
                            </h2>
                            <div style={{
                                backgroundColor: '#f8f9fa',
                                border: '1px solid #dee2e6',
                                borderRadius: '8px',
                                padding: '20px'
                            }}>
                                <div style={{ marginBottom: '10px', padding: '8px 0', borderBottom: '1px solid #e9ecef' }}>
                                    <strong>시리얼 번호:</strong> {createdCoupon.serialNumber}
                                </div>
                                <div style={{ marginBottom: '10px', padding: '8px 0', borderBottom: '1px solid #e9ecef' }}>
                                    <strong>쿠폰명:</strong> {createdCoupon.name}
                                </div>
                                <div style={{ marginBottom: '10px', padding: '8px 0', borderBottom: '1px solid #e9ecef' }}>
                                    <strong>내용:</strong> {createdCoupon.content}
                                </div>
                                <div style={{ marginBottom: '10px', padding: '8px 0' }}>
                                    <strong>그룹 코드:</strong> {createdCoupon.CafeCouponGroup?.code}
                                </div>
                            </div>
                        </div>
                    )}

                    {qrCodeImage && (
                        <div style={{ marginBottom: '30px' }}>
                            <h2 style={{ marginBottom: '20px', color: '#333', borderBottom: '2px solid #007bff', paddingBottom: '10px' }}>
                                생성된 QR 코드
                            </h2>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '20px',
                                padding: '20px',
                                backgroundColor: '#f8f9fa',
                                border: '1px solid #dee2e6',
                                borderRadius: '8px'
                            }}>
                                <img
                                    src={qrCodeImage}
                                    alt="QR Code"
                                    style={{ maxWidth: '300px', height: 'auto' }}
                                />
                                <button
                                    onClick={async () => {
                                        try {
                                            // 변환된 이미지가 있는지 확인
                                            if (!qrCodeImage) {
                                                alert('QR 코드 이미지가 없습니다.');
                                                return;
                                            }

                                            // base64 이미지 데이터를 Blob으로 변환
                                            const response = await fetch(qrCodeImage);
                                            const blob = await response.blob();

                                            // 다운로드 링크 생성
                                            const url = URL.createObjectURL(blob);
                                            const link = document.createElement('a');
                                            link.href = url;
                                            link.download = `coupon-qr-${createdCoupon?.serialNumber || 'unknown'}.png`;

                                            // 링크 클릭 및 정리
                                            document.body.appendChild(link);
                                            link.click();
                                            document.body.removeChild(link);

                                            // 메모리 정리
                                            URL.revokeObjectURL(url);

                                            alert('QR 코드가 성공적으로 다운로드되었습니다!');
                                        } catch (error) {
                                            console.error('QR 코드 다운로드 실패:', error);
                                            const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
                                            alert('QR 코드 다운로드에 실패했습니다. 오류: ' + errorMessage);
                                        }
                                    }}
                                    style={{
                                        padding: '10px 20px',
                                        backgroundColor: '#28a745',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    QR 코드 다운로드
                                </button>
                            </div>
                        </div>
                    )}
                </BorderRoundedContent>


            </div>
        </div >
    );
};

export default AdminCouponCreateScreen;
