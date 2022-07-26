package utils

import (
	"strings"
	"unicode"
)

func ClearString(value string) string {
	return strings.Map(func(r rune) rune {
		if unicode.IsPrint(r) {
			return r
		}
		return -1
	}, value)
}
