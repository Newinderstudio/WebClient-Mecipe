import { NextResponse } from "next/server";
import fetchCompat from "@/util/fetchCompat";
import { del } from "@vercel/blob";

export async function DELETE(request: Request): Promise<NextResponse> {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    const auth = await fetchCompat('GET', 'auth/me', token);

    if (auth?.authToken !== true) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const rawUrls = searchParams.get('urls'); // urls = http://a,https://b,..

    if (!rawUrls) return NextResponse.json({ error: 'urls is required' }, { status: 400 });

    const removeUrls = rawUrls.split(',');

    const deletePromises = removeUrls.map(async (url: string) => {
        const decodedUrl = decodeURIComponent(url);
        try {
            await del(decodedUrl);
        } catch (error: unknown) {
            console.error('Failed to delete file:', url, error);
            throw error;
        }
    });

    await Promise.all(deletePromises);

    return NextResponse.json({ message: 'Image removed successfully' }, { status: 200 });
}