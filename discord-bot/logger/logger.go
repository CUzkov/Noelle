package logger

import (
	"log"
	"os"
)

var InfoLog = log.New(os.Stdout, "INFO\t", log.Ldate|log.Ltime)
var ErrorLog = log.New(os.Stderr, "ERROR\t", log.Ldate|log.Ltime|log.Lshortfile)
