'use client'

import { headerHeight } from "@/util/constants/style";
import Header from "./Header";
import { useMainHeader } from "./hooks/useMainHeader";
import Image from 'next/image';

interface Props {
    backSpace?: boolean;
    isOverlap?: boolean;
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
            <div style={{ color: 'white', fontSize: 16, fontWeight: 500 }}>
                카페 탐색
            </div>
        }

        style={{ ...overlapStyle }}
        headerStyle={{ ...overlapHeaderStyle }}
    />
}

export default MainHeader;