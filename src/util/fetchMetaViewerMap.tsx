export interface UploadMapResult {
    url: string;
    size: number;
}

export default async function fetchMetaViewerMap(
    token: string,
    file: File,
    mapType: 'render' | 'collider',
    prefix: string,
    nickname: string
): Promise<UploadMapResult> {
    const form = new FormData();
    form.append('mapFile', file);

    const queryParams = new URLSearchParams();
    queryParams.append('prefix', prefix);
    queryParams.append('mapType', mapType);
    queryParams.append('nickname', nickname);
    
    const url = `/api/meta-viewer?${queryParams.toString()}`;

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

export const deleteMetaViewerMap = async (token: string, urls: string[]) => {
    if (!token) console.error('token is undefined');
    let res;
    const encodedUrls = urls.map(url => encodeURIComponent(url));
    const path = `/api/remove-meta-viewer?urls=${encodedUrls.join(',')}`;
    try {
      const raw = await fetch(path, {
        method: 'DELETE',
        headers: {
          Authorization: 'Bearer ' + token,
        },
      });
      res = raw;
      const json = await raw.json();
      if (process.env.NODE_ENV === 'development') {
        console.log(
          'fetchCompat status : ' +
          raw.url +
          ' ' +
          raw.status +
          ' ' +
          raw.statusText,
          '\n',
          'response body : ',
          json,
          '\n',
          'request body : ',
        );
      }
  
      return json;
    } catch (e) {
      console.warn(
        'fetch compat error\n' +
        'request : ' +
        JSON.stringify(
          {
            path: path,
            token: token,
          },
          null,
          2,
        ) +
        '\n\n' +
        'url : ' +
        res?.url +
        ' ' +
        res?.status +
        ' ' +
        res?.statusText +
        '\n\n' +
        e,
      );
  
      throw e;
    }
  }
  
  