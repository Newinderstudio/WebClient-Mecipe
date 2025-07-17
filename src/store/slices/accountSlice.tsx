import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LoginType, User, UserType } from '@/data/prisma-client';
import { AppThunk } from '@/store';
import { rootUrl } from '@/util/constants/app';
import { MakePrimitiveRequiredWithObject } from '@/util/types';

// NOTE slice는 !!앱 공유데이터!! 가 있을때만 사용한다

interface State {
  user?: UserResult | undefined;
  accessToken?: string | undefined;
}

export type AccountState = Required<State>;

const initialState = {} as State;

// NOTE: 항상 slice 이름은 slice{Name}으로 한다
const accountSlice = createSlice({
  // NOTE: name 속성은 slice만 뺀 명사로 한다
  name: 'account',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<UserResult | undefined>) {
      state.user = action.payload;
    },
    setToken(state, action: PayloadAction<string | undefined>) {
      state.accessToken = action.payload;
    },
  },
});
export default accountSlice.reducer;

export const { setUser, setToken } = accountSlice.actions;

// TODO signin, login 로직 thunk로 작성하기
export const signin = (): AppThunk => () => {
  return;
};

export const saveUserDataInSession =
  (userData: { user: UserResult; accessToken: string }): AppThunk =>
    async (dispatch) => {
      dispatch(setToken(userData.accessToken));
      dispatch(setUser(userData.user));
      return;
    };

export const login =
  (loginData: {
    loginId: string;
    loginPw: string;
    loginType: LoginType;
  }): AppThunk =>
    (dispatch) => {
      return fetch(rootUrl + '/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      })
        .then((res) => res.json())
        .then((resJson) => {
          if (resJson.message) {
            alert(resJson.message);
            return;
          }
          if (resJson.user.loginType === 'ADMIN') {
            dispatch(setToken(resJson.accessToken));
            dispatch(setUser(resJson.user));
            sessionStorage.setItem('userData', JSON.stringify(resJson));
            return;
          }
          dispatch(setToken(resJson.accessToken));
          dispatch(setUser(resJson.user));
          sessionStorage.setItem('userData', JSON.stringify(resJson));
        })
        .catch((e) => {
          console.log(e);
          alert('아이디 또는 비밀번호가 틀렸습니다. 확인해주세요.');
          return false;
        });
    };

export const logout = (): AppThunk => (dispatch) => {
  dispatch(setUser(undefined));
  dispatch(setToken(undefined));
  sessionStorage.clear();
  return;
};

export const signup =
  (userData: {
    loginId: string;
    loginPw: string;
    username: string;
    nickname: string;
    loginType: LoginType;
    userType: UserType;
    email: string;
  }): AppThunk =>
    async (dispatch) => {
      return await fetch(rootUrl + '/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })
        .then((res) => res.json())
        .then((resJson) => {
          dispatch(setToken(resJson.accessToken));
          dispatch(setUser(resJson.user));
          sessionStorage.setItem('userData', JSON.stringify(resJson));
        })
        .catch((e) => {
          console.log(e);
        });
    };

export type UserResult = MakePrimitiveRequiredWithObject<User>;
