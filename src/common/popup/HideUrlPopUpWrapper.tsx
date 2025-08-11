'use client'

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import ContactUsPopUp from "./ContactUsPopUp";

export default function HideUrlPopUpWrapper({ queryName }: { queryName: string }) {

    const searchParams = useSearchParams();
    const checkPopUpCondition = searchParams.get(queryName) ? true : false;

    const [popUpOn, setPopUpOn] = useState<boolean>(false);

    const onPopUpClose = () => {
        setPopUpOn(false);
    };

    useEffect(() => {
        setPopUpOn(checkPopUpCondition);
    }, [checkPopUpCondition]);

    return (
        <>
            {popUpOn && (

                <ContactUsPopUp
                    isOpen={popUpOn}
                    onClose={onPopUpClose}
                    linkUrl="https://newinderstudio.com/contect"
                    scale={0.5}
                />
            )}
        </>
    )
}