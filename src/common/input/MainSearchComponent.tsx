"use client"

import { FlexCenter, FlexRow } from "@/common/styledComponents";
import styled from "@emotion/styled";
import { useState } from "react";
import Image from "next/image";

const SearchInput = styled.input`
  display: flex;
  font-size: 16px;
  line-height: 2rem;
  border: 0;
  outline: none;
  padding: 0;
  color: #333;
  background: transparent;
  &:disabled {
    color: #999;
  }
  &::-webkit-input-placeholder {
    color: #999;
  }
  &::-ms-input-placeholder {
    color: #999;
  }
  &:focus {
    color: white;
  }
`;

interface Props {
    onSearchAction: (text: string) => void;
    height: number,
    maxWidth: number,
    backgroundColor: string,
    borderColor: string,
    full?: boolean
    style?: React.CSSProperties,
    fontColor?: string,
    iconBlack?: boolean
}

function MainSearchComponent(props: Props) {

    const [searchText, setSearchText] = useState('');

    const onChangeSearchText = (text: string) => {
        setSearchText(text);
    }

    const onClickSearch = () => {
        //
        const trim = searchText.trim();
        setSearchText(trim);
        props.onSearchAction(trim);
    }

    const borderRadius = props.height * 0.5;
    const fontSize = Math.floor(props.height * 0.4);
    const iconSize = Math.floor(props.height * 0.44);
    const paddingHori = Math.floor(props.height * 0.3);
    const paddingVert = Math.floor(props.height * 0.13);
    const borderWidth = Math.floor(props.height * 0.04);

    return <FlexCenter
        style={{
            width: props.full === true ? '100%' : undefined,
            position: 'relative',
            display: props.full === true ? 'flex' : 'inline-block',
            ...props.style
        }}
    >
        <FlexRow
            style={{
                height: props.height,
                alignItems: 'center',
                borderBottom: '1px solid #eee',
                backgroundColor: props.backgroundColor,//'#0005',
                border: `${borderWidth}px solid`,
                borderColor: props.borderColor,//fenxyYellowTransparency,
                padding: `${paddingVert}px ${paddingHori}px`,
                maxWidth: props.maxWidth,
                width: '100%',
                justifyContent: 'space-between',
                borderRadius: borderRadius,
            }}>
            <SearchInput
                type="text"
                placeholder="검색어를 입력해주세요."
                style={{
                    color: props.fontColor,
                    fontSize: fontSize,
                }}
                value={searchText}
                onChange={(e) => onChangeSearchText(e.target.value)}
                onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                        onClickSearch();
                    }
                }}
            />
            <Image
                src={`/image/icon/searchIcon${props.iconBlack === true ? '-black' : ''}.svg`}
                alt="srarch"
                width={iconSize}
                height={iconSize}

                style={{
                    position: 'relative',
                    cursor: 'pointer',
                }}

                onClick={onClickSearch}
            />

        </FlexRow>
    </FlexCenter>
}

export default MainSearchComponent;