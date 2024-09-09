FROM node:20

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Angular Universal application
RUN npm run build:ssr

# Expose the port your app runs on
ENV PORT=10000
EXPOSE 10000

# Start the application
CMD ["npm", "start"]