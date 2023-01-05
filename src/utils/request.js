import axios from "axios";
import { API, SESSIONKEY } from "@/utils/properties";
import { useNavigate } from "react-router-dom";

import { toast } from "@/utils/utils";
const navigate = useNavigate();

// 创建 axios 实例
const instance = axios.create({
  baseURL: "",
  timeout: 30000,
});
let isRefreshing = false; // 标记是否正在刷新 token
let requests = []; // 存储待重发请求的数组
// 当频繁请求的时候取消进行中的请求
let pending = []; // 声明一个数组用于存储每个请求的取消函数和axios标识
let cancelToken = axios.CancelToken;
let removePending = (config) => {
  for (let i in pending) {
    if (pending[i].url === config.url && config.removePending !== true) {
      // 在当前请求在数组中存在时执行取消函数
      pending[i].cancel("cancel连续请求"); // 执行取消操作
    }
  }
};
// request interceptor
instance.interceptors.request.use(
  async (config) => {
    if (!window.navigator.onLine) {
      toast("网络连接异常，请稍后重试");
      return;
    }
    if (config.url.indexOf("upload_image") !== -1) {
      // console.log(process.env.REACT_APP_BASE_URL)
      config.baseURL = process.env.REACT_APP_BASE_URL.replace("/api", "");
      // console.log(config.baseURL)
    }
    let nonce = calcNonce();
    let timestamp = new Date().getTime();
    config.headers["nonce"] = nonce;
    config.headers["terminal"] = "3";
    config.headers["timestamp"] = timestamp;
    config.headers["appVersion"] = API.VERSION;

    // 处理参数加密
    // let params = encryption(config)
    let sign = sha256(
      "timestamp=" + timestamp + "&nonce=" + nonce + "&secret=" + signSecret
    );
    config.headers["sign"] = sign;

    removePending(config); // 在一个axios发送前执行一下判定操作，在removePending中执行取消操作
    // console.log(config.url);
    config.cancelToken = new cancelToken(function executor(c) {
      // 本次axios请求的配置添加cancelToken
      pending.push({
        // url: config.url,
        url: config.url,
        cancel: c,
      });
    });
    let token = await getUserToken();

    config.headers["token"] = token;
    return config;
  },
  (error) => {
    return Promise.reject(error.response);
  }
);
// response interceptor
instance.interceptors.response.use(
  (response) => {
    const res_data = response.data;
    if (res_data.code === 200) {
      if (res_data.results) {
        return res_data.results.data || res_data.errorCode;
      }
      if (res_data.pageInfo) {
        return res_data || res_data.errorCode;
      }

      return res_data.data || res_data.errorCode;
    } else if (res_data.code === 1010) {
      Cookies.remove(SESSIONKEY.REFRESH_TOKEN);
      Cookies.remove(SESSIONKEY.ACCESS_TOKEN);
      // confirm("您已下线", "登录已过期，请重新登录", "", "确定", false).then(
      //   () => {
      //    navigate("/login",{ replace: true });
      //   },
      //   () => console.log("取消")
      // );

      return Promise.reject(response && response.data);
    } else if (res_data.code === 444) {
      // 444 token为空
      let {
          config: { params = {} },
        } = response,
        { isLogin = true } = params;
      // 默认需要跳转登录页面
      isLogin && logout();
    } else if (res_data.code === 405) {
      Cookies.remove(SESSIONKEY.REFRESH_TOKEN);
      Cookies.remove(SESSIONKEY.ACCESS_TOKEN);
      // confirm("您已下线", "您的账号已在其他设备登录", "", "确定", false).then(
      //   () => {
      //     navigate("/login",{ replace: true });
      //   },
      //   () => console.log("取消")
      // );

      return Promise.reject(response && response.data);
    } else if (res_data.code === 1007) {
      Cookies.remove(SESSIONKEY.REFRESH_TOKEN);
      Cookies.remove(SESSIONKEY.ACCESS_TOKEN);
      // confirm(
      //   "您已下线",
      //   "您的账号已被禁用，如有疑问请联系客服",
      //   "",
      //   "确定",
      //   false
      // ).then(
      //   () => {
      //     navigate("/login",{ replace: true });
      //   },
      //   () => console.log("取消")
      // );
      return Promise.reject(response && response.data);
    } else if (res_data.code === 1008) {
      Cookies.remove(SESSIONKEY.REFRESH_TOKEN);
      Cookies.remove(SESSIONKEY.ACCESS_TOKEN);
      navigate("/login", { replace: true });
      return Promise.reject(response && response.data);
    } else if (res_data.code === 100006) {
      Cookies.remove(SESSIONKEY.REFRESH_TOKEN);
      Cookies.remove(SESSIONKEY.ACCESS_TOKEN);
      // confirm(
      //   "您已下线",
      //   "您的账号已被注销，如有疑问请联系客服",
      //   "",
      //   "确定",
      //   false
      // ).then(
      //   () => {
      //     navigate("/login",{ replace: true });
      //   },
      //   () => console.log("取消")
      // );
      return Promise.reject(response && response.data);
    } else {
      toast(response.data.msg);

      return Promise.reject(response && response.data);
    }
  },
  (error) => {
    if (
      String(error).indexOf("401") !== -1 ||
      String(error).indexOf("444") !== -1
    ) {
      logout();
    }
    if (error.msg !== "cancel连续请求") {
      // LpToast.text(error.msg)
    }

    return Promise.reject("");
  }
);
// 退出登录
function logout() {
  Cookies.remove(SESSIONKEY.ACCESS_TOKEN);
  window.localStorage.removeItem(SESSIONKEY.ACCESS_TOKEN);
  navigate("/login", { replace: true });
}
// 获取用户token
function getUserToken() {
  return new Promise((resolve, reject) => {
    let token = Cookies.get(SESSIONKEY.ACCESS_TOKEN);
    // 判断用户是否登录
    if (token) {
      // 获取token
      resolve(token);
      return;
    }
    //未含有refreshToken, 直接返回空串
    if (!Cookies.get(SESSIONKEY.REFRESH_TOKEN)) {
      // 未登录
      resolve("");
      return;
    }
    // 验证是否正在刷新token
    if (isRefreshing) {
      // 正在刷新token 所有的请求入栈，待刷新完成后，执行出栈操作
      requestQueue.push((token) => {
        resolve(token);
      });
      return;
    }

    // 设置正在刷新token
    isRefreshing = true;

    let url = process.env.REACT_APP_BASE_URL + "/login/userCenter/refreshToken";
    let nonce = calcNonce();
    let timestamp = new Date().getTime();
    // 处理参数加密
    let sign = sha256(
      "timestamp=" + timestamp + "&nonce=" + nonce + "&secret=" + signSecret
    );

    axios
      .post(
        url,
        { refreshToken: Cookies.get(SESSIONKEY.REFRESH_TOKEN) },
        {
          headers: {
            nonce: nonce,
            terminal: "3",
            timestamp: timestamp,
            appVersion: API.VERSION,
            sign,
          },
        }
      )
      .then(
        (res) => {
          isRefreshing = false;
          if (res.data.code === 200) {
            console.log(res.data);
            // 缓存
            Cookies.set(SESSIONKEY.ACCESS_TOKEN, res.data.data.token, {
              expires: new Date(new Date().getTime() + 5400000),
            });
            Cookies.set(SESSIONKEY.REFRESH_TOKEN, res.data.data.refreshToken, {
              expires: 30,
            });
            // 返回
            resolve(Cookies.get(SESSIONKEY.ACCESS_TOKEN));
          } else {
            resolve("");
            // refreshToken失效了，删除refreshToken,让重新登录
            Cookies.remove(SESSIONKEY.REFRESH_TOKEN);
          }
        },
        () => {
          resolve("");
        }
      )
      .then(() => {
        // 刷新token完成， 执行出栈操作
        requests.forEach((cb) => cb(Cookies.get(SESSIONKEY.ACCESS_TOKEN)));
        // 清空栈
        requests.clear();
        // 释放
        isRefreshing = false;
      });
  });
}

// 参数加密
// eslint-disable-next-line
function encryption(config) {
  let params = "";
  if (config.method === "get" && config.params) {
    let keysArr = Object.keys(config.params).sort();
    keysArr.forEach((v, i) => {
      for (let key in config.params) {
        if (i !== keysArr.length - 1) {
          if (v === key) {
            params = params + v + "=" + config.params[v] + ",";
          }
        } else {
          if (v === key) {
            params = params + v + "=" + config.params[v];
          }
        }
      }
    });
  } else if (config.method === "post" && config.data) {
    let keysArr = Object.keys(config.data).sort();
    keysArr.forEach((v, i) => {
      for (let key in config.data) {
        if (i !== keysArr.length - 1) {
          if (v === key) {
            params = params + v + "=" + config.data[v] + ",";
          }
        } else {
          if (v === key) {
            params = params + v + "=" + config.data[v];
          }
        }
      }
    });
  }
  return params;
}

function calcNonce() {
  let nonce = "";
  let char = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 10; i++) {
    nonce += char.charAt(Math.floor(Math.random() * 62));
  }
  return nonce;
}
