FROM node:18 as build-stage

WORKDIR /app
RUN npm install -g pnpm@8.15.9

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY discord-bot/package.json ./discord-bot/package.json
COPY web-site/package.json ./web-site/package.json
RUN pnpm install --frozen-lockfile

COPY . .
WORKDIR /app/web-site
RUN pnpm run build
RUN mkdir /app/build
RUN mv ./build/* /app/build

FROM nginx:1.19.6

RUN rm -rf /usr/share/nginx/html/*

COPY --from=build-stage /app/build /usr/share/nginx/html
RUN chown nginx:nginx /usr/share/nginx/html/*
COPY ./web-site/nginx.conf /etc/nginx/nginx.conf

CMD ["nginx", "-g", "daemon off;"]
