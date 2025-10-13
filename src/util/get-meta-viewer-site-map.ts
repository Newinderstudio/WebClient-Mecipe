import fetchCompat from "@/util/fetchCompat";

export async function getMetaViewerSiteMap() {
    const apiKey = process.env.BUILD_API_KEY;
    if(!apiKey) {
        throw new Error('API key is not set');
    }

    const enabledCodes = await fetchCompat<{code: string}[]>(
        'GET',
        `meta-viewer-infos/ssg/codes`,
        undefined,
        undefined,
        {
            'x-api-key': apiKey,
        }
    )

    return enabledCodes;
}   