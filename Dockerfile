ARG ARCH=linux/amd64
FROM --platform=${ARCH} node:14

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

CMD ["node", "--experimental-specifier-resolution=node", "-r", "dotenv/config", "app.js"]

 # 30 docker build -t jdunmore/hue-api .
 # 31 docker build -t jdunmore/hue-api .
 # 32 docker build -t jdunmore/hue-api .
 # 33 docker buildz build --push --platform linux/arm64/v8,linux/amd64 -- tag jdunmore/hue-api:latest .
 # 34 docker buildx build --push --platform linux/arm64/v8,linux/amd64 -- tag jdunmore/hue-api:latest .
 # 35 docker buildx build --push --platform linux/arm64/v8,linux/amd64 --tag jdunmore/hue-api:latest .