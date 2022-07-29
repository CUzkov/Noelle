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

const MC_SERVER_START_PREFIX = "MC-INSTANCE-START-"
const MC_SERVER_STOP_PREFIX = "MC-INSTANCE-STOP-"

const SERVER_RUNNING = "SERVER_RUNNING"
const SERVER_STOP = "SERVER_STOP"
const SERVER_INTERMEDIATE = "SERVER_INTERMEDIATE"

// @FIXME make make for guilds
var timeToChangeStatus = time.Now()
var lastStatus = SERVER_INTERMEDIATE

type McServerInfo struct {
	Name         string
	Status       string
	YCInstanceId string
}

func getMCCustomIdFromServerInfo(serverInfo *McServerInfo, prefix string) string {
	return prefix + strings.Join([]string{serverInfo.Name, serverInfo.Status, serverInfo.YCInstanceId}, "~")
}

func getMCServerInfoFromCustomId(customId string, prefix string) *McServerInfo {
	splittedStr := strings.Split(strings.ReplaceAll(customId, prefix, ""), "~")
	return &McServerInfo{
		Name:         splittedStr[0],
		Status:       splittedStr[1],
		YCInstanceId: splittedStr[2],
	}
}

func isCustomIdForMCServer(customId string, prefix string) bool {
	return strings.HasPrefix(customId, prefix)
}

func GetMCServerButton(serverInfo *McServerInfo) *discordgo.Button {
	status := serverInfo.Status
	timeToPrint := ""

	if time.Now().Before(timeToChangeStatus) {
		status = lastStatus
		duration := time.Until(timeToChangeStatus)
		timeToPrint = ". TTReap " + strconv.Itoa(int(duration.Seconds())) + " с"
	} else {
		lastStatus = serverInfo.Status
	}

	if status == SERVER_RUNNING {
		return &discordgo.Button{
			Label:    "остановить сервер " + serverInfo.Name,
			CustomID: getMCCustomIdFromServerInfo(serverInfo, MC_SERVER_STOP_PREFIX),
			Style:    discordgo.PrimaryButton,
			Disabled: true,
		}
	}

	if status == SERVER_INTERMEDIATE {
		return &discordgo.Button{
			Label:    "сервер " + serverInfo.Name + " запускается " + timeToPrint,
			CustomID: getMCCustomIdFromServerInfo(serverInfo, ""),
			Style:    discordgo.PrimaryButton,
			Disabled: true,
		}
	}

	if status == SERVER_STOP {
		return &discordgo.Button{
			Label:    "запустить сервер " + serverInfo.Name,
			CustomID: getMCCustomIdFromServerInfo(serverInfo, MC_SERVER_START_PREFIX),
			Style:    discordgo.PrimaryButton,
		}
	}

	return &discordgo.Button{
		Label:    "сервер " + serverInfo.Name + " чиллит",
		CustomID: getMCCustomIdFromServerInfo(serverInfo, ""),
		Style:    discordgo.PrimaryButton,
		Disabled: true,
	}
}

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
							GetMCServerButton(serverInfo),
						},
					},
				},
			},
		})
	}
}
