import { Redirect, useLocation, Route } from "react-router";
import { acceptedUserRole } from "../store/user/User";
import withUser from "../store/user/WithUser";
import withNavbarAndFooter from "./WithNavbarAndFooter";

const PrivateRoute = ({ children, ...rest }) => {
  const location = useLocation();

  if (!rest.isUserAuthenticated()) {
    return (
      <Redirect
        to={{
          pathname: '/login',
          state: { referrer: location.pathname }
        }}
      />
    );
  }

  if (rest.requireValidRole && !acceptedUserRole(rest.user?.role)) {
    alert("This account lacks credentials to view this page. Wait to be approved by an admin or login to an account that has been approved.")
    return (
      <Redirect
        to={{
          pathname: '/home',
          state: { referrer: location.pathname }
        }}
      />
    );
  }

  return (
    <Route {...rest}>
      {children}
    </Route>
  );
};

export default withUser(withNavbarAndFooter(PrivateRoute));
