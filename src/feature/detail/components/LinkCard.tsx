"use client"

import ThubmnailImage from "@/common/image/ThumbnailImage";
import { FlexCenter } from "@/common/styledComponents";
import { fenxyYellow } from "@/util/constants/style";
import styled from "@emotion/styled";
import Link from "next/link";


interface Props {
    link: string;
    name: string;
    src: string;
    isAvaliable: boolean;
}

const LinkButton = styled(Link)({
    backgroundColor: fenxyYellow,
    fontSize: '2rem',
    fontWeight: 600,
    color: 'white',
    display: 'inline-block',
    borderRadius: '5rem',
    padding: '.8rem 2rem',
    boxShadow: '0 0 5px 2px #0004',
    '&.disable-lnk': {
        opacity: 0.5,
        cursor: 'default'
    }
});

const DisableLinkbutton = styled.div({
    backgroundColor: fenxyYellow,
    fontSize: '2rem',
    fontWeight: 600,
    color: 'white',
    display: 'inline-block',
    borderRadius: '5rem',
    padding: '.8rem 2rem',
    boxShadow: '0 0 5px 2px #0004',
    opacity: 0.5,
    cursor: 'default'
})

const LinkCard = (props: Props) => {

    return (
        <FlexCenter

        >
            <FlexCenter
                style={{
                    width: '16rem',
                    height: '16rem',
                    borderRadius: '3rem',
                    marginBottom: '1rem',
                    overflow: 'hidden',
                    position: 'relative'
                }}
            >
                <ThubmnailImage
                    aspectWidth={100}
                    aspectHeight={100}
                    src={props.src}
                />
                {
                    props.isAvaliable === false &&
                    <div
                        style={{
                            backgroundColor: '#0006',
                            position: 'absolute',
                            fontSize: '1.2rem',
                            color: 'white',
                            width:'100%',
                            height:'100%',
                            textAlign:'center',
                            alignContent:'center'
                        }}
                    >
                        준비중입니다
                    </div>
                }
            </FlexCenter>
            {
                props.isAvaliable ?
                    <LinkButton
                        href={props.link}
                        target="_blank"
                    >
                        {props.name}
                    </LinkButton> :
                    <DisableLinkbutton>
                        {props.name}
                    </DisableLinkbutton>
            }


        </FlexCenter>
    )
}

export default LinkCard;