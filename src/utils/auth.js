import Cookies from "js-cookie";

const TOKEN_KEY = "access_token";
const REGRESH_TOKEN_KEY = "refresh_token";
/**
 * 判断用户是否登录
 * 已登录返回true
 */
export function isLogin() {
  return !!Cookies.get(TOKEN_KEY);
}
export const getToken = () => Cookies.get(TOKEN_KEY);

export const setToken = (token, params = {}) => {
  Cookies.set(TOKEN_KEY, token, params);
};

export const setRefreshToken = (token) => {
  Cookies.set(REGRESH_TOKEN_KEY, token);
};
