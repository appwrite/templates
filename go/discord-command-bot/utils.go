package handler

import (
	"errors"
	"os"
	"strings"
)

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
