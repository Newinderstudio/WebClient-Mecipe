"use client"

import styled from "@emotion/styled"
import Image, { ImageProps } from "next/image"

const ThumbnailBox = styled.div`
  width: 100%;
  aspect-ratio: 16 / 9;
  position: relative;
  overflow: hidden;
`

const ThumbnailContent = (props: ImageProps) => <Image {...props}
    src={props.src}
    alt={props.alt}
    objectFit="cover"
    layout="fill"
    style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition: 'center',
    }}

/>

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    aspectWidth: number
    aspectHeight:number
    src:string
}

const ThubmnailImage = (props: Props) => {
    
    const aspectRatio = `${props.aspectWidth}/${props.aspectHeight}`;

    return (
        <ThumbnailBox
            style={{
                position: 'relative',
                width: '100%',
                aspectRatio: aspectRatio,
                overflow: 'hidden',
                ...props.style
            }}
        >
            <ThumbnailContent
                src={props.src}
                width={props.aspectWidth}
                height={props.aspectHeight}
                style={{
                    position: 'relative',
                    objectFit: 'cover',
                    width: '100%',
                    aspectRatio: aspectRatio,
                    overflow: 'hidden'
                }}
                alt="thumbnail"
            />
        </ThumbnailBox>
    )
}

export default ThubmnailImage;