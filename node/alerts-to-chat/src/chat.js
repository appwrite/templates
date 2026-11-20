const TARGETS = ['slack', 'discord', 'teams', 'google-chat'];

const COMPARATORS = {
  greaterThan: '>',
  greaterThanEqual: '≥',
  lessThan: '<',
  lessThanEqual: '≤',
};

const COLORS = {
  firing: { hex: '#E5484D', teams: 'Attention' },
  resolved: { hex: '#30A46C', teams: 'Good' },
};

/**
 * Picks the chat app from the webhook URL's host, unless CHAT_TARGET names one.
 */
export function detectTarget(url, override) {
  if (override) {
    if (!TARGETS.includes(override)) {
      throw new Error(`CHAT_TARGET must be one of: ${TARGETS.join(', ')}`);
    }
    return override;
  }

  const { hostname, pathname } = new URL(url);
  if (hostname === 'hooks.slack.com') {
    return 'slack';
  }
  if (
    /(^|\.)discord(app)?\.com$/.test(hostname) &&
    pathname.startsWith('/api/webhooks/')
  ) {
    return 'discord';
  }
  if (hostname === 'chat.googleapis.com') {
    return 'google-chat';
  }
  if (
    hostname.endsWith('.api.powerplatform.com') ||
    hostname.endsWith('.logic.azure.com')
  ) {
    return 'teams';
  }

  throw new Error(
    `Can't tell which chat app ${hostname} is. Set CHAT_TARGET to one of: ${TARGETS.join(', ')}`
  );
}

function number(value) {
  return Number(value ?? 0).toLocaleString('en-US', {
    maximumFractionDigits: 2,
  });
}

function duration(from, to) {
  const seconds = Math.max(
    0,
    Math.round((new Date(to) - new Date(from)) / 1000)
  );
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

/**
 * Turns an alert into a title and the facts every chat app shows.
 * Usage alerts compare a metric with a threshold; probe alerts report what the check found.
 */
export function describe(alert) {
  const firing = alert.status === 'firing';
  const facts = [];

  if (alert.metric) {
    const comparator = COMPARATORS[alert.comparator] ?? alert.comparator;
    facts.push(['Metric', alert.metric]);
    facts.push([
      'Value',
      `${number(alert.value)} ${comparator} ${number(alert.threshold)}`,
    ]);
    if (alert.peak !== undefined && alert.peak !== alert.value) {
      facts.push(['Peak', number(alert.peak)]);
    }
  } else {
    facts.push(['Check', String(alert.type ?? '').toUpperCase()]);
    if (alert.result) {
      facts.push(['Result', alert.result]);
    }
    if (alert.value) {
      facts.push(['Latency', `${number(alert.value)} ms`]);
    }
  }

  if (alert.resourceType && alert.resourceType !== 'project') {
    facts.push(['Resource', `${alert.resourceType} ${alert.resourceId}`]);
  }
  if (alert.severity) {
    facts.push(['Severity', alert.severity]);
  }
  facts.push(['Started', new Date(alert.$createdAt).toUTCString()]);
  if (!firing && alert.resolvedAt) {
    facts.push(['Duration', duration(alert.$createdAt, alert.resolvedAt)]);
  }
  facts.push(['Project', process.env.APPWRITE_FUNCTION_PROJECT_ID ?? '']);

  return {
    status: alert.status,
    title: `${firing ? '🔴 Firing' : '✅ Resolved'}: ${alert.name}`,
    facts: facts.filter(([, value]) => value !== ''),
  };
}

/**
 * Builds the webhook body each chat app expects.
 */
export function formatMessage(target, { status, title, facts }) {
  const color = COLORS[status];

  switch (target) {
    case 'slack':
      return {
        text: title,
        attachments: [
          {
            color: color.hex,
            blocks: [
              {
                type: 'section',
                text: { type: 'mrkdwn', text: `*${title}*` },
              },
              {
                type: 'section',
                fields: facts.map(([name, value]) => ({
                  type: 'mrkdwn',
                  text: `*${name}*\n${value}`,
                })),
              },
            ],
          },
        ],
      };
    case 'discord':
      return {
        embeds: [
          {
            title,
            color: parseInt(color.hex.slice(1), 16),
            fields: facts.map(([name, value]) => ({
              name,
              value: String(value),
              inline: true,
            })),
            timestamp: new Date().toISOString(),
          },
        ],
      };
    case 'teams':
      return {
        type: 'message',
        attachments: [
          {
            contentType: 'application/vnd.microsoft.card.adaptive',
            content: {
              $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
              type: 'AdaptiveCard',
              version: '1.4',
              body: [
                {
                  type: 'TextBlock',
                  text: title,
                  weight: 'Bolder',
                  size: 'Medium',
                  color: color.teams,
                  wrap: true,
                },
                {
                  type: 'FactSet',
                  facts: facts.map(([name, value]) => ({
                    title: name,
                    value: String(value),
                  })),
                },
              ],
            },
          },
        ],
      };
    case 'google-chat':
      return {
        text: [
          `*${title}*`,
          ...facts.map(([name, value]) => `${name}: ${value}`),
        ].join('\n'),
      };
  }
}
