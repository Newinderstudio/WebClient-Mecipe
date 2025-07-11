import styled from "@emotion/styled"

const ThumbnailBox = styled.div`
  width: 100%;
  aspect-ratio: 16 / 9;
  position: relative;
  overflow: hidden;
`

const ThumbnailContent = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;      // ✅ 이미지 잘라도 비율 유지
  object-position: center;
`

interface Props {
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