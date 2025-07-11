'use client'

import ThubmnailImage from "@/common/image/ThumbnailImage";
import { FlexRow } from "@/common/styledComponents";
import { CafeInfo } from "@/data/prisma-client";
import styled from "@emotion/styled";

export const CardWrapper = styled.button`
  border-radius: 20px;
  overflow: hidden;
  background-color: #fff;
  box-shadow: 0 0 12px #000b;
  display: flex;
  flex-direction: column;
  transition: box-shadow 0.2s ease-in-out;
  cursor: pointer;
  padding:0;

  &:hover {
    box-shadow: 0 4px 12px #000d;
  }
`

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    data: CafeInfo
}

const InfoCard = (props: Props) => {

    return <CardWrapper
        onClick={props.onClick}
        style={props.style}
    >
        <ThubmnailImage
            aspectWidth={160}
            aspectHeight={90}
            src="https://cdn.imweb.me/upload/S2024101325b121e1a5b5b/22360f5d72cf1.png"
        />
        <FlexRow
            style={{
                flexGrow: 1,
                justifyContent: 'space-between',
                padding: '16px 24px',
                alignItems: 'start'
            }}
        >
            <FlexRow
                style={{
                    fontSize: '1.4rem',
                    minWidth: 100,
                    maxWidth: '40%',
                    textAlign: 'left'
                }}
            >
                <span>
                    {props.data.address}
                </span>
            </FlexRow>
            <div
                style={{
                    fontSize: '2rem',
                    fontWeight: 600,
                    marginLeft: 24,
                    lineHeight: 1.2,
                    textAlign: 'left'
                }}
            >
                {props.data.name}
            </div>
        </FlexRow>
    </CardWrapper >
}

export default InfoCard;