import { Button, Input } from "antd-mobile";
import styles from "./index.module.less";
import { useNavigate } from "react-router-dom";
function Login() {
  const navigate = useNavigate();
  return (
    <div className={styles["P-login"]}>
      <div className={styles["ipt-con"]}>
        <Input placeholder="账号" type="text" />
      </div>
      <div className={styles["ipt-con"]}>
        <Input placeholder="密码" type="password" />
      </div>
      <div className={styles["ipt-con"]}>
        <Button
          color="primary"
          fill="solid"
          block
          onClick={() => {
            navigate("/home");
          }}
        >
          登录
        </Button>
      </div>
    </div>
  );
}

export default Login;
