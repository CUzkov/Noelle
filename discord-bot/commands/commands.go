package commands

import (
	"discord-bot/bot"
	"discord-bot/config"
	"discord-bot/logger"

	"github.com/bwmarrin/discordgo"
)

type commandInfo struct {
	fn          func(session *discordgo.Session, interaction *discordgo.InteractionCreate)
	name        string
	description string
	options     []*discordgo.ApplicationCommandOption
}

func StartHandleAllCommands() {
	appId := config.Config.DiscordClientId

	commmandsForDelete, err := bot.Session.ApplicationCommands(appId, "")

	if err != nil {
		logger.ErrorLog.Fatalln(err)
	}

	for _, command := range commmandsForDelete {
		err := bot.Session.ApplicationCommandDelete(appId, "", command.ID)

		if err != nil {
			logger.ErrorLog.Fatalln(err)
		}
	}

	commands := []commandInfo{}

	bot.Session.Identify.Intents = discordgo.IntentsAllWithoutPrivileged

	for _, command := range commands {
		bot.Session.AddHandler(command.fn)

		_, err := bot.Session.ApplicationCommandCreate(appId, "", &discordgo.ApplicationCommand{
			Name:          command.name,
			Description:   command.description,
			ApplicationID: appId,
			Type:          discordgo.ChatApplicationCommand,
			Options:       command.options,
		})

		if err != nil {
			logger.ErrorLog.Fatalln(err)
		}
	}

	logger.InfoLog.Println("all commands handle")
}
