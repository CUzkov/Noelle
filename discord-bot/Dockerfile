FROM golang:1.18.4

RUN mkdir /app 
ADD ./discord-bot /app/ 
WORKDIR /app

RUN go build -o main . 
CMD ["/app/main"]
