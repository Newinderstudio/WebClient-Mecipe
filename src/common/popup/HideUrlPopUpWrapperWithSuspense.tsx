import React, { Suspense } from "react";
import HideUrlPopUpWrapper from "./HideUrlPopUpWrapper";

export default function HideUrlPopUpWrapperWithSuspense({ queryName }: { queryName: string }) {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <HideUrlPopUpWrapper queryName={queryName} />
        </Suspense>
    )
}
    