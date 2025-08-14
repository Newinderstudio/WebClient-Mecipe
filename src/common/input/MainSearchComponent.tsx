"use client"

import { FlexCenter, FlexRow } from "@/common/styledComponents";
import styled from "@emotion/styled";
import { useEffect, useState } from "react";
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
    unit?: string,
    backgroundColor: string,
    borderColor: string,
    full?: boolean
    style?: React.CSSProperties,
    fontColor?: string,
    iconBlack?: boolean,
    initialSearchText?: string,
    fontWeight?: string | number,
    initSearchText?: string
}

function MainSearchComponent(props: Props) {

    const [searchText, setSearchText] = useState(props.initialSearchText ?? '');

    const onChangeSearchText = (text: string) => {
        setSearchText(text);
    }

    useEffect(() => {
        setSearchText(props.initSearchText ?? '');
    }, [props.initSearchText]);

    const onClickSearch = () => {
        //
        const trim = searchText.trim();
        setSearchText(trim);
        props.onSearchAction(trim);
    }

    let height: number | string = props.height;
    let borderRadius: number | string = props.height * 0.5;
    let fontSize: number | string = props.height * 0.4;
    let iconSize: number | string = props.height * 0.44;
    let paddingHori: number | string = props.height * 0.3;
    let paddingVert: number | string = props.height * 0.13;
    let borderWidth: number | string = props.height * 0.04;

    if (props.unit) {
        height = height + props.unit;
        borderRadius = borderRadius + props.unit;
        fontSize = fontSize + props.unit;
        iconSize = iconSize + props.unit;
        paddingHori = paddingHori + props.unit;
        paddingVert = paddingVert + props.unit;
        borderWidth = borderWidth + props.unit;
    } else {
        borderRadius = borderRadius + 'px';
        borderWidth = borderWidth + 'px';
        paddingHori = paddingHori + 'px';
        paddingVert = paddingVert + 'px';
    }

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
                height: height,
                alignItems: 'center',
                backgroundColor: props.backgroundColor,//'#0005',
                border: `${borderWidth} solid ${props.borderColor}`,
                padding: `${paddingVert} ${paddingHori}`,
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
                    fontWeight: props.fontWeight
                }}
                value={searchText}
                onChange={(e) => onChangeSearchText(e.target.value)}
                onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                        onClickSearch();
                    }
                }}
            />
            <span
                style={{
                    position: 'relative',
                    width: iconSize,
                    height: iconSize,
                }}
            >
                <Image
                    src={`/image/icon/searchIcon${props.iconBlack === true ? '-black' : ''}.svg`}
                    alt="srarch"
                    fill
                    style={{
                        cursor: 'pointer',
                    }}

                    onClick={onClickSearch}
                />
            </span>


        </FlexRow>
    </FlexCenter>
}

export default MainSearchComponent;