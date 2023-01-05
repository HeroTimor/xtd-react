import { isLogin } from "@/utils/auth.js";
import { toast } from "@/utils/utils";
const routes = [
  {
    path: "/",
    redirect: "/index",
  },
  {
    path: "/index",
    component: () => import("@/pages/index"),
    meta: {
      title: "首页",
    },
  },
  {
    path: "/home",
    component: () => import("@/pages/home"),
    meta: {
      title: "我的",
      auth: true,
    },
  },
  {
    path: "/login",
    component: () => import("@/pages/login"),
    meta: {
      title: "登录",
    },
  },
  {
    path: "*",
    redirect: "/index",
  },
];
const onRouteBefore = ({ pathname, meta }) => {
  // 动态修改页面title
  if (meta.title !== undefined) {
    // document.title = meta.title;
  }
  // 判断未登录跳转登录页
  if (meta.auth) {
    if (!isLogin()) {
      toast("尚未登录");
      console.log("尚未登录");
      return "/login";
    }
  }
};

export { routes, onRouteBefore };
