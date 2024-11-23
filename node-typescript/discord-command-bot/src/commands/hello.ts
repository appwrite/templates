import { InteractionResponseType } from 'discord-interactions';

export default function HelloCommand(res) {
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
