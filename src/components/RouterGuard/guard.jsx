import { Navigate, useLocation } from "react-router-dom";

function Guard({ element, meta, handleRouteBefore }) {
  meta = meta || {};
  const location = useLocation();
  const { pathname } = location;
  const nextPath = handleRouteBefore
    ? handleRouteBefore({ pathname, meta })
    : pathname;
  if (nextPath && nextPath !== pathname) {
    element = <Navigate to={nextPath} replace={true} />;
  }
  return element;
}

export default Guard;
