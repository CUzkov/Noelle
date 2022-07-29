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

var mapInstanceStatusToMessage = map[compute.Instance_Status]string{
	compute.Instance_CRASHED:            "🔴 Сервер крашнулся",
	compute.Instance_DELETING:           "🔴 Сервер удаляется",
	compute.Instance_ERROR:              "🔴 Сервер ошибся",
	compute.Instance_PROVISIONING:       "🟡 Сервер запускается",
	compute.Instance_RESTARTING:         "🟡 Сервер перезагружается",
	compute.Instance_RUNNING:            "🟢 Сервер запущен",
	compute.Instance_STARTING:           "🟡 Сервер запускается",
	compute.Instance_STOPPED:            "🔴 Сервер остановлен",
	compute.Instance_STOPPING:           "🔴 Сервер останавливается",
	compute.Instance_UPDATING:           "🟡 Сервер обновляется",
	compute.Instance_STATUS_UNSPECIFIED: "🔴 GG",
}

func getMCStatusMessage(servers *[]config.MCServerConfig, ycInstanceId string, serverIp string, isServerInstanceStop bool) ([]*discordgo.MessageSend, error) {
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
		}, isServerInstanceStop))
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

func getYCStatusMessage(server *config.YCServerConfig) ([]*discordgo.MessageSend, compute.Instance_Status, error) {
	instance, err := utils.YCInstanceInfo(server.YandexCloudServerInstaceId)

	if err != nil {
		return nil, compute.Instance_STOPPED, err
	}

	return []*discordgo.MessageSend{
		{
			Embeds: []*discordgo.MessageEmbed{
				{
					Title: "YC server status for " + server.YandexCloudServerInstaceId + " yc server",
					Thumbnail: &discordgo.MessageEmbedThumbnail{
						URL: "https://storage.yandexcloud.net/noelle/server-icon.png",
					},
					Fields: []*discordgo.MessageEmbedField{
						{
							Name:   "Status",
							Value:  mapInstanceStatusToMessage[instance.Status],
							Inline: true,
						},
						{
							Name:   "ID",
							Value:  server.YandexCloudServerInstaceId,
							Inline: true,
						},
					},
					Timestamp: time.Now().Format(time.RFC3339),
				},
			},
		},
		{
			Components: []discordgo.MessageComponent{
				discordgo.ActionsRow{
					Components: []discordgo.MessageComponent{
						components.GetYCInstanceButton(instance.Id, instance.Status),
					},
				},
			},
		},
	}, instance.Status, nil
}

func getMessagesMap() ([]*discordgo.MessageSend, error) {
	messages := []*discordgo.MessageSend{}

	for _, ycServer := range config.Config.YCServers {
		ycStatusMessage, status, err := getYCStatusMessage(&ycServer)

		if err != nil {
			return nil, err
		}

		messages = append(messages, ycStatusMessage...)

		mcStatusMessage, err := getMCStatusMessage(
			&ycServer.MinecraftServers,
			ycServer.YandexCloudServerInstaceId,
			ycServer.Ip,
			status == compute.Instance_STOPPED,
		)

		if err != nil {
			return nil, err
		}

		messages = append(messages, mcStatusMessage...)
	}

	return messages, nil
}

func StartStatusChannelUpdate() {
	for {
		time.Sleep(15 * time.Second)

		messages, err := getMessagesMap()

		if err != nil {
			logger.ErrorLog.Println(err)
			continue
		}

		statusChannelMessages, err := bot.Session.ChannelMessages(config.Config.DiscordStatusChannelId, 100, "", "", "")

		if err != nil {
			logger.ErrorLog.Println(err.Error())
			continue
		}

		if len(statusChannelMessages) != len(messages) {
			var messageIds []string

			for _, message := range statusChannelMessages {
				messageIds = append(messageIds, message.ID)
			}

			err = bot.Session.ChannelMessagesBulkDelete(config.Config.DiscordStatusChannelId, messageIds)

			if err != nil {
				logger.ErrorLog.Println(err.Error())
				continue
			}

			for _, message := range messages {
				_, err = bot.Session.ChannelMessageSendComplex(config.Config.DiscordStatusChannelId, message)

				if err != nil {
					logger.ErrorLog.Println(err.Error())
				}
			}
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
