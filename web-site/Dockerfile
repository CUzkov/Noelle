FROM node:18 as build-stage

RUN mkdir /app
ADD . /app
WORKDIR /app/web-site

RUN npm install -g pnpm
RUN pnpm i
RUN pnpm run build
RUN mkdir /app/build
RUN mv ./build/* /app/build

FROM nginx:1.19.6

RUN rm -rf /usr/share/nginx/html/*

COPY --from=build-stage /app/build /usr/share/nginx/html
RUN chown nginx:nginx /usr/share/nginx/html/*
COPY ./web-site/nginx.conf /etc/nginx/nginx.conf

CMD ["nginx", "-g", "daemon off;"]
