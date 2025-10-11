import { rootUrl } from "./constants/app";

export interface UploadMapResult {
    url: string;
    size: number;
}

export default async function fetchMetaViewerMap(
    token: string,
    file: File,
    mapType: 'render' | 'collider',
    prefix?: string
): Promise<UploadMapResult> {
    const form = new FormData();
    form.append('mapFile', file);

    const queryParams = new URLSearchParams();
    if (prefix) queryParams.append('prefix', prefix);
    queryParams.append('mapType', mapType);

    const url = `${rootUrl}/api/meta-viewer?${queryParams.toString()}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: form,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
    }

    return await response.json();
}

