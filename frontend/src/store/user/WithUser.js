import React, { useEffect } from 'react';
import { useContext } from 'react';
import { generateUser } from './User';
import { storeContext } from '../Store';

function withUser(WrappedComponent, onUserUpdated = null) {
  function WithUser(props) {
    const [state, dispatch] = useContext(storeContext);

    const updateUser = (overrides) => {
      generateUser(dispatch, overrides);
    };

    const isUserAuthenticated = () => {
      return state.user?.loggedIn;
    };

    useEffect(() => {
      if (!onUserUpdated) { return; }
      onUserUpdated(state, dispatch);
    }, [state, dispatch]);

    return (
      <React.Fragment>
        <WrappedComponent
          user={state.user}
          modifyUser={updateUser}
          isUserAuthenticated={isUserAuthenticated}
          {...props}
        />
      </React.Fragment>
    );
  }

  return WithUser;
}

export default withUser;
