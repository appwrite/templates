import {
  InteractionResponseType,
  InteractionType,
  verifyKey,
} from 'discord-interactions';
import { throwIfMissing } from './utils.js';

export default async ({ req, res, error, log }) => {
  throwIfMissing(process.env, [
    'DISCORD_PUBLIC_KEY',
    'DISCORD_APPLICATION_ID',
    'DISCORD_TOKEN',
  ]);

  if (
    !verifyKey(
      req.bodyRaw,
      req.headers['x-signature-ed25519'],
      req.headers['x-signature-timestamp'],
      process.env.DISCORD_PUBLIC_KEY
    )
  ) {
    error('Invalid request.');
    return res.json({ error: 'Invalid request signature' }, 401);
  }

  log('Valid request');

  const interaction = req.body;
  if (
    interaction.type === InteractionType.APPLICATION_COMMAND &&
    interaction.data.name === 'hello'
  ) {
    log('Matched hello command - returning message');

    return res.json(
      {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: 'Hello, World!',
        },
      },
      200
    );
  }

  log("Didn't match command - returning PONG");

  return res.json({ type: InteractionResponseType.PONG }, 200);
};
