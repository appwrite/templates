import { verifyKey } from 'discord-interactions';

class DiscordService {
  /**
   * @param {import('./environment').default} env
   */
  constructor(env) {
    this.env = env;
  }

  async verifyWebhook(req) {
    return await verifyKey(
      req.bodyString,
      req.headers['x-signature-ed25519'],
      req.headers['x-signature-timestamp'],
      this.env.DISCORD_PUBLIC_KEY
    );
  }
}

export default DiscordService;
