'use client'

import MainSearchComponent from "@/common/input/MainSearchComponent";
import SearchCategoryNavigator from "@/common/input/SearchCategoryNavigator";
import { FlexCenter, FlexRow, ResponsiveWrapper } from "@/common/styledComponents";
import { useSearchScreen } from "./hooks/useSearchScreen";
import styled from "@emotion/styled";
import InfoCard from "./components/InfoCard";
import { useSearchParams } from "next/navigation";

const ResponsiveGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 20px;
  font-size: 16px;

  @media (min-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
    font-size: 24px;
  }

  @media (min-width: 1280px) {
    grid-template-columns: repeat(3, 1fr);
    font-size: 36px;
  }
`


function SearchScreen() {

    const searchParams = useSearchParams();

    const searchTextQuery = searchParams.get('searchText') ?? '';
    const regionCategoryIdQuery = Number(searchParams.get('regionCategoryId'));

    const hookMember = useSearchScreen({ searchTextQuery, regionCategoryIdQuery });


    return (
        <>
            <FlexCenter>
                <ResponsiveWrapper
                    style={{ marginTop: 24 }}
                >
                    <FlexRow>
                        <SearchCategoryNavigator
                            onSearchAction={hookMember.onChangeCategory}
                        />
                        <div
                            style={{
                                marginLeft: 20,
                                fontSize: '1.2rem',
                                padding: '0 1rem',
                                backgroundColor: '#ddd',
                                borderRadius: 20,
                                alignContent: 'center',
                            }}
                        >
                            <span

                            >
                                검색결과:&nbsp;{hookMember.searchCount}
                            </span>
                        </div>

                    </FlexRow>

                    <MainSearchComponent
                        onSearchAction={hookMember.onSetSearchText}
                        height={32}
                        maxWidth={240}
                        backgroundColor="transparent"
                        borderColor="#005"
                        iconBlack={true}
                        fontColor="#222"
                        initialSearchText={searchTextQuery}
                    />
                </ResponsiveWrapper>
            </FlexCenter>
            <ResponsiveGrid
                style={{
                    marginTop: 24,
                    marginBottom: 80
                }}
            >
                {
                    hookMember.cafeInfos?.map((item, index) => {
                        return <InfoCard
                            key={index}
                            data={item}
                            shortRegionAddress={hookMember.getShortRegionCategoryNameById(item.regionCategoryId)}
                            onClick={() => { if (item.id !== undefined) hookMember.onClickDetail(item.id) }}
                        />
                    }) ?? undefined
                }
            </ResponsiveGrid>
        </>
    )
}

export default SearchScreen;