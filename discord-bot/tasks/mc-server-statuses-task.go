package tasks

import (
	"discord-bot/bot"
	"discord-bot/config"
	"discord-bot/logger"
	"discord-bot/utils"
	"strconv"
	"time"

	"github.com/bwmarrin/discordgo"
)

func mcServerStatusesTask() {
	for {
		time.Sleep(5 * time.Second)

		var statusMessageFields []*discordgo.MessageEmbedField

		for _, server := range config.Config.MinecraftServers {
			status := utils.MCServerStatus(server.Ip, server.Port)

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
				Value:  server.Ip + ":" + strconv.Itoa(server.Port),
				Inline: true,
			})
		}

		statusMessage := discordgo.MessageEmbed{
			Title: "Server statuses",
			Thumbnail: &discordgo.MessageEmbedThumbnail{
				URL: "https://storage.yandexcloud.net/noelle/server-icon.png",
			},
			Fields:    statusMessageFields,
			Timestamp: time.Now().Format(time.RFC3339),
		}

		statusChannelMessages, err := bot.Session.ChannelMessages(config.Config.DiscordStatusChannelId, 100, "", "", "")

		if err != nil {
			logger.ErrorLog.Println(err.Error())
			continue
		}

		if len(statusChannelMessages) != 2 {
			var messageIds []string

			for _, message := range statusChannelMessages {
				messageIds = append(messageIds, message.ID)
			}

			err = bot.Session.ChannelMessagesBulkDelete(config.Config.DiscordStatusChannelId, messageIds)

			if err != nil {
				logger.ErrorLog.Println(err.Error())
				continue
			}

			_, err = bot.Session.ChannelMessageSendEmbed(config.Config.DiscordStatusChannelId, &statusMessage)

			if err != nil {
				logger.ErrorLog.Println(err.Error())
				continue
			}

			_, err = bot.Session.ChannelMessageSend(config.Config.DiscordStatusChannelId, "status")

			if err != nil {
				logger.ErrorLog.Println(err.Error())
				continue
			}
		} else {
			statusMessageId := statusChannelMessages[1].ID

			_, err := bot.Session.ChannelMessageEditEmbed(config.Config.DiscordStatusChannelId, statusMessageId, &statusMessage)

			if err != nil {
				logger.ErrorLog.Println(err.Error())
				continue
			}
		}
	}
}
