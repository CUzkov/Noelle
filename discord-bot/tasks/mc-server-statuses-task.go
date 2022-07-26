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

		var status_message_fields []*discordgo.MessageEmbedField

		for _, server := range config.Config.MinecraftServers {
			status := utils.MinecraftServerStatus(server.Ip, server.Port)

			var (
				online  string
				players string
			)

			if status.Online {
				online = "online"
				players = utils.ClearString(status.Current_players + " / " + status.Max_players)
			} else {
				online = "offline"
				players = "- / -"
			}

			status_message_fields = append(status_message_fields, &discordgo.MessageEmbedField{
				Name:  server.Name,
				Value: online,
			})

			status_message_fields = append(status_message_fields, &discordgo.MessageEmbedField{
				Name:   "Players",
				Value:  players,
				Inline: true,
			})

			status_message_fields = append(status_message_fields, &discordgo.MessageEmbedField{
				Name:   "Port/Ip",
				Value:  server.Ip + ":" + strconv.Itoa(server.Port),
				Inline: true,
			})
		}

		status_message := discordgo.MessageEmbed{
			Title: "Server statuses",
			Thumbnail: &discordgo.MessageEmbedThumbnail{
				URL: "https://storage.yandexcloud.net/noelle/server-icon.png",
			},
			Fields:    status_message_fields,
			Timestamp: time.Now().Format(time.RFC3339),
		}

		status_channel_messages, err := bot.Client.ChannelMessages(config.Config.DiscordStatusChannelId, 100, "", "", "")

		if err != nil {
			logger.ErrorLog.Println(err.Error())
			continue
		}

		if len(status_channel_messages) != 2 {
			var message_ids []string

			for _, message := range status_channel_messages {
				message_ids = append(message_ids, message.ID)
			}

			err = bot.Client.ChannelMessagesBulkDelete(config.Config.DiscordStatusChannelId, message_ids)

			if err != nil {
				logger.ErrorLog.Println(err.Error())
				continue
			}

			_, err = bot.Client.ChannelMessageSendEmbed(config.Config.DiscordStatusChannelId, &status_message)

			if err != nil {
				logger.ErrorLog.Println(err.Error())
				continue
			}

			_, err = bot.Client.ChannelMessageSend(config.Config.DiscordStatusChannelId, "status")

			if err != nil {
				logger.ErrorLog.Println(err.Error())
				continue
			}
		} else {
			status_message_id := status_channel_messages[1].ID

			_, err := bot.Client.ChannelMessageEditEmbed(config.Config.DiscordStatusChannelId, status_message_id, &status_message)

			if err != nil {
				logger.ErrorLog.Println(err.Error())
				continue
			}
		}
	}
}
