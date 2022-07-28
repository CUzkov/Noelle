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
		bot.Session.ApplicationCommandCreate(appId, "", &discordgo.ApplicationCommand{
			Name:          command.name,
			ID:            command.name,
			Description:   "start yc server (only yc, not a minecraft)",
			ApplicationID: appId,
			Type:          discordgo.ChatApplicationCommand,
		})
	}

	logger.InfoLog.Println("all commands handle")
}
