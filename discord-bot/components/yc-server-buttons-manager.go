package components

import (
	"discord-bot/logger"
	"discord-bot/utils"
	"strings"

	"github.com/bwmarrin/discordgo"
	"github.com/yandex-cloud/go-genproto/yandex/cloud/compute/v1"
)

const YC_INSTANCE_START_PREFIX = "YC-INSTANCE-START-"
const YC_INSTANCE_STOP_PREFIX = "YC-INSTANCE-STOP-"

func getYCCustomIdFromInstanceId(instanceId string, prefix string) string {
	return prefix + instanceId
}

func getYCInstanceIdFromCustomId(customId string, prefix string) string {
	return strings.ReplaceAll(customId, prefix, "")
}

func isCustomIdForYCInstance(customId string, prefix string) bool {
	return strings.HasPrefix(customId, prefix)
}

func GetYCInstanceButton(instanceId string, status compute.Instance_Status) *discordgo.Button {
	if status == compute.Instance_STOPPED {
		return &discordgo.Button{
			Label:    "запустить сервер с id=" + instanceId,
			CustomID: getYCCustomIdFromInstanceId(instanceId, YC_INSTANCE_START_PREFIX),
			Style:    discordgo.PrimaryButton,
		}
	}

	if status == compute.Instance_RUNNING {
		return &discordgo.Button{
			Label:    "остановить сервер с id=" + instanceId,
			CustomID: getYCCustomIdFromInstanceId(instanceId, YC_INSTANCE_STOP_PREFIX),
			Style:    discordgo.PrimaryButton,
			Disabled: true,
		}
	}

	if status == compute.Instance_STARTING {
		return &discordgo.Button{
			Label:    "сервер с id=" + instanceId + " запускается",
			CustomID: getYCCustomIdFromInstanceId(instanceId, ""),
			Style:    discordgo.PrimaryButton,
			Disabled: true,
		}
	}

	if status == compute.Instance_STOPPING {
		return &discordgo.Button{
			Label:    "сервер с id=" + instanceId + " останавливается",
			CustomID: getYCCustomIdFromInstanceId(instanceId, ""),
			Style:    discordgo.PrimaryButton,
			Disabled: true,
		}
	}

	return &discordgo.Button{
		Label:    "сервер с id=" + instanceId + " чиллит",
		CustomID: getYCCustomIdFromInstanceId(instanceId, ""),
		Style:    discordgo.PrimaryButton,
		Disabled: true,
	}
}

func startYCServerCommandInfo(session *discordgo.Session, interaction *discordgo.InteractionCreate) {
	if interaction.Type != discordgo.InteractionMessageComponent {
		return
	}

	data := interaction.MessageComponentData()

	if isCustomIdForYCInstance(data.CustomID, YC_INSTANCE_START_PREFIX) {
		instanceId := getYCInstanceIdFromCustomId(data.CustomID, YC_INSTANCE_START_PREFIX)

		instance, err := utils.YCInstanceInfo(instanceId)

		if err != nil && instance.Status != compute.Instance_STOPPED {
			logger.ErrorLog.Println(err)
			return
		}

		err = utils.StartYCInstance(instanceId)

		if err != nil {
			logger.ErrorLog.Println(err)
			return
		}

		session.InteractionRespond(interaction.Interaction, &discordgo.InteractionResponse{
			Type: discordgo.InteractionResponseUpdateMessage,
			Data: &discordgo.InteractionResponseData{
				Components: []discordgo.MessageComponent{
					discordgo.ActionsRow{
						Components: []discordgo.MessageComponent{
							GetYCInstanceButton(instance.Id, compute.Instance_STARTING),
						},
					},
				},
			},
		})
	}
}
