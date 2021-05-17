export const NO_USER = -1;
export const UPDATE = 'UPDATE_USER';
export const USER_ROLES = Object.freeze({
  VOLUNTEER: 'volunteer',
  ADMIN: 'admin',
  HOSPITAL: 'hospital',
  NONE: 'none',
  UNSET: undefined,
});

const validRoleStrings = new Set(Object.values(USER_ROLES));

export function acceptedUserRole(role) {
  return validRoleStrings.has(role) && role !== USER_ROLES.UNSET && role !== USER_ROLES.NONE;
}

export const initialUser = {
  role: USER_ROLES.UNSET,
  loggedIn: false,
  cognitoSession: null,
  otherUserInfo: null, // Includes info from user object. Not sure if we'll use yet
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
