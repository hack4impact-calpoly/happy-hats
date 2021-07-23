const startUrl = `${process.env.REACT_APP_SERVER_URL}/api/`;

class CustomWebError extends Error {
  static getAppropriateErrorMsg(statCode) {
    switch (statCode) {
      case 200:
      case 201:
        return 'No known error occurred';
      case 401:
        return 'User unauthorized';
      case 400:
        return 'Bad formatting on request';
      default:
        return 'Unknown error (most likely server error) occurred';
    }
  }

  constructor(statCode, ...params) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(...params)

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CustomWebError)
    }

    this.name = 'CustomWebError';
    this.responseCode = statCode;
    this.responseError = CustomWebError.getAppropriateErrorMsg(statCode);
  }
}

const basicResponseCheck = (response) => {
  if (!response || !response.ok) {
    throw new CustomWebError(response.status);
  }
  return response;
}

export function getAuthHeaderFromSession(cognitoSession) {
  return generateAuthHeader(cognitoSession.signInUserSession.idToken.jwtToken);
}

export function generateAuthHeader(token) {
  return {
    'Authorization': `Bearer ${token}`,
  };
}

// Optionals can include auth token
export class GetRequestHelpers {
  static async makeRequestAndGetResponse(urlExtension, headers = {}) {
    const response = await GetRequestHelpers.makeRequest(urlExtension, headers);
    return getJsonResponse(response);
  }

  /* Expect given urlExtension to NOT begin with '/' */
  static async makeRequest(urlExtension, headers = {}) {
    try {
      const response = basicResponseCheck(await fetch(startUrl + urlExtension, {
        headers: {
          ...headers,
        },
        redirect: 'follow',
      }));
      return response;
    } catch (e) {
      return false;
    }
  }
}

export async function getJsonResponse(response) {
  if (!response) {
    console.log('Error occurred so response cannot be parsed');
    return null;
  }

  try {
    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (e) {
    console.log('Error converting to JSON:', e);
    return null;
  }
}

export class RequestPayloadHelpers {
  static async makeRequest(urlExtension, requestType, payload, headers = {}, asJSON = false) {
    try {
      const response = await basicResponseCheck(await fetch(startUrl + urlExtension, {
        method: requestType,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        redirect: 'follow',
        body: JSON.stringify(payload),
      }));

      if (asJSON) {
        return await getJsonResponse(response);
      }

      return response;
    } catch (e) {
      return false;
    }
  }
}