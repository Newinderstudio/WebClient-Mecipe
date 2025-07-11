"use client"

import ThubmnailImage from "@/common/image/ThumbnailImage";
import { FlexCenter } from "@/common/styledComponents";
import { fenxyYellow } from "@/util/constants/style";
import styled from "@emotion/styled";
import { useRouter } from "next/navigation";


interface Props {
    link: string;
    name: string;
    src: string;
}

const LinkButton = styled.button({
    backgroundColor: fenxyYellow,
    fontSize: '2rem',
    fontWeight: 600,
    color: 'white',
    display: 'inline-block',
    borderRadius: '5rem',
    padding: '.8rem 2rem',
    boxShadow: '0 0 5px 2px #0004'
})

const LinkCard = (props: Props) => {
    const router = useRouter();

    return (
        <FlexCenter

        >
            <FlexCenter
                style={{
                    width: '16rem',
                    height: '16rem',
                    borderRadius: '3rem',
                    marginBottom:'1rem',
                    overflow:'hidden'
                }}
            >
                <ThubmnailImage
                    aspectWidth={100}
                    aspectHeight={100}
                    src={props.src}
                />
            </FlexCenter>
            <LinkButton
                onClick={() => router.push(props.link)}
            >
                {props.name}
            </LinkButton>


        </FlexCenter>
    )
}

export default LinkCard;