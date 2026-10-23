import { Outlet, useLocation } from "react-router";

const AuthLayout = () => {

  const location = useLocation();

  return (
    <div key={location.key}>
        <Outlet />
    </div>
  );
};

export default AuthLayout;
