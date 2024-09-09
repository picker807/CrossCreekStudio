FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install
RUN npm install -g @angular/cli typescript

COPY . .

RUN npm run build:ssr

EXPOSE 8080

CMD ["npm", "start"]