FROM node:14.15.4-alpine

WORKDIR /usr/src/app

EXPOSE 8080

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

CMD ["node","dist/main"]


