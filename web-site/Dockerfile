FROM node:18 as build-stage

WORKDIR /app

ADD ../ /app

RUN npm install -g pnpm
RUN pnpm i
RUN cd ./web-site && pnpm run build
RUN mkdir /app/build
RUN cd ./web-site/build && mv * /app/build

FROM nginx:1.19.6

RUN rm -rf /usr/share/nginx/html/*

COPY --from=build-stage /app/build /usr/share/nginx/html
COPY ./frontend/nginx.conf /etc/nginx/nginx.conf

CMD ["nginx", "-g", "daemon off;"]