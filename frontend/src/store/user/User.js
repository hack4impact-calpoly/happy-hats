export const NO_USER = -1;
export const UPDATE = 'UPDATE_USER';
export const USER_TYPES = Object.freeze({
  VOLUNTEER: 'volunteer',
  ADMIN: 'admin',
  HOSPITAL: 'hospital',
  NONE: undefined,
});

export const initialUser = {
  userId: NO_USER,
  role: USER_TYPES.NONE,
  displayName: null,
  loggedIn: false
};

function setUser(dispatch, user) {
  dispatch({ type: UPDATE, user });
}

export function generateUser(dispatch, userOverrides) {
  setUser(dispatch, {
    ...initialUser,
    ...userOverrides,
  });
}
