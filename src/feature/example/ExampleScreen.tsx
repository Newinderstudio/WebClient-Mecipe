"use client"

import { Flex, FlexRow } from "@/common/styledComponents";
import { use } from "react";

type SearchParams = Promise<{ test: string, code: string }>;

function ExampleScreen({ searchParams }: { searchParams: SearchParams }) {

  const { code, test } = use(searchParams);

  return (
    <Flex>
      <h1>
        테스트 페이지입니다.
      </h1>
      <Flex>
        <FlexRow>
          <p>코드: </p>
          <div>{code}</div>
        </FlexRow>
        <FlexRow>
          <p>테스트: </p>
          <div>{test}</div>
        </FlexRow>
      </Flex>
    </Flex>
  );
};

export default ExampleScreen;