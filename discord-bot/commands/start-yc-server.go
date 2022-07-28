package commands

import (
	"discord-bot/utils"

	"github.com/bwmarrin/discordgo"
	"github.com/yandex-cloud/go-genproto/yandex/cloud/compute/v1"
)

type commandInfo struct {
	fn   func(session *discordgo.Session, interaction *discordgo.InteractionCreate)
	name string
	description string
	options []*discordgo.ApplicationCommandOption
}

const START_YC_SERVER = "/start-yc-server-sad"

var startYCServerCommandInfo = commandInfo{
	fn: func(session *discordgo.Session, interaction *discordgo.InteractionCreate) {
		options := interaction.ApplicationCommandData().Options

		// fmt.Println(options[0].Name)

		if len(options) < 1 || options[0].Name != "id" {
			utils.RespondSlashCommand("id is requared", session, interaction)
			return
		}

		instance, err := utils.YandexCloudServerInstanceInfo("")

		if err != nil {
			utils.RespondSlashCommand("error the yc server status", session, interaction)
			return
		}

		if instance.Status != compute.Instance_STOPPED {
			utils.RespondSlashCommand("server already running or in intermediate state", session, interaction)
			return
		}

		err = utils.StartYandexCloudServerInstance("")

		if err != nil {
			utils.RespondSlashCommand("error starting yc server", session, interaction)
			return
		}

		utils.RespondSlashCommand("server starting, check status in \"status\" channel", session, interaction)
	},
	name: START_YC_SERVER,
	description: "start yc server (only yc, not a minecraft)",
	options: []*discordgo.ApplicationCommandOption{
		{
			Type: discordgo.ApplicationCommandOptionString,
			Name: "id",
			Description: "yc server id can be found in \"status\" channel",
			Required: true,
			Autocomplete: true,
		},
	},
}
