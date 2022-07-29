FROM golang:1.18.4

RUN mkdir /app 
ADD ./discord-bot /app/ 
WORKDIR /app

RUN mkdir /root && mkdir /root/.ssh
RUN cp ./known_hosts /root/.ssh/known_hosts

RUN go build -o main . 
CMD ["/app/main"]
