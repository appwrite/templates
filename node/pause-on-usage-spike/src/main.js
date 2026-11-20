import { Client, Functions, Sites } from 'node-appwrite';

const SEVERITIES = ['info', 'warning', 'error', 'critical'];

export default async ({ req, res, log }) => {
  // Only alert events carry a real alert. Refuse HTTP calls, which anyone
  // who can reach the function's domain could forge.
  if (req.headers['x-appwrite-trigger'] !== 'event') {
    return res.json(
      { ok: false, message: 'Only alert events trigger this function.' },
      403
    );
  }

  const alert = req.bodyJson;

  if (alert?.status !== 'firing' || alert.type !== 'usage') {
    log('Ignored: not a firing usage alert.');
    return res.json({ paused: false, reason: 'not-firing-usage' });
  }

  const minimum = process.env.MIN_SEVERITY || 'warning';
  if (!SEVERITIES.includes(minimum)) {
    throw new Error(`MIN_SEVERITY must be one of: ${SEVERITIES.join(', ')}`);
  }
  if (SEVERITIES.indexOf(alert.severity) < SEVERITIES.indexOf(minimum)) {
    log(`Ignored: severity ${alert.severity} is below ${minimum}.`);
    return res.json({ paused: false, reason: 'severity' });
  }

  // Never pause the function that is doing the pausing.
  if (alert.resourceId === process.env.APPWRITE_FUNCTION_ID) {
    log('Ignored: the alert is about this function.');
    return res.json({ paused: false, reason: 'self' });
  }

  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(req.headers['x-appwrite-key']);

  // Only a monitor scoped to one function or site names something to pause.
  // Disabling twice is harmless, so a repeated event changes nothing.
  switch (alert.resourceType) {
    case 'function': {
      const functions = new Functions(client);
      const resource = await functions.get({ functionId: alert.resourceId });
      if (resource.enabled) {
        await functions.update({
          functionId: resource.$id,
          name: resource.name,
          enabled: false,
        });
      }
      break;
    }
    case 'site': {
      const sites = new Sites(client);
      const resource = await sites.get({ siteId: alert.resourceId });
      if (resource.enabled) {
        await sites.update({
          siteId: resource.$id,
          name: resource.name,
          framework: resource.framework,
          enabled: false,
        });
      }
      break;
    }
    default:
      log(
        `Ignored: "${alert.name}" watches a ${alert.resourceType}, not a function or site.`
      );
      return res.json({ paused: false, reason: 'scope' });
  }

  log(
    `Paused ${alert.resourceType} ${alert.resourceId}: "${alert.name}" fired at ${alert.value} against ${alert.threshold}.`
  );
  return res.json({
    paused: true,
    resourceType: alert.resourceType,
    resourceId: alert.resourceId,
  });
};
