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
const superUserRoleStrings = new Set([USER_ROLES.ADMIN]);

export function acceptedUserRole(role) {
  return validRoleStrings.has(role) && role !== USER_ROLES.UNSET && role !== USER_ROLES.NONE;
}

export function isUserApproved(user) {
  if (!user) {
    return false;
  }

  return acceptedUserRole(user.role) && user.approved;
}

export function isUserAdmin(user) {
  return isUserApproved(user) && superUserRoleStrings.has(user.role);
}

export function isUserFullySignedUp(user) {
  return user.otherUserInfo?.firstName && user.otherUserInfo?.lastName;
}

export const initialUser = {
  role: USER_ROLES.UNSET,
  loggedIn: false,
  approved: false,
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
