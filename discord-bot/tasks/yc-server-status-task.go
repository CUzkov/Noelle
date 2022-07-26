package tasks

import (
	"discord-bot/bot"
	"discord-bot/config"
	"discord-bot/logger"
	"discord-bot/utils"
	"time"

	"github.com/bwmarrin/discordgo"
	"github.com/yandex-cloud/go-genproto/yandex/cloud/compute/v1"
)

var map_instance_status_to_message = map[compute.Instance_Status]string{
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

func ycServerStatusTask() {
	for {
		time.Sleep(30 * time.Second)

		instance, err := utils.YandexCloudServerInstanceInfo()

		if err != nil {
			logger.ErrorLog.Println(err)
			continue
		}

		_, err = bot.Client.ChannelEditComplex(config.Config.DiscordStatusChannelId, &discordgo.ChannelEdit{
			Topic: map_instance_status_to_message[instance.Status],
		})

		if err != nil {
			logger.ErrorLog.Println(err)
		}
	}
}
