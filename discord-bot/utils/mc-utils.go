package utils

import (
	"net"
	"strconv"
	"strings"
	"time"
)

// https://wiki.vg/Protocol#Handshaking
// https://github.com/FragLand/minestat/blob/master/Go/minestat/minestat.go

type MCServerStatus struct {
	Online          bool
	Latency         time.Duration
	Version         string
	Current_players string
	Max_players     string
}

const HANDSHAKING_PACKET_ID = "\xFE"
const PING_PACKET_ID = "\x01"
const RESPONSE_DELIMETR = "\x00\x00\x00"
const RESPONSE_NUM_FIELDS int = 6

func MinecraftServerStatus(address string, port int) MCServerStatus {
	result := MCServerStatus{
		Online:          false,
		Latency:         -1,
		Version:         "",
		Current_players: "",
		Max_players:     "",
	}

	request_start_time := time.Now()

	conn, err := net.Dial("tcp", address+":"+strconv.Itoa(port))

	result.Latency = time.Since(request_start_time).Round(time.Millisecond)

	if err != nil {
		return result
	}

	_, err = conn.Write([]byte(HANDSHAKING_PACKET_ID + PING_PACKET_ID))

	if err != nil {
		return result
	}

	raw_response := make([]byte, 512)

	_, err = conn.Read(raw_response)

	conn.Close()

	if err != nil || len(raw_response) == 0 {
		return result
	}

	response := strings.Split(string(raw_response[:]), RESPONSE_DELIMETR)

	if len(response) >= RESPONSE_NUM_FIELDS {
		result.Online = true
		result.Version = response[2]
		result.Current_players = response[4]
		result.Max_players = response[5]
	}

	return result
}
