import { fetch } from 'undici';
import {
  verifyHeaders,
  formatIntoGoogleAnalyticsEvent,
  throwIfMissing,
} from './utils.js';

export default async ({ res, req, log, error }) => {
  throwIfMissing(process.env, ['GA4_MEASUREMENT_ID', 'GA4_API_SECRET']);
  try {
    verifyHeaders(req);
  } catch (err) {
    error(err);
    return res.json({ ok: false, error: 'Invalid Event Header' }, 401);
  }
  try {
    const { event_name, wildCardObject } = formatIntoGoogleAnalyticsEvent(
      `${req.headers['x-appwrite-event']}`
    );
    // Documentation on Google Analytics Payload https://developers.google.com/analytics/devguides/collection/protocol/ga4/reference?client_type=gtag#payload
    const payload = JSON.stringify({
      client_id: `${req.headers['x-appwrite-user-id']}`,
      user_id: `${req.headers['x-appwrite-user-id']}`,
      events: [
        {
          name: event_name,
          params: wildCardObject,
        },
      ],
    });
    log(payload);
    const response = await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${process.env.GA4_MEASUREMENT_ID}&api_secret=${process.env.GA4_API_SECRET}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        cors: 'no-cors',
        body: payload,
      }
    );
    if (response.ok) {
      if (response.status != 204) {
        const responseJson = await response.json();
        log(JSON.stringify(responseJson));
      }
      log(
        `event ${req.headers['x-appwrite-event']} is send to google analytics`
      );
    } else {
      error(
        'Response status code is not between 200-299 event to Google Analytics'
      );
      return res.json(
        {
          ok: false,
          error: `Response status code when posting event to Google Analytics is ${response.status}`,
        },
        503
      );
    }
  } catch (err) {
    error('Error reporting event to Google Analytics :', err);
    return res.json(
      { ok: false, error: 'Error Posting Event to Google Analytics' },
      401
    );
  }

  log('Event posted to Google Analytics successfully');
  return res.json(
    {
      ok: true,
      message: `event ${req.headers['x-appwrite-event']} is send to google analytics`,
    },
    200
  );
};
