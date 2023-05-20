package statuschannel

import (
	"discord-bot/bot"
	"discord-bot/components"
	"discord-bot/config"
	"discord-bot/logger"
	"discord-bot/utils"
	"strconv"
	"time"

	"github.com/bwmarrin/discordgo"
	"github.com/yandex-cloud/go-genproto/yandex/cloud/compute/v1"
)

func getMCStatusMessage(servers *[]config.MCServerConfig, ycInstanceId string, serverIp string, isServerInstanceRunning bool) ([]*discordgo.MessageSend, error) {
	statusMessageFields := []*discordgo.MessageEmbedField{}
	mcButtons := []discordgo.MessageComponent{}

	for _, server := range *servers {
		status := utils.MCServerStatus(serverIp, server.Port)

		var (
			online             string
			players            string
			statusForComponent = components.SERVER_INTERMEDIATE
		)

		if status.Online {
			online = "online"
			players = utils.ClearString(status.CurrentPlayers + " / " + status.MaxPlayers)
			statusForComponent = components.SERVER_RUNNING
		} else {
			online = "offline"
			players = "- / -"
			statusForComponent = components.SERVER_STOP
		}

		statusMessageFields = append(statusMessageFields, &discordgo.MessageEmbedField{
			Name:  server.Name,
			Value: online,
		})

		statusMessageFields = append(statusMessageFields, &discordgo.MessageEmbedField{
			Name:   "Players",
			Value:  players,
			Inline: true,
		})

		statusMessageFields = append(statusMessageFields, &discordgo.MessageEmbedField{
			Name:   "Port/Ip",
			Value:  serverIp + ":" + strconv.Itoa(server.Port),
			Inline: true,
		})

		mcButtons = append(mcButtons, components.GetMCServerButton(&components.McServerInfo{
			Name:         server.Name,
			Status:       statusForComponent,
			YCInstanceId: ycInstanceId,
		}, isServerInstanceRunning))
	}

	return []*discordgo.MessageSend{
		{
			Embeds: []*discordgo.MessageEmbed{
				{
					Title: "Minecraft server statuses for " + ycInstanceId + " yc server",
					Thumbnail: &discordgo.MessageEmbedThumbnail{
						URL: "https://storage.yandexcloud.net/noelle/server-icon.png",
					},
					Fields:    statusMessageFields,
					Timestamp: time.Now().Format(time.RFC3339),
				},
			},
		},
		{
			Components: []discordgo.MessageComponent{
				discordgo.ActionsRow{
					Components: mcButtons,
				},
			},
		},
	}, nil
}

func getMessagesMap() ([]*discordgo.MessageSend, error) {
	messages := []*discordgo.MessageSend{}

	for _, ycServer := range config.Config.YCServers {
		ycStatusMessage, status, err := getYCStatusMessage(&ycServer)

		if err != nil {
			return nil, err
		}

		mcStatusMessage, err := getMCStatusMessage(
			&ycServer.MinecraftServers,
			ycServer.YandexCloudServerInstaceId,
			ycServer.Ip,
			status == compute.Instance_RUNNING,
		)

		if err != nil {
			return nil, err
		}

		messages = append(messages, mcStatusMessage...)
		messages = append(messages, ycStatusMessage...)
	}

	return messages, nil
}

func StartStatusChannelUpdate() {
	for {

		if len(statusChannelMessages) != len(messages) {

		} else {
			for index, message := range messages {
				_, err := bot.Session.ChannelMessageEditComplex(&discordgo.MessageEdit{
					ID:         statusChannelMessages[len(messages)-index-1].ID,
					Components: message.Components,
					Embeds:     message.Embeds,
					Embed:      message.Embed,
					Channel:    config.Config.DiscordStatusChannelId,
				})

				if err != nil {
					logger.ErrorLog.Println(err.Error())
				}
			}
		}
	}
}
