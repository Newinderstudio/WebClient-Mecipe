import React, { useEffect, useState } from 'react'
import styled from '@emotion/styled'

const ImageContainer = styled.div`
  top: 0; left: 0;
  width: 120vw;
  height: 120vh;
  overflow: hidden;
  z-index: -1;
  position: absolute;
  margin: -10vw
`;

const CoverImage = styled.img`
    position: absolute;
    top: 0; left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: blur(4px);
    
    &.cross {
        opacity: 0;
        z-index: 2;
    }

    &.cross.visible {
        opacity: 1;
        transition: opacity 2s ease-in-out;

    }
`;
export default function FullscreenImageRotator({ imgList }: { imgList: string[]}) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [nextIndex, setNextIndex] = useState(1)
    const [isFading, setIsFading] = useState(false)

    useEffect(() => {
        const interval = setInterval(() => {
            setIsFading(true)
            setTimeout(() => {
                setCurrentIndex(nextIndex)
                setNextIndex((nextIndex + 1) % imgList.length)
                setIsFading(false)
            }, 2000) // 페이드 지속 시간
        }, 10000)

        return () => clearInterval(interval)
    }, [imgList.length, nextIndex])

    return (
        <ImageContainer>
            <CoverImage
                src={imgList[currentIndex]}
                className="cover-image"
                alt="current"
            />
            <CoverImage
                src={imgList[nextIndex]}
                className={`cross ${isFading ? 'visible' : ''}`}
                alt="next"
            />
        </ImageContainer>
    )

}