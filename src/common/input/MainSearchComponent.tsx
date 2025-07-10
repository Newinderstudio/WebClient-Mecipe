"use client"

import { FlexCenter, FlexRow } from "@/common/styledComponents";
import { fenxyYellowTransparency } from "@/util/constants/style";
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
}

function MainSearchComponent(props: Props) {

    const [searchText, setSearchText] = useState('');

    const onChangeSearchText = (text: string) => {
        setSearchText(text);
    }

    const onClickSearch = () => {
        //
        props.onSearchAction(searchText);
    }

    return <FlexCenter
    style = {{
        width:'100%',
        padding:'0 20px',
        position: 'relative'
    }}
    >
        <FlexRow
            style={{
                height: 72,
                alignItems: 'center',
                borderBottom: '1px solid #eee',
                backgroundColor: '#0005',
                border: '3px solid',
                borderColor: fenxyYellowTransparency,
                padding: '10px 24px',
                maxWidth: 800,
                width: '100%',
                justifyContent: 'space-between',
                borderRadius: 40,
            }}>
            <SearchInput
                type="text"
                placeholder="검색어를 입력해주세요."
                style={{
                    fontSize: 28,
                }}
                value={searchText}
                onChange={(e) => onChangeSearchText(e.target.value)}
            />
            <Image
                src="/image/icon/searchIcon.svg"
                alt="srarch"
                width={32}
                height={32}

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