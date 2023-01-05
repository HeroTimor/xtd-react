import { Button } from "antd-mobile";

import { useNavigate } from "react-router-dom";
function Index() {
  const navigate = useNavigate();

  return (
    <div>
      <h1>我是首页</h1>
      <Button
        color="primary"
        fill="solid"
        onClick={() => {
          navigate("/login");
        }}
      >
        去登录页
      </Button>
    </div>
  );
}

export default Index;
