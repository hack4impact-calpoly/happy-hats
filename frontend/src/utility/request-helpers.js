const startUrl = 'http://localhost:3001/api/';

class CustomWebError extends Error {
  static getAppropriateErrorMsg(statCode) {
    switch (statCode) {
      case 200:
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
    console.log(response);
    throw new CustomWebError(response.status);
  }

  return response;
}

export class GetRequestHelpers {
  static async makeRequestAndGetResponse(urlExtension) {
    const response = await GetRequestHelpers.makeRequest(urlExtension);
    
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

  /* Expect given urlExtension to NOT begin with '/' */
  static async makeRequest(urlExtension) {
    try {
      const response = basicResponseCheck(await fetch(startUrl + urlExtension));

      return response;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}

export class RequestPayloadHelpers {
  static async makeRequest(urlExtension, requestType, payload) {
    try {
      const response = basicResponseCheck(await fetch(startUrl + urlExtension, {
        method: requestType,
        headers: {
          'Content-Type': 'application/json',
        },
        redirect: 'follow',
        body: JSON.stringify(payload),
      }));

      return response;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}