import getEnvironment from './environment'
import { verifyKey } from 'discord-interactions'

export default {
  verifyWebhook: async function (req) {
    const { DISCORD_PUBLIC_KEY } = getEnvironment()
    return await verifyKey(
      req.bodyString,
      req.headers['x-signature-ed25519'],
      req.headers['x-signature-timestamp'],
      DISCORD_PUBLIC_KEY
    )
  },
}
