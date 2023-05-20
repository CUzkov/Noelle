FROM node:18

RUN mkdir /app 
ADD ./discord-bot /app/ 
WORKDIR /app

RUN npm i
RUN npm install -g ts-node

CMD ["ts-node", "index.ts"]
