FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install
RUN npm install -g @angular/cli typescript

COPY . .

RUN npm run build:ssr

ENV PORT=10000
EXPOSE 10000

CMD ["npm", "start"]