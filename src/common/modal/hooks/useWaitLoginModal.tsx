import { useEffect, useState } from 'react';
import { useFindExistUserByIdMutation } from '@/api/usersApi';
import * as accountSlice from '@/store/slices/accountSlice';
import { redirectUrl } from '@/util/constants/app';
import createVerifyIdToken from '@/util/createVerifyIdToken';
import { useAppDispatch } from '@/store/hooks';

// interface LoginData {
//     loginId: string;
//     loginPw: string;
// }

interface HookMember {
    onCheckAuthNumber: (code: string) => void;
}

export function useWaitLoginModal(verifyTargetEmail: string | null, verifyKaKaoCode: string | null, onEndVerify: (authCode: string) => void): HookMember {
    const dispatch = useAppDispatch();

    const [authNumber, setAuthNumber] = useState<string>();

    const [findExistUserById] = useFindExistUserByIdMutation();

    useEffect(() => {
        if (verifyTargetEmail !== null) {
            verifyEmail(verifyTargetEmail);
        }
    }, [verifyTargetEmail])

    useEffect(() => {
        if (verifyKaKaoCode !== null) {
            verifyKakaoLogin(verifyKaKaoCode);
        }
    }, [verifyKaKaoCode])

    const verifyEmail = async (to: string) => {
        const number = Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
        // 예: '004532' (문자열 형태, 앞자리 0 포함 가능)
        console.log("number : " + number);
        setAuthNumber(number);

        createVerifyIdToken({
            id: to,
            type:'email'
        });
    }

    const onCheckAuthNumber = (code: string) => {
        if (code === authNumber) {
            console.log('인증 성공 - 회원가입 페이지로 넘어갑니다.')
            onEndVerify(authNumber)
        } else {
            alert('인증번호가 일치하지 않습니다.')
        }
    }

    const verifyKakaoLogin = async (code: string) => {
        if (code) {
            const data:{[k in string]:string | number | boolean} = {
                grant_type: 'authorization_code',
                client_id: process.env.NEXT_PUBLIC_KAKAO ?? "",
                redirect_uri: redirectUrl + "/login",
                // redirect_uri: redirectUrl + '/sigunup',
                code: code,
            };
            //
            const queryString = Object.keys(data)
                .map(
                    (k) => encodeURIComponent(k) + '=' + encodeURIComponent(data[k]),
                )
                .join('&');
            //
            try {
                const res = await fetch(
                    'https://kauth.kakao.com/oauth/token?' + queryString
                    ,
                    {
                        method: 'POST',
                        headers: {
                            'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
                        }
                    }
                )
                
                const data = await res.json();

                addKakaoUser(data.access_token);

            } catch (err) {
                console.log('소셜로그인 에러', err);
                // window.alert('로그인에 실패하였습니다.');
                // router.replace('/signin'); // 로그인 실패하면 로그인화면으로 돌려보냄
            }
        } else {
            // NOTE 카카오 로그인 아닐시
            console.log('dddd');
        }
    }

    const addKakaoUser = async (token: string) => {

        const response = await fetch(
            'https://kauth.kakao.com/v2/user/me'
            ,
            {
                method: 'POST',
                headers: {
                    'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
                    Authorization: 'Bearer ' + token,
                }
            }
        )

        const result = await response.json();

        // TODO 여기서 result.id로 이루어진 아이디가 있다면 로그인 처리 없으면 밑에 처리
        // dispatch(accountSlice.login(loginData));
        const compare = await findExistUserById({
            loginId: result.id,
        });

        if (compare.data) {
            if (compare.data.isExist) {
                dispatch(
                    accountSlice.login({
                        loginId: String(result.id),
                        loginPw: String(result.id),
                        loginType: 'KAKAO',
                    }),
                );
            } else {
                await createVerifyIdToken({
                    id: String(result.id)
                });

                onEndVerify(String(result.id));
            }
        }
    };

    return {
        onCheckAuthNumber
    };
}
