package bot

import (
	"discord-bot/config"
	"discord-bot/logger"

	"github.com/bwmarrin/discordgo"
)

var Session *discordgo.Session

func Start() {

	bot, err := discordgo.New("Bot " + config.Config.DiscordToken)

	if err != nil {
		logger.ErrorLog.Fatalln(err.Error())
	}

	Session = bot

	logger.InfoLog.Println("bot is running")
}
