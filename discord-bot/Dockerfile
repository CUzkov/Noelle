FROM node:18

RUN mkdir /app
ADD . /app
WORKDIR /app/discord-bot

RUN npm install -g pnpm
RUN pnpm i

CMD ["pnpm", "run", "start"]
