FROM node:18

RUN mkdir /app 
ADD ./discord-bot /app/ 
WORKDIR /app

RUN npm i

CMD ["npm run start"]
