package utils

import (
	"net"
	"strconv"
	"strings"
	"time"
)

// https://wiki.vg/Protocol#Handshaking
// https://github.com/FragLand/minestat/blob/master/Go/minestat/minestat.go

type minecraftServerStatus struct {
	Online          bool
	Latency         time.Duration
	Version         string
	CurrentPlayers string
	MaxPlayers     string
}

const HANDSHAKING_PACKET_ID = "\xFE"
const PING_PACKET_ID = "\x01"
const RESPONSE_DELIMETR = "\x00\x00\x00"
const RESPONSE_NUM_FIELDS int = 6

func MCServerStatus(address string, port int) minecraftServerStatus {
	result := minecraftServerStatus{
		Online:          false,
		Latency:         -1,
		Version:         "",
		CurrentPlayers: "",
		MaxPlayers:     "",
	}

	requestStartTime := time.Now()

	conn, err := net.Dial("tcp", address+":"+strconv.Itoa(port))

	result.Latency = time.Since(requestStartTime).Round(time.Millisecond)

	if err != nil {
		return result
	}

	_, err = conn.Write([]byte(HANDSHAKING_PACKET_ID + PING_PACKET_ID))

	if err != nil {
		return result
	}

	rawResponse := make([]byte, 512)

	_, err = conn.Read(rawResponse)

	conn.Close()

	if err != nil || len(rawResponse) == 0 {
		return result
	}

	response := strings.Split(string(rawResponse[:]), RESPONSE_DELIMETR)

	if len(response) >= RESPONSE_NUM_FIELDS {
		result.Online = true
		result.Version = response[2]
		result.CurrentPlayers = response[4]
		result.MaxPlayers = response[5]
	}

	return result
}
