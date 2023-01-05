import { useRoutes } from "react-router-dom";
import { routes, onRouteBefore } from "@/router";
import { transformRoutes, setRouteBefore } from "@/components/RouterGuard/fn";
function App() {
  console.log(process.env);
  setRouteBefore(onRouteBefore);
  const elements = useRoutes(transformRoutes(routes));
  return elements;
}

export default App;
