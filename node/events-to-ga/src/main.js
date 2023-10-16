import { Client } from "node-appwrite";
import { throwIfMissing } from "./utils.js";
import fetch from "node-fetch";

throwIfMissing(process.env, [
  "GA4_Measurement_Id",
  "APPWRITE_ENDPOINT",
  "APPWRITE_FUNCTION_PROJECT_ID",
  "GA4_API_SECRET",
]);

// Initialize the Appwrite SDK
const client = new Client();
client.setEndpoint(process.env.APPWRITE_ENDPOINT);
client.setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID);
//client.setKey(process.env.APPWRITE_API_KEY);

// Initialize Google Analytics 4 Measurement ID
const ga4MeasurementId = process.env.GA4_Measurement_Id;
const ga4secret = process.env.GA4_API_SECRET;

function formatInto_GA_EventString(str) {
  const oddElemArray = [];
  const wildCardArray = [];
  const splitArray = str.split(".");

  for (let i = 0; i < splitArray.length; i++) {
    if (i % 2 == 0) oddElemArray.push(splitArray[i]);
    else wildCardArray.push([`wildCard_${(i + 1) >> 1}`, splitArray[i]]);
  }
  const event_name = oddElemArray.join("_");
  return {
    event_name: event_name.charAt(0).toUpperCase() + event_name.slice(1),
    wildCardObject: Object.fromEntries(wildCardArray),
  };
}

/* Appwrite function */

export default async ({ res, req, log, error }) => {
  // Listen for Appwrite events
  if (req.headers["x-appwrite-user-id"] == "") {
    error(`x-appwrite-trigger value in req.headers is not there`);
    return res.json({ ok: false, error: "Invalid Event Header" }, 401);
  }
  if (req.headers["x-appwrite-trigger"] != "event") {
    error(`Not triggered by event but by ${req.headers["x-appwrite-trigger"]}`);
    return res.json({ ok: false, error: "Invalid Event Header" }, 401);
  }
  if (req.headers["x-appwrite-event"] == "") {
    error(`x-appwrite-event value in req.headers is null`);
    return res.json({ ok: false, error: "Invalid Event Header" }, 401);
  }
  try {
    const { event_name, wildCardObject } = formatInto_GA_EventString(
      `${req.headers["x-appwrite-event"]}`
    );
    const payload = JSON.stringify({
      client_id: `${req.headers["x-appwrite-user-id"]}`,
      user_id: `${req.headers["x-appwrite-user-id"]}`,
      events: [
        {
          // Event names must start with an alphabetic character and all characters should be alphanumeric.
          name: event_name,
          params: wildCardObject,
        },
      ],
    });
    log(payload);
    const response = await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${ga4MeasurementId}&api_secret=${ga4secret}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        cors: "no-cors",
        body: payload,
      }
    );
    if (response.ok) {
      if (response.status != 204) {
        const responseJson = await response.json();
        log(JSON.stringify(responseJson));
      }
      log(
        `event ${req.headers["x-appwrite-event"]} is send to google analytics`
      );
    } else {
      error("Response status code is not between 200-299 event to Google Analytics");
      return res.json(
        { ok: false, error: `Response status code when posting event to Google Analytics is ${response.status}` },
        503
      );
    }
  } catch (err) {
    error("Error reporting event to Google Analytics :");
    return res.json(
      { ok: false, error: "Error Posting Event to Google Analytics" },
      401
    );
  }

  log("Event posted to Google Analytics successfully");
  return res.json(
    {
      ok: true,
      message: `event ${req.headers["x-appwrite-event"]} is send to google analytics`,
    },
    200
  );
};
