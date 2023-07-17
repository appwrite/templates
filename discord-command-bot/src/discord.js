import { verifyKey } from 'discord-interactions'

function DiscordService(environment) {
  return {
    verifyWebhook: async function (req) {
      const { DISCORD_PUBLIC_KEY } = environment
      return await verifyKey(
        req.bodyString,
        req.headers['x-signature-ed25519'],
        req.headers['x-signature-timestamp'],
        DISCORD_PUBLIC_KEY
      )
    },
  }
}

export default DiscordService
