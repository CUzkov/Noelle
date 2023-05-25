FROM node:18

RUN mkdir /app
ADD . /app
WORKDIR /app/discord-bot

RUN npm install -g pnpm
RUN pnpm i
RUN pnpm install -g ts-node

CMD ["ts-node", "index.ts"]
