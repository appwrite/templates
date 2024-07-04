package handler

import (
	"os"

	"github.com/open-runtimes/types-for-go/v4"
)

type any = map[string]interface{}

func Main(Context *types.Context) types.ResponseOutput {
	err := errorIfEnvMissing([]string{
		"DISCORD_PUBLIC_KEY",
		"DISCORD_APPLICATION_ID",
		"DISCORD_TOKEN",
	})
	if err != nil {
		Context.Error(err.Error())
		return Context.Res.Text("", 500, nil)
	}

	err = discordVerifyKey(
		Context.Req.BodyText(),
		Context.Req.Headers["x-signature-ed25519"],
		Context.Req.Headers["x-signature-timestamp"],
		os.Getenv("DISCORD_PUBLIC_KEY"),
	)
	if err != nil {
		Context.Error(err.Error())
		return Context.Res.Json(any{
			"error": "Invalid request signature.",
		}, 401, nil)
	}

	Context.Log("Valid request")

	discordBody, err := discordParseBody(Context)
	if err != nil {
		Context.Error(err.Error())
		return Context.Res.Json(any{
			"error": "Invalid body.",
		}, 400, nil)
	}

	ApplicationCommandType := 2
	if discordBody.Type == ApplicationCommandType && discordBody.Data.Name == "hello" {
		Context.Log("Matched hello command - returning message")

		channelMessageWithSource := 4
		return Context.Res.Json(
			any{
				"type": channelMessageWithSource,
				"data": any{
					"content": "Hello, World!",
				},
			},
			200,
			nil,
		)
	}

	Context.Log("Didn't match command - returning PONG")

	return Context.Res.Json(any{"type": 1}, 200, nil)
}
