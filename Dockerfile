FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install
RUN npm install -g @angular/cli typescript

COPY . .

RUN ng build --configuration=production
RUN tsc server.ts

CMD ["node", "server.js"]