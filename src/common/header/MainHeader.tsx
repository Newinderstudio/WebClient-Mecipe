'use client'

import { headerHeight } from "@/util/constants/style";
import Header from "./Header";
import { useMainHeader } from "./hooks/useMainHeader";
import Image from 'next/image';
import styled from "@emotion/styled";
import React from "react";

export interface NavigationSimpleData { name: string, routerUrl?: string }

interface Props {
    backSpace?: boolean;
    isOverlap?: boolean;
    navigationList?: NavigationSimpleData[]
}

const BackSpace = (
    { onClickHistoryBack }: {
        onClickHistoryBack: () => void
    }
) => (<div
    onClick={onClickHistoryBack}
    style={{
        transform: 'rotate(-180deg)',
        height: 32,
        width: 32,
        position: 'relative',
        cursor: 'pointer',
    }}>
    <Image
        src="/image/icon/arrow-right-white-tail.svg"
        layout="fill"
        alt="arrow"
    />
</div>)

const NavigationButton = (props: { children: React.ReactNode, onClick:()=>void }) => {
    const Button = styled.button({
        color: 'white',
        fontSize: 20,
        fontWeight: 600,
        backgroundColor: 'transparent'
    });

    return <Button
        onClick={props.onClick}
    >
        {props.children}
    </Button>
}

const MainHeader = (props: Props) => {
    const hookMember = useMainHeader();

    let overlapHeaderStyle = {};
    let overlapStyle = {};

    if (props.isOverlap === true) {
        overlapHeaderStyle = { backgroundColor: '#0e0e0eaa' };
    } else {
        overlapStyle = { height: headerHeight };
        overlapHeaderStyle = { backgroundColor: '#0e0e0e' };
    }

    return <Header
        LeftComponent={
            props.backSpace === true ? <BackSpace onClickHistoryBack={hookMember.onClickHistoryBack} /> : undefined
        }
        CenterComponent={
            <>
                {
                    props.navigationList?.map((item, index) => (
                        <NavigationButton
                            key={index}
                            onClick={() => item.routerUrl? hookMember.onClickNavigation(item.routerUrl): undefined}
                        >
                            {item.name}
                        </NavigationButton>
                    )) ?? undefined
                }
            </>

        }

        style={{ ...overlapStyle }}
        headerStyle={{ ...overlapHeaderStyle }}
    />
}

export default MainHeader;