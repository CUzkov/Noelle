package main

import (
	"discord-bot/bot"
	"discord-bot/config"
	"discord-bot/tasks"
	"time"
)

func main() {
	config.ReadConfig()
	bot.Start()
	tasks.StartTasks()

	for {
		time.Sleep(100 * time.Hour)
	}
}
