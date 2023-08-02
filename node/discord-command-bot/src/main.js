import { InteractionResponseType, InteractionType } from 'discord-interactions';
import { throwIfMissing } from './utils.js';

export default async ({ req, res, error }) => {
  throwIfMissing(process.env, ['DISCORD_PUBLIC_KEY']);

  const verified = await verifyKey(
    req.bodyRaw,
    req.headers['x-signature-ed25519'],
    req.headers['x-signature-timestamp'],
    process.env.DISCORD_PUBLIC_KEY
  );

  if (!verified) {
    error('Invalid request.');
    return res.json({ error: 'Invalid request signature' }, 401);
  }

  const interaction = req.body;
  if (
    interaction.type === InteractionType.APPLICATION_COMMAND &&
    interaction.data.name === 'hello'
  ) {
    return res.json({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: 'Hello from Appwrite 👋',
      },
    });
  }

  return res.json({ type: InteractionResponseType.PONG });
};
