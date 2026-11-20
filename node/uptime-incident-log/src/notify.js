function summary(alert, incident) {
  const check = String(alert.type).toUpperCase();
  if (incident.status === 'firing') {
    const result = alert.result ? `: ${alert.result}` : '';
    return {
      title: `Down: ${alert.name}`,
      text: `${alert.name} is down. The ${check} check failed${result} at ${new Date(alert.$createdAt).toUTCString()}.`,
    };
  }

  const minutes = Math.max(1, Math.round(incident.downtimeSeconds / 60));
  return {
    title: `Recovered: ${alert.name}`,
    text: `${alert.name} is back up after about ${minutes} min of downtime. The ${check} check passed at ${new Date(alert.resolvedAt).toUTCString()}.`,
  };
}

async function send(create) {
  try {
    await create();
    return true;
  } catch (err) {
    // The message ID is fixed per incident and state, so a repeated event conflicts.
    if (err.code === 409) {
      return false;
    }
    throw err;
  }
}

/**
 * Sends the incident's state change to a topic, once per channel its subscribers use.
 */
export async function notifySubscribers(messaging, topicId, alert, incident) {
  const topic = await messaging.getTopic({ topicId });
  const { title, text } = summary(alert, incident);
  const prefix = `${incident.$id}-${incident.status}`;
  const topics = [topicId];
  const sent = [];

  if (
    topic.emailTotal > 0 &&
    (await send(() =>
      messaging.createEmail({
        messageId: `${prefix}-email`,
        subject: title,
        content: text,
        topics,
      })
    ))
  ) {
    sent.push('email');
  }
  if (
    topic.smsTotal > 0 &&
    (await send(() =>
      messaging.createSms({ messageId: `${prefix}-sms`, content: text, topics })
    ))
  ) {
    sent.push('sms');
  }
  if (
    topic.pushTotal > 0 &&
    (await send(() =>
      messaging.createPush({
        messageId: `${prefix}-push`,
        title,
        body: text,
        topics,
      })
    ))
  ) {
    sent.push('push');
  }

  return sent;
}
