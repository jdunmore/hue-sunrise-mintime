FROM node:14

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

CMD ["node", "--experimental-specifier-resolution=node", "-r", "dotenv/config", "app.js"]
