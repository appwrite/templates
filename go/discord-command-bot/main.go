package handler

import (
	"os"

	"github.com/open-runtimes/types-for-go/v4/openruntimes"
)

type any = map[string]interface{}

func Main(Context openruntimes.Context) openruntimes.Response {
	err := errorIfEnvMissing([]string{
		"DISCORD_PUBLIC_KEY",
		"DISCORD_APPLICATION_ID",
		"DISCORD_TOKEN",
	})
	if err != nil {
		Context.Error(err.Error())
		return Context.Res.Text("", Context.Res.WithStatusCode(500))
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
		}, Context.Res.WithStatusCode(401))
	}

	Context.Log("Valid request")

	discordBody, err := discordParseBody(Context)
	if err != nil {
		Context.Error(err.Error())
		return Context.Res.Json(any{
			"error": "Invalid body.",
		}, Context.Res.WithStatusCode(400))
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
			Context.Res.WithStatusCode(200),
		)
	}

	Context.Log("Didn't match command - returning PONG")

	return Context.Res.Json(any{"type": 1}, Context.Res.WithStatusCode(200))
}
