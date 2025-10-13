import { rootUrl } from "./constants/app";

async function fetchCompat<T = unknown>(
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  path: string,
  token: string | undefined,
  body?: string | Record<string, unknown> | FormData,
  additionalHeaders?: Record<string, string>,
  local_api?: boolean
): Promise<T> {
  if (!token) console.error('token is undefined');
  const bodyPayload =
    body instanceof FormData
      ? body
      : typeof body === 'string'
        ? body
        : JSON.stringify(body);

  let res;
  try {
    let headers: Record<string, string> = token
      ? bodyPayload instanceof FormData
        ? { Authorization: 'Bearer ' + token }
        : {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        }
      : {
        'Content-Type': 'application/json',
      }

    if (additionalHeaders) {
      headers = { ...headers, ...additionalHeaders };
    }

    const raw = await fetch(`${(local_api === true ? "/api" : rootUrl)}/${path}`, {
      method: method,
      headers,
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
}

export default fetchCompat;
