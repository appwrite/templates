/**
 * Throws an error if any of the keys are missing from the object
 * @param {*} obj
 * @param {string[]} keys
 * @throws {Error}
 */
export function throwIfMissing(obj, keys) {
  const missing = [];
  for (let key of keys) {
    if (!(key in obj) || !obj[key]) {
      missing.push(key);
    }
  }
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
}

/**
 * Returns whether the request headers and appropriate message are ok
 * @param {*} req
 * @returns {}
 */
export function verifyHeaders(req) {
  if (req.headers['x-appwrite-user-id'] == '') {
    throw new Error(`x-appwrite-user-id value in req.headers is not there`);
  }
  if (req.headers['x-appwrite-trigger'] != 'event') {
    throw new Error(
      `Not triggered by event but by ${req.headers['x-appwrite-trigger']}`
    );
  }
  if (req.headers['x-appwrite-event'] == '') {
    throw new Error(`x-appwrite-event value in req.headers is not there`);
  }
}

/**
 * Returns object containing a string denoting the formatted event name to Google Analytics and another object containing params
 * @param {string} str
 * @returns {{event_name:string,wildCardObject:{[key:string]:string}}}
 */
export function formatIntoGoogleAnalyticsEvent(str) {
  const oddElemArray = [];
  const wildCardArray = [];
  const splitArray = str.split('.');

  for (let i = 0; i < splitArray.length; i++) {
    if (i % 2 == 0) oddElemArray.push(splitArray[i]);
    else {
      let wildCardKey = oddElemArray[oddElemArray.length - 1];
      wildCardArray.push([
        `${
          wildCardKey.charAt(wildCardKey.length - 1) === 's'
            ? wildCardKey.slice(0, -1)
            : wildCardKey
        }Id`,
        splitArray[i],
      ]);
    }
  }
  const event_name = oddElemArray.join('_');
  return {
    event_name: event_name,
    wildCardObject: Object.fromEntries(wildCardArray),
  };
}
