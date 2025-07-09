import { rootUrl } from "./constants/app";

const createVerifyIdToken =
    (data: {
        id: string;
        type?:string
    }) => {
        return fetch(rootUrl + `/auth/certification/${data.id}${data.type? `?type=${data.type}`:''}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
    };

export default createVerifyIdToken;