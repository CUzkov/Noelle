package commands

import (
	"discord-bot/utils"

	"github.com/bwmarrin/discordgo"
	"github.com/yandex-cloud/go-genproto/yandex/cloud/compute/v1"
)

type commandInfo struct {
	fn   func(session *discordgo.Session, interaction *discordgo.InteractionCreate)
	name string
}

const START_YC_SERVER = "/start-yc-server"

var startYCServerCommandInfo = commandInfo{
	fn: func(session *discordgo.Session, interaction *discordgo.InteractionCreate) {
		instance, err := utils.YandexCloudServerInstanceInfo()

		if err != nil {
			utils.RespondSlashCommand("error the yc server status", session, interaction)
			return
		}

		if instance.Status != compute.Instance_STOPPED {
			utils.RespondSlashCommand("server already running or in intermediate state", session, interaction)
			return
		}

		err = utils.StartYandexCloudServerInstance()

		if err != nil {
			utils.RespondSlashCommand("error starting yc server", session, interaction)
			return
		}

		utils.RespondSlashCommand("server starting, check status in \"status\" channel", session, interaction)
	},
	name: START_YC_SERVER,
}
