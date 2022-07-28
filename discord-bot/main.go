package main

import (
	"discord-bot/bot"
	"discord-bot/commands"
	"discord-bot/config"
	"discord-bot/logger"
	"discord-bot/tasks"
	"os"
	"os/signal"
)

func main() {
	config.ReadConfig()
	bot.Start()
	tasks.StartTasks()
	commands.StartHandleAllCommands()

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
