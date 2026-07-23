FROM node:18

WORKDIR /app
RUN npm install -g pnpm@8.15.9

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY discord-bot/package.json ./discord-bot/package.json
COPY web-site/package.json ./web-site/package.json
RUN pnpm install --frozen-lockfile

COPY . .
WORKDIR /app/discord-bot

CMD ["pnpm", "run", "start"]
