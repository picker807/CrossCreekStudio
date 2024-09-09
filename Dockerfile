FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install
RUN npm install -g @angular/cli typescript

COPY . .

# Build the Angular application (including SSR)
RUN npm run build:ssr

# Compile your custom server
RUN npm run build:server

# List contents for debugging (remove this later)
RUN ls -la dist

# Start the server
CMD ["node", "dist/cross-creek-creates/server/main.js"]