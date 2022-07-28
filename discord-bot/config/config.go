package config

import (
	"discord-bot/logger"
	"encoding/json"
	"io/ioutil"
)

var (
	Config *configStruct
)

type minacraftServerConfig struct {
	Ip   string
	Port int
	Name string
}

type configStruct struct {
	DiscordToken               string
	DiscordSessionId           string
	DiscordStatusChannelId     string
	YandexCloudToken           string
	YandexCloudServerInstaceId string
	MinecraftServers           []minacraftServerConfig
}

func ReadConfig() {
	logger.InfoLog.Println("reading config file")

	file, err := ioutil.ReadFile("./config.json")

	if err != nil {
		logger.ErrorLog.Fatalln("error while reading config.json")
	}

	err = json.Unmarshal(file, &Config)

	if err != nil {
		logger.ErrorLog.Fatalln("error while parsing config.json")
	}

	logger.InfoLog.Println("config file read")
}
