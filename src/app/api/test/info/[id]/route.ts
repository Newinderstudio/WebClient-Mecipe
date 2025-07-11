import { CafeInfo } from "@/data/prisma-client";
import { redirectUrl } from "@/util/constants/app";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const id = (await params).id;

    console.log(id);

    try {
        const response = await fetch(redirectUrl + "/api/test/info");
        const data: CafeInfo | undefined = (await response.json() as CafeInfo[]).find((cafe) => cafe.id === Number(id));

        if (data === undefined) {
            return NextResponse.json({ error: `not found (${id})` }, { status: 500 })
        }

        console.log(data)


        return NextResponse.json(data)
    } catch (e) {
        console.error(e)
    }
}