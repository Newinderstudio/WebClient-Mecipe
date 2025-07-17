
import { rootUrl } from './constants/app';
const fetchRedirectUploadImage = async (
    token: string | undefined,
    body: FormData
) => {
    if (!token) console.error('token is undefined');
    let res;
    const headers = {
        Authorization: 'Bearer ' + token,
    };
    try {
        const raw = await fetch(`${rootUrl}/imageupload/direct`, {
            method: 'GET',
            headers
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

        const uploadUrl: ImageUploadDirectResponse = json?.data;
        if (!uploadUrl) throw new Error('uploadUrl is undefined');

        const result = await (await fetch(uploadUrl, {
            method: 'POST',
            body
        })).json();

        return result; 
    } catch (e) {
        console.warn(
            'fetch compat error\n' +
            'request : ' +
            JSON.stringify(
                {
                    path: '/imageupload/direct',
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
};

export default fetchRedirectUploadImage;

export type ImageUploadDirectResponse = string | undefined
export type ImageUploadCheckResponse = {
    id: string,
    metadata: {
        key: string
    },
    uploaded: string,
    requireSignedURLs: boolean,
    variants: string[],
    draft: boolean
}