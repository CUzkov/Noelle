package statuschannel

import (
	"discord-bot/bot"
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

func getMCStatusMessage(servers *[]config.MCServerConfig, ycInstanceName string, serverIp string) (*discordgo.MessageEmbed, error) {
	statusMessageFields := []*discordgo.MessageEmbedField{}

	for _, server := range *servers {
		status := utils.MCServerStatus(serverIp, server.Port)

		var (
			online  string
			players string
		)

		if status.Online {
			online = "online"
			players = utils.ClearString(status.CurrentPlayers + " / " + status.MaxPlayers)
		} else {
			online = "offline"
			players = "- / -"
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
	}

	return &discordgo.MessageEmbed{
		Title: "Minecraft server statuses for " + ycInstanceName + " yc server",
		Thumbnail: &discordgo.MessageEmbedThumbnail{
			URL: "https://storage.yandexcloud.net/noelle/server-icon.png",
		},
		Fields:    statusMessageFields,
		Timestamp: time.Now().Format(time.RFC3339),
	}, nil
}

func getYCStatusMessage(server *config.YCServerConfig) (*discordgo.MessageEmbed, error) {
	instance, err := utils.YandexCloudServerInstanceInfo(server.YandexCloudServerInstaceId)

	if err != nil {
		return nil, err
	}

	return &discordgo.MessageEmbed{
		Title: "YC server status for " + server.YandexCloudServerInstaceId + " yc server",
		Thumbnail: &discordgo.MessageEmbedThumbnail{
			URL: "https://storage.yandexcloud.net/noelle/server-icon.png",
		},
		Fields: []*discordgo.MessageEmbedField{
			{
				Name:  "Status",
				Value: mapInstanceStatusToMessage[instance.Status],
				Inline: true,
			},
			{
				Name:  "ID",
				Value: server.YandexCloudServerInstaceId,
				Inline: true,
			},
		},
		Timestamp: time.Now().Format(time.RFC3339),
	}, nil
}

func getMessagesMap() ([]*discordgo.MessageEmbed, error) {
	messages := []*discordgo.MessageEmbed{}

	for _, ycServer := range config.Config.YCServers {
		mcStatusMessage, err := getMCStatusMessage(&ycServer.MinecraftServers, ycServer.YandexCloudServerInstaceId, ycServer.Ip)

		if err != nil {
			return nil, err
		}

		messages = append(messages, mcStatusMessage)

		ycStatusMessage, err := getYCStatusMessage(&ycServer)

		if err != nil {
			return nil, err
		}

		messages = append(messages, ycStatusMessage)
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
				_, err = bot.Session.ChannelMessageSendEmbed(config.Config.DiscordStatusChannelId, message)

				if err != nil {
					logger.ErrorLog.Println(err.Error())
				}
			}
		} else {
			for index, message := range messages {
				_, err := bot.Session.ChannelMessageEditEmbed(config.Config.DiscordStatusChannelId, statusChannelMessages[len(messages)-index-1].ID, message)

				if err != nil {
					logger.ErrorLog.Println(err.Error())
				}
			}
		}
	}
}
