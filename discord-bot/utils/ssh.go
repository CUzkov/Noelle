package utils

import (
	"discord-bot/config"
	"discord-bot/logger"

	"github.com/melbahja/goph"
)

func SendSSHCommand(command string, serverConfig *config.YCServerConfig) error {
	auth, err := goph.Key(serverConfig.PathToPrivateKey, "")

	if err != nil {
		logger.ErrorLog.Println(err)
		return err
	}

	client, err := goph.New(serverConfig.Login, serverConfig.Ip, auth)

	if err != nil {
		logger.ErrorLog.Println(err)
		return err
	}

	defer client.Close()

	_, err = client.Run(command)

	if err != nil {
		logger.ErrorLog.Println(err)
		return err
	}

	// fmt.Println(string(out))

	return nil
}
