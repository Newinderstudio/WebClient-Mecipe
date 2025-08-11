import Image from "next/image";
import { useState, useEffect } from "react";

interface ContactUsPopUpProps {
  isOpen: boolean;
  onClose: () => void;
  linkUrl: string;
  scale?: number;
}

export default function ContactUsPopUp({
  isOpen,
  onClose,
  linkUrl,
  scale = 1
}: ContactUsPopUpProps) {
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
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

  useEffect(() => {
    if (isOpen) {
      const img = new window.Image();
      img.onload = () => {
        let finalWidth = img.naturalWidth * scale;
        let finalHeight = img.naturalHeight * scale;
        
        // 모바일에서는 화면 폭에 맞춰 크기 조정
        if (isMobile) {
          const maxWidth = Math.min(window.innerWidth - 40, 400); // 최대 400px, 좌우 20px 여백
          if (finalWidth > maxWidth) {
            const ratio = maxWidth / finalWidth;
            finalWidth = maxWidth;
            finalHeight = finalHeight * ratio;
          }
        }
        
        setImageSize({
          width: finalWidth,
          height: finalHeight
        });
      };
      img.src = "/image/popup/popup-contact-us.png";
    }
  }, [isOpen, scale, isMobile]);

  const handleButtonClick = () => {
    window.open(linkUrl, '_blank');
  };

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
          maxWidth: isMobile ? '100%' : '90%',
          maxHeight: isMobile ? '90vh' : '90vh',
          width: isMobile ? '100%' : 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 팝업 이미지 */}
        <div 
          style={{ 
            position: 'relative', 
            width: '100%',
            cursor: 'pointer'
          }}
          onClick={handleButtonClick}
        >
          <Image
            src="/image/popup/popup-contact-us.png"
            alt="Contact Us"
            width={imageSize.width || 400}
            height={imageSize.height || 300}
            style={{
              display: 'block',
              width: '100%',
              height: 'auto',
              maxWidth: '100%',
            }}
            priority
          />
          
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
        </div>
        
        {/* 서비스 문의하러 가기 버튼 */}
        <div
          style={{
            backgroundColor: '#000000',
            color: 'white',
            padding: isMobile ? '20px 16px' : '16px 24px',
            textAlign: 'center',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: isMobile ? '14px' : '16px',
            transition: 'background-color 0.2s ease',
            wordBreak: 'keep-all',
            lineHeight: '1.4',
            minHeight: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={handleButtonClick}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#333333';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#000000';
          }}
        >
          서비스 문의하러 가기
        </div>
      </div>
    </div>
  );
}