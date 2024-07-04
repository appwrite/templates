package main

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"
	"strings"
)

func main() {
	err := errorIfEnvMissing([]string{
		"DISCORD_PUBLIC_KEY",
		"DISCORD_APPLICATION_ID",
		"DISCORD_TOKEN",
	})
	if err != nil {
		panic(err)
	}

	registerApi := "https://discord.com/api/v9/applications/" + os.Getenv("DISCORD_APPLICATION_ID") + "/commands"

	bodyJson := map[string]string{"name": "hello", "description": "Hello World Command"}
	bodyString, err := json.Marshal(bodyJson)
	if err != nil {
		panic(err)
	}

	req, err := http.NewRequest("POST", registerApi, bytes.NewBuffer(bodyString))
	if err != nil {
		panic(err)
	}

	req.Header.Set("Authorization", "Bot "+os.Getenv("DISCORD_TOKEN"))
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}

	defer resp.Body.Close()

	fmt.Println("Command registered successfully")
}

func errorIfEnvMissing(keys []string) error {
	missing := []string{}

	for _, key := range keys {
		if os.Getenv(key) == "" {
			missing = append(missing, key)
		}
	}

	if len(missing) > 0 {
		return errors.New("Missing required fields: " + strings.Join(missing, ", "))
	}

	return nil
}
