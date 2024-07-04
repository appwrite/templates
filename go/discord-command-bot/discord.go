package handler

import (
	"bytes"
	"crypto/ed25519"
	"encoding/hex"
	"encoding/json"
	"errors"
	"io"
	"strings"

	"github.com/open-runtimes/types-for-go/v4"
)

type DiscordBodyData struct {
	Name string `json:"name"`
}

type DiscordBody struct {
	Type int             `json:"type"`
	Data DiscordBodyData `json:"data"`
}

func discordParseBody(Context *types.Context) (DiscordBody, error) {
	var body DiscordBody

	err := json.Unmarshal(Context.Req.BodyBinary(), &body)
	if err != nil {
		return DiscordBody{}, err
	}

	return body, nil
}

func discordVerifyKey(body string, signature string, timestamp string, discordPublicKey string) error {
	var msg bytes.Buffer

	if signature == "" || timestamp == "" || discordPublicKey == "" {
		return errors.New("payload or headers missing")
	}

	bytesKey, err := hex.DecodeString(discordPublicKey)
	if err != nil {
		return err
	}

	shaKey := ed25519.PublicKey(bytesKey)

	bytesSignature, err := hex.DecodeString(signature)
	if err != nil {
		return err
	}

	if len(bytesSignature) != ed25519.SignatureSize || bytesSignature[63]&224 != 0 {
		return errors.New("invalid signature key")
	}

	msg.WriteString(timestamp)

	bodyReader := strings.NewReader(body)

	var bodyBoffer bytes.Buffer

	_, err = io.Copy(&msg, io.TeeReader(bodyReader, &bodyBoffer))
	if err != nil {
		return err
	}

	success := ed25519.Verify(shaKey, msg.Bytes(), bytesSignature)

	if !success {
		return errors.New("invalid body")
	}

	return nil
}
