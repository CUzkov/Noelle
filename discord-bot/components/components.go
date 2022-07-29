package components

import (
	"discord-bot/bot"
	"discord-bot/logger"

	"github.com/bwmarrin/discordgo"
)

func StartHandleAllComponents() {
	commands := []func(session *discordgo.Session, interaction *discordgo.InteractionCreate){
		startYCServerCommandInfo,
	}

	bot.Session.Identify.Intents = discordgo.IntentsAllWithoutPrivileged

	for _, command := range commands {
		bot.Session.AddHandler(command)
	}

	logger.InfoLog.Println("all components handle")
}
