import os
from .utils import throw_if_missing
from discord_interactions import verify_key, InteractionResponseType, InteractionType


def main(context):
    throw_if_missing(
        os.environ,
        [
            "DISCORD_PUBLIC_KEY",
            "DISCORD_APPLICATION_ID",
            "DISCORD_TOKEN",
        ],
    )

    if context.req.body["type"] == 1:
        context.log("Ping request - returning PONG")
        return context.res.json(
            {
                "type": InteractionResponseType.PONG,
            },
            200,
        )

    if not verify_key(
        context.req.body_binary,
        context.req.headers["x-signature-ed25519"],
        context.req.headers["x-signature-timestamp"],
        os.environ["DISCORD_PUBLIC_KEY"],
    ):
        context.error("Invalid request")
        return context.res.json({"error": "Invalid request signature"}, 401)

    context.log("Valid request")

    interaction = context.req.body

    if (interaction.type == InteractionType.APPLICATION_COMMAND) and (
        interaction.data.name == "hello"
    ):
        context.log("Matched hello command - returning message")

        return context.res.json(
            {
                "type": InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                "data": {
                    "content": "Hello World!",
                },
            },
            200
        )
