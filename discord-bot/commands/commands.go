package commands

import (
	"discord-bot/bot"
	"discord-bot/config"
	"discord-bot/logger"

	"github.com/bwmarrin/discordgo"
)

func StartHandleAllCommands() {
	appId := config.Config.DiscordSessionId

	commands := []commandInfo{
		startYCServerCommandInfo,
	}

	for _, command := range commands {
		bot.Session.AddHandler(command.fn)
		
		_, err := bot.Session.ApplicationCommandCreate(appId, "", &discordgo.ApplicationCommand{
			Name:          command.name,
			ID:            command.name,
			Description:   command.description,
			ApplicationID: appId,
			Type:          discordgo.ChatApplicationCommand,
			Options: 	   command.options,
		})

		if err != nil {
			logger.ErrorLog.Fatalln(err)
		}
	}

	logger.InfoLog.Println("all commands handle")
}
