import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function GET(request: Request): Promise<NextResponse> {

    const { searchParams } = new URL(request.url);

    const path = searchParams.get('path');

    if (!path) {
        return NextResponse.json({ error: 'Path is required' }, { status: 400 });
    }

    await revalidatePath(path);

    return NextResponse.json({ message: 'Page revalidated' }, { status: 200 });
}