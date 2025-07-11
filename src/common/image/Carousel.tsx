'use client'

import styled from '@emotion/styled'
import { HTMLAttributes, useEffect, useRef, useState } from 'react'

interface Props extends HTMLAttributes<HTMLDivElement> {
  images?: string[]
  interval?: number // 자동 전환 시간 (ms)
  aspectWidth?:number,
  aspectHeight?:number
}

const Wrapper = styled.div`
  width: 100%;
  aspect-ratio: 16 / 9;
  position: relative;
  overflow: hidden;
`

const Track = styled.div<{ offset: number; transition: boolean }>`
  display: flex;
  width: 100%;
  height: 100%;
  transform: translateX(${(props) => -props.offset * 100}%);
  transition: ${(props) => (props.transition ? 'transform 0.5s ease-in-out' : 'none')};
`

const Slide = styled.img`
  flex: 0 0 100%;
  object-fit: cover;
  width: 100%;
  height: 100%;
`

// 👆 기존 코드 import 생략

const DotWrapper = styled.div`
  position: absolute;
  bottom: 1.2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 1.2rem;
`

const Dot = styled.button<{ active: boolean }>`
  width: 1.2rem;
  height: 1.2rem;
  border-radius: 50%;
  border: none;
  background-color: ${(props) => (props.active ? '#fff' : 'rgba(255,255,255,0.4)')};
  cursor: pointer;
  transition: background-color 0.3s ease;
`

export default function Carousel({ images = [], interval = 3000 , aspectWidth=16, aspectHeight=9, style }: Props) {
  const [index, setIndex] = useState(1)
  const [isTransitioning, setIsTransitioning] = useState(true)
  const trackRef = useRef<HTMLDivElement>(null)

  const imageList = [images[images.length - 1], ...images, images[0]] // 앞뒤 복제
  const realIndex = (index - 1 + images.length) % images.length // 실제 보여지는 이미지 인덱스

  // ⏱ 자동 전환
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => prev + 1)
      setIsTransitioning(true)
    }, interval)
    return () => clearInterval(timer)
  }, [interval])

  // 🔄 무한 루프 처리
  useEffect(() => {
    if (index === imageList.length - 1) {
      setTimeout(() => {
        setIsTransitioning(false)
        setIndex(1)
      }, 500)
    }
    if (index === 0) {
      setTimeout(() => {
        setIsTransitioning(false)
        setIndex(imageList.length - 2)
      }, 500)
    }
  }, [imageList.length, index])

  const jumpTo = (target: number) => {
    setIndex(target + 1)
    setIsTransitioning(true)
  }

  return (
    <Wrapper
        style={{
            aspectRatio:`${aspectWidth}/${aspectHeight}`,
            ...style
        }}
    >

      <Track ref={trackRef} offset={index} transition={isTransitioning}>
        {imageList.map((src, i) => (
          <Slide key={i} src={src} alt={`slide-${i}`} />
        ))}
      </Track>

      <DotWrapper>
        {images.map((_, i) => (
          <Dot
            key={i}
            active={i === realIndex}
            onClick={() => jumpTo(i)}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </DotWrapper>
    </Wrapper>
  )
}