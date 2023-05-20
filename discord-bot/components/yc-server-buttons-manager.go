package components

import (
	"discord-bot/logger"
	"discord-bot/utils"
	"strings"

	"github.com/bwmarrin/discordgo"
	"github.com/yandex-cloud/go-genproto/yandex/cloud/compute/v1"
)

func startYCInstanceComponentsHandling(session *discordgo.Session, interaction *discordgo.InteractionCreate) {
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
