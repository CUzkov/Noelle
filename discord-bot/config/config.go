package config

import (
	"discord-bot/logger"
	"encoding/json"
	"io/ioutil"
)

var (
	Config *configStruct
)

type MCServerConfig struct {
	Port int
	Name string
}

type YCServerConfig struct {
	YandexCloudServerInstaceId string
	Ip                         string
	Login                      string
	PathToPublicKey            string
	MinecraftServers           []MCServerConfig
}

type configStruct struct {
	DiscordToken           string
	DiscordClientId        string
	DiscordStatusChannelId string
	YandexCloudToken       string
	YCServers              []YCServerConfig
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
