'use client'

/** ImageCard.tsx */
import styled from '@emotion/styled'

interface Props {
    src: string
    alt?: string
    isDisable?: boolean
    onClick?: () => void,
    style?: React.CSSProperties
}

const Wrapper = styled.div`
  position: relative;
  width: 160px;
  height: 160px;
  overflow: hidden;
  border-radius: 8px;
  cursor: pointer;
  :hover > div {
    opacity: 1;
  }
`

const StyledImage = styled.img<{ isDisable?: boolean }>`
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: ${(props) => (props.isDisable ? 'brightness(40%) grayscale(20%)' : 'none')};
  transition: filter 0.3s ease;
  +div{
    opacity: ${(props) => (props.isDisable ? '1' : '0')}
  }
`

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
`

const RemoveIcon = styled.div`
  color: white;
  font-size: 32px;
  font-weight: bold;
  pointer-events: none;
`

export default function ImageUploadCard({ src, alt, isDisable, onClick, style }: Props) {
    return (
        <Wrapper style={style} onClick={onClick}>
            <StyledImage src={src} alt={alt ?? 'image'} isDisable={isDisable} />
            <Overlay>
                <RemoveIcon>✕</RemoveIcon>
            </Overlay>
        </Wrapper>
    )
}