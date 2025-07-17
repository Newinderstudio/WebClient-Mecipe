import { rootUrl } from "./constants/app";

const fetchImage = async (
  token: string | undefined,
  body: FormData,
): Promise<{
  url: string;
  thumbnailUrl?: string;
}[]> => {
  if (!token) console.error('token is undefined');
  const bodyPayload =
    body instanceof FormData
      ? body
      : typeof body === 'string'
        ? body
        : JSON.stringify(body);

  let res;
  const path = `${rootUrl}/rawimageupload/upload`;
  try {
    const raw = await fetch(`${rootUrl}/rawimageupload/upload`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token,
      },
      body: bodyPayload,
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
        body,
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
          body: body,
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
};

export default fetchImage;

export const getImageSize = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

export const getFileSize = (file: File) => {
  return Math.floor(file.size / 1024);
}