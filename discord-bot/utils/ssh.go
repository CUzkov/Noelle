package utils

import (
	"discord-bot/config"

	"golang.org/x/crypto/ssh"
)

func SendSSHCommand(command string, serverConfig config.YCServerConfig) error {
	var hostKey ssh.PublicKey

	config := &ssh.ClientConfig{
		User: "username",
		Auth: []ssh.AuthMethod{
			ssh.Password(""),
		},
		HostKeyCallback: ssh.FixedHostKey(hostKey),
	}

	client, err := ssh.Dial("tcp", "yourserver.com:22", config)
	if err != nil {
		return err
	}
	defer client.Close()

	return nil
}
