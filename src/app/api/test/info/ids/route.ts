import { CafeInfo } from "@/data/prisma-client";
import { redirectUrl } from "@/util/constants/app";
import { NextResponse } from "next/server";


export async function GET() {
    try {
        const response = await fetch(redirectUrl+"/api/test/info");
        const data: number[] = (await response.json() as CafeInfo[]).map((cafe) => cafe.id).filter((id) => id !== undefined);


        return NextResponse.json(data)
    } catch (e) {
        console.error(e)
    }
}