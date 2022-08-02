FROM golang:1.18.4

RUN mkdir /app 
ADD ./discord-bot /app/ 
WORKDIR /app

RUN mkdir /root/.ssh
RUN cp ./known_hosts /root/.ssh/known_hosts
RUN cp ./minecraft-server-key /root/.ssh/minecraft-server-key

RUN go build -o main . 
CMD ["/app/main"]
