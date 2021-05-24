import { createContext, useReducer } from 'react';
import { UPDATE as UPDATE_USER, initialUser } from './user/User';

const initialStore = {
  user: initialUser,
};

function reducer(state, action) {
  switch (action.type) {
    case UPDATE_USER:
      return {
        ...state,
        user: {...action.user},
      };
    default:
      return state;
  }
}

function Store({children}) {
  const [state, dispatch] = useReducer(reducer, initialStore);

  return (
    <storeContext.Provider value={[state, dispatch]}>
      {children}
    </storeContext.Provider>
  );
}

export const storeContext = createContext(initialStore);

export default Store;
