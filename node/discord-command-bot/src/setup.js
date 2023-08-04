import { fetch } from 'undici';
import { throwIfMissing } from './utils.js';

async function setup() {
  throwIfMissing(process.env, [
    'DISCORD_PUBLIC_KEY',
    'DISCORD_APPLICATION_ID',
    'DISCORD_TOKEN',
  ]);

  const registerApi = `https://discord.com/api/v9/applications/${process.env.DISCORD_APPLICATION_ID}/commands`;

  const response = await fetch(registerApi, {
    method: 'POST',
    headers: {
      Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'hello',
      description: 'Hello World Command',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to register command');
  }

  console.log('Command registered successfully');
}

setup();
