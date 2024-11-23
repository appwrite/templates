import {
  InteractionResponseFlags,
  InteractionResponseType,
  InteractionType,
  verifyKey,
} from 'discord-interactions';
import { throwIfMissing } from './utils.js';
import commands from './commands/index.js';

export default async ({ req, res, error, log }) => {
  throwIfMissing(process.env, [
    'DISCORD_PUBLIC_KEY',
    'DISCORD_APPLICATION_ID',
    'DISCORD_TOKEN',
  ]);

  if (
    !(await verifyKey(
      req.bodyBinary,
      req.headers['x-signature-ed25519'],
      req.headers['x-signature-timestamp'],
      process.env.DISCORD_PUBLIC_KEY
    ))
  ) {
    error('Invalid request.');
    return res.json({ error: 'Invalid request signature' }, 401);
  }

  log('Valid request');

  const interaction = req.body;
  if (interaction.type === InteractionType.APPLICATION_COMMAND) {
    const command = commands.get(interaction.data.name);
    if (command) {
      log(`Matched ${interaction.data.name} command - returning message`);
      return command(res);
    }
  }

  /**
   * If the command is not found, return a generic message to the user.
   */
  return res.json(
    {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: 'Invalid command. Did you mean something else?',
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    },
    200
  );
};
