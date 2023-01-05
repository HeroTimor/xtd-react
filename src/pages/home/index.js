import { Button } from "antd-mobile";
import styles from "./index.module.less";
import { useNavigate } from "react-router-dom";
import { isLogin } from "@/utils/auth.js";

function Home() {
  const navigate = useNavigate();

  return (
    <div className={styles["P-home"]}>
      <h1>Home Page</h1>
      <div className={styles["ipt-con"]}>
        <h2>账号：{"无"}</h2>
        <h2>密码：{"无"}</h2>
        <h2>token：</h2>
        <h2>登录状态：{isLogin() ? "是" : "否"}</h2>

        <Button
          color="primary"
          fill="solid"
          onClick={() => {
            navigate("/login");
          }}
        >
          返回登录
        </Button>
      </div>
    </div>
  );
}

export default Home;
