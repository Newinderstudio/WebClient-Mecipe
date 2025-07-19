'use client'

import UserScreen from "@/common/screen/UserScreen";
import { Suspense } from "react";
import SearchScreen from "./SearchScreen";

function SearchScreenWrapper() {

    return (
        <UserScreen
            headerOverlap={false}
            backSpace={true}
            fullScreen={false}
            navigationList={[{ name: "카페탐색", routerUrl: "/search" }]}
        >
            <Suspense>
                <SearchScreen/>
            </Suspense>
        </UserScreen>

    )
}

export default SearchScreenWrapper;