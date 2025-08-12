import { createApi } from '@reduxjs/toolkit/query/react';
import { fetchCompatBaseQuery } from '../util/fetchCompatBaseQuery';
import { CafeCoupon, CafeCouponHistory, CafeCouponQRCode, ProxyUserType } from '../data/prisma-client';

// API 응답 타입 정의
export interface CreateCouponResponse extends Omit<CafeCoupon, 'CafeCouponGroup'> {
  CafeCouponGroup: {
    code: string;
  };
}

export interface UseCouponResponse extends CafeCouponHistory {
  CafeCoupon: CafeCoupon;
}

// API 요청 타입 정의
export interface CreateCouponRequest {
  payload: string;
  signature: string;
}

export interface CreateCouponQRCodeRequest {
  payload: string;
  signature: string;
}

export interface FindByCouponByGroupCodeWithUserIdRequest {
  payload: string;
  signature: string;
}

export interface UseCouponRequest {
  payload: string;
  signature: string;
}

// 쿠폰 생성 payload 타입
export interface CreateCouponPayload {
  name?: string;
  description?: string;
  startDay?: Date;
  endDay: Date;
  groupCode: string;
  memberId: string;
  nickname: string;
  userType: ProxyUserType;
  eventDescription?: string;
  duplicate: boolean;
  force?: boolean;
}

// 쿠폰 QR 코드 생성 payload 타입
export interface CreateCouponQRCodePayload {
  serialNumber: string;
}

// 출처: https://geraintluff.github.io/sha256/
function sha256(ascii: string): string {
    function rightRotate(value: number, amount: number) {
        return (value >>> amount) | (value << (32 - amount));
    }

    const mathPow = Math.pow;
    const maxWord = mathPow(2, 32);
    const lengthProperty = "length";

    let i: number, j: number;
    let result = "";

    const words: number[] = [];
    const asciiBitLength = ascii.length * 8;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let hash = (sha256 as any).h || [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const k = (sha256 as any).k || [];
    let primeCounter = k[lengthProperty];

    if (hash[lengthProperty] === 0) {
        const isPrime: { [key: number]: number } = {};
        let candidate = 2;
        while (primeCounter < 64) {
            if (!isPrime[candidate]) {
                for (i = 0; i < 313; i += candidate) {
                    isPrime[i] = candidate;
                }
                hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
                k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
            }
            candidate++;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (sha256 as any).h = hash;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (sha256 as any).k = k;
    }

    ascii += "\x80"; // Append '1' bit (plus zero padding)
    while ((ascii.length % 64) - 56) ascii += "\x00"; // More zero padding
    for (i = 0; i < ascii.length; i++) {
        j = ascii.charCodeAt(i);
        if (j >> 8) return ""; // ASCII check
        words[i >> 2] |= j << (((3 - i) % 4) * 8);
    }
    words[words.length] = (asciiBitLength / maxWord) | 0;
    words[words.length] = asciiBitLength;

    for (j = 0; j < words.length; ) {
        const w = words.slice(j, (j += 16));
        const oldHash = hash.slice(0);

        for (i = 0; i < 64; i++) {
            const w15 = w[i - 15], w2 = w[i - 2];

            const a = hash[0], e = hash[4];
            const temp1 = hash[7] +
                (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) +
                ((e & hash[5]) ^ (~e & hash[6])) +
                k[i] +
                (w[i] = i < 16 ? w[i] : (
                    w[i - 16] +
                    (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) +
                    w[i - 7] +
                    (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))
                ) | 0);
            const temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) +
                ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));

            hash = [
                (temp1 + temp2) | 0,
                a,
                hash[1],
                hash[2],
                (hash[3] + temp1) | 0,
                hash[4],
                hash[5],
                hash[6]
            ];
        }

        for (i = 0; i < 8; i++) {
            hash[i] = (hash[i] + oldHash[i]) | 0;
        }
    }

    for (i = 0; i < 8; i++) {
        for (j = 3; j + 1; j--) {
            const b = (hash[i] >> (j * 8)) & 255;
            result += (b < 16 ? "0" : "") + b.toString(16);
        }
    }
    return result;
}

/**
 * 객체를 JSON.stringify로 처리하고 secret 키를 붙여서 SHA-256으로 암호화하는 함수
 * Node.js crypto 모듈을 사용할 수 없는 환경과의 호환성을 위해 순수 JavaScript 구현 사용
 * @param data - 전달할 객체
 * @param secretKey - 암호화에 사용할 secret 키
 * @returns { payload: string, signature: string }
 */
export const createSignedRequest = (data: unknown, secretKey: string): { payload: string; signature: string } => {
    try {
        // 1. 객체를 JSON.stringify로 처리
        const payload = JSON.stringify(data);
        
        // 2. payload에 secret 키를 뒤에 붙임
        const payloadWithSecret = payload + secretKey;
        
        // 3. 순수 JavaScript로 구현된 SHA-256으로 암호화
        const signature = sha256(payloadWithSecret);
        
        return { payload, signature };
    } catch (error) {
        console.error('Error creating signed request:', error);
        throw new Error('Failed to create signed request');
    }
};

export const couponsApi = createApi({
  reducerPath: 'couponsApi',
  baseQuery: fetchCompatBaseQuery('coupons'),
  tagTypes: ['Coupon', 'CouponQRCode', 'CouponHistory'],
  endpoints: (builder) => ({
    // 쿠폰 생성
    createCoupon: builder.mutation<CreateCouponResponse, CreateCouponRequest>({
      query: (body) => ({
        url: '/create-coupon',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Coupon'],
    }),

    // 쿠폰 QR 코드 생성
    createCouponQRCode: builder.mutation<CafeCouponQRCode, CreateCouponQRCodeRequest>({
      query: (body) => ({
        url: '/create-coupon-qrcode',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['CouponQRCode'],
    }),

    // 그룹 코드와 사용자 ID로 쿠폰 조회
    findByCouponByGroupCodeWithUserId: builder.mutation<
      CreateCouponResponse[],
      FindByCouponByGroupCodeWithUserIdRequest
    >({
      query: (body) => ({
        url: '/find/group-code/member-id',
        method: 'POST',
        body,
      }),
    }),

    // 쿠폰 사용
    useCoupon: builder.mutation<UseCouponResponse, UseCouponRequest>({
      query: (body) => ({
        url: '/use-coupon/serial-number/actor-id',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Coupon', 'CouponHistory'],
    }),

    // QR 코드 테스트
    testQr: builder.query<string, string>({
      query: (text) => ({
        url: '/test-qr',
        method: 'GET',
        params: { text },
      }),
    }),
  }),
});

// 자동 생성된 훅들 export
export const {
  useCreateCouponMutation,
  useCreateCouponQRCodeMutation,
  useFindByCouponByGroupCodeWithUserIdMutation,
  useUseCouponMutation,
  useTestQrQuery,
} = couponsApi;
