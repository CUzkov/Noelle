package components

import (
	"discord-bot/config"
	"discord-bot/logger"
	"discord-bot/utils"
	"strconv"
	"strings"
	"time"

	"github.com/bwmarrin/discordgo"
)

// @FIXME make make for guilds
var timeToChangeStatus = time.Now()
var lastStatus = SERVER_INTERMEDIATE

func startMCServerComponentsHandling(session *discordgo.Session, interaction *discordgo.InteractionCreate) {
	if interaction.Type != discordgo.InteractionMessageComponent {
		return
	}

	data := interaction.MessageComponentData()

	if isCustomIdForMCServer(data.CustomID, MC_SERVER_START_PREFIX) {
		serverInfo := getMCServerInfoFromCustomId(data.CustomID, MC_SERVER_START_PREFIX)

		if time.Now().After(timeToChangeStatus) {
			lastStatus = SERVER_INTERMEDIATE
			timeToChangeStatus = time.Now().Add(4 * time.Minute)

			var (
				ycInstanceConfig      config.YCServerConfig
				ycInstanceConfigIndex int
			)
			isFound := false

			for index, instanceConfig := range config.Config.YCServers {
				if instanceConfig.YandexCloudServerInstaceId == serverInfo.YCInstanceId {
					ycInstanceConfig = instanceConfig
					ycInstanceConfigIndex = index
					isFound = true
				}
			}

			if !isFound {
				logger.ErrorLog.Println("no such yc instance")
				return
			}

			var (
				msServerConfig config.MCServerConfig
			)
			isFound = false

			for _, serverConfig := range config.Config.YCServers[ycInstanceConfigIndex].MinecraftServers {
				if serverConfig.Name == serverInfo.Name {
					msServerConfig = serverConfig
					isFound = true
				}
			}

			if !isFound {
				logger.ErrorLog.Println("no such mc server")
				return
			}

			go utils.SendSSHCommand(msServerConfig.StartCommand, &ycInstanceConfig)
		}

		session.InteractionRespond(interaction.Interaction, &discordgo.InteractionResponse{
			Type: discordgo.InteractionResponseUpdateMessage,
			Data: &discordgo.InteractionResponseData{
				Components: []discordgo.MessageComponent{
					discordgo.ActionsRow{
						Components: []discordgo.MessageComponent{
							GetMCServerButton(serverInfo, true),
						},
					},
				},
			},
		})
	}
}
