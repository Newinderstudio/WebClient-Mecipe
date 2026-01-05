'use client'

import { useState } from "react";
import MaintenancePopUp from "./MaintenancePopUp";

export default function MaintenacePopUpWrapper() {

    const [isOpen, setIsOpen] = useState(true);
    return (
        <>
            <MaintenancePopUp
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
            />

        </>
    )
}