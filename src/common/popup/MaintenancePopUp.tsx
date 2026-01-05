import Image from "next/image";
import { useState, useEffect } from "react";

interface MaintenancePopUpProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MaintenancePopUp({
  isOpen,
  onClose,
}: MaintenancePopUpProps) {
  const [isMobile, setIsMobile] = useState(false);

  // 화면 크기 변화 감지
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: '20px',
        boxSizing: 'border-box',
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: 'relative',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden',
          cursor: 'default',
          maxWidth: isMobile ? '90%' : '400px',
          width: isMobile ? '100%' : 'auto',
          padding: isMobile ? '32px 24px' : '40px 32px',
          boxSizing: 'border-box',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 닫기 버튼 */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            width: '32px',
            height: '32px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            transition: 'all 0.2s ease',
            zIndex: 10,
          }}
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <Image
            src="/image/icon/cancel-black.svg"
            alt="닫기"
            width={16}
            height={16}
            style={{
              display: 'block',
            }}
          />
        </div>

        {/* 메시지 영역 */}
        <div
          style={{
            textAlign: 'center',
            paddingTop: '8px',
          }}
        >
          <div
            style={{
              fontSize: isMobile ? '20px' : '24px',
              fontWeight: '700',
              color: '#000000',
              marginBottom: '16px',
              lineHeight: '1.4',
              wordBreak: 'keep-all',
            }}
          >
            현재 서비스 공사 중
          </div>
          <div
            style={{
              fontSize: isMobile ? '14px' : '16px',
              fontWeight: '400',
              color: '#666666',
              lineHeight: '1.5',
              wordBreak: 'keep-all',
            }}
          >
            서비스 개선을 위해 공사 중입니다.
            <br />
            빠른 시일 내에 정상 운영될 예정입니다.
          </div>
        </div>

        {/* 확인 버튼 */}
        <div
          style={{
            marginTop: '32px',
            backgroundColor: '#000000',
            color: 'white',
            padding: isMobile ? '14px 16px' : '16px 24px',
            textAlign: 'center',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: isMobile ? '14px' : '16px',
            borderRadius: '8px',
            transition: 'background-color 0.2s ease',
            wordBreak: 'keep-all',
            lineHeight: '1.4',
            minHeight: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={onClose}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#333333';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#000000';
          }}
        >
          확인
        </div>
      </div>
    </div>
  );
}

