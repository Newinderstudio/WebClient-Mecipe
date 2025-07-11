'use client'

import MainSearchComponent from "@/common/input/MainSearchComponent";
import SearchCategoryNavigator from "@/common/input/SearchCategoryNavigator";
import UserScreen from "@/common/screen/UserScreen";
import { FlexCenter, ResponsiveWrapper } from "@/common/styledComponents";
import { useSearchScreen } from "./hooks/useSearchScreen";
import styled from "@emotion/styled";
import InfoCard from "./components/InfoCard";

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
    const hookMember = useSearchScreen();


    return (
        <UserScreen
            headerOverlap={false}
            backSpace={true}
            fullScreen={false}
            navigationList={[{ name: "카페탐색", routerUrl: "/search" }]}
        >
            <FlexCenter>
                <ResponsiveWrapper
                    style={{ marginTop: 24 }}
                >
                    <SearchCategoryNavigator
                        onSearchAction={hookMember.onChangeCategory}
                        categoryTree={hookMember.categoryTree}
                    />
                    <MainSearchComponent
                        onSearchAction={hookMember.onSetSearchText}
                        height={32}
                        maxWidth={240}
                        backgroundColor="transparent"
                        borderColor="#005"
                        iconBlack={true}
                        fontColor="#222"
                    />
                </ResponsiveWrapper>
            </FlexCenter>
            <ResponsiveGrid
                style = {{
                    marginTop:24,
                    marginBottom: 80
                }}
            >
                {
                    hookMember.cafeInfos?.map((item, index) => {
                        return <InfoCard
                            key={index}
                            data={item}
                            onClick = {()=>{if(item.id !== undefined) hookMember.onClickDetail(item.id)}}
                        />
                    }) ?? undefined
                }
            </ResponsiveGrid>
        </UserScreen>
    )
}

export default SearchScreen;