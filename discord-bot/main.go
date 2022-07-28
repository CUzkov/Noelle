package main

import (
	"discord-bot/bot"
	// "discord-bot/commands"
	"discord-bot/config"
	"discord-bot/logger"
	statuschannel "discord-bot/status-channel"
	"os"
	"os/signal"
)

func main() {
	config.ReadConfig()
	bot.Start()
	// commands.StartHandleAllCommands()

	go statuschannel.StartStatusChannelUpdate()

	err := bot.Session.Open()

	if err != nil {
		logger.ErrorLog.Fatalln(err)
	}

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt)
	<-stop

	bot.Session.Close()

	logger.InfoLog.Println("gracefully shutting down")
}
