FROM openjdk:17-oracle

COPY ./server /usr/src/server
WORKDIR /usr/src/server
RUN chmod +x ./start.sh

EXPOSE 25565

CMD ["./start.sh"]
