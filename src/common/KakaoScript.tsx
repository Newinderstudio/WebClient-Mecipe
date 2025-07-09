'use client';
import Script from "next/script";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Kakao: any;
  }
}

export default function KakaoScript(props: { version: string, intergrityValue: string }) {

    const { version: VERSION, intergrityValue:INTEGRITY_VALUE } = props;


    const handleKakaoInit = () => {
        if (window.Kakao) {
            if (!window.Kakao.isInitialized()) {
                window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT);
            }
        } else {
            console.error("Kakao SDK not loaded");
        }
    };

    return (
        <Script
            src={`https://t1.kakaocdn.net/kakao_js_sdk/${VERSION}/kakao.min.js`}
            integrity={`${INTEGRITY_VALUE}`}
            crossOrigin="anonymous"
            onLoad={handleKakaoInit}
        />
    );
}