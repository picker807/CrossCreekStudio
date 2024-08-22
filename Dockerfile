# Use an official Node.js runtime as a parent image
FROM node:19

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Install Angular CLI globally
RUN npm install -g @angular/cli

# Copy the rest of the application code
COPY . .

# Build the Angular application with verbose logging
RUN ng build --prod --verbose

# Expose the port the app runs on
EXPOSE 8080

# Start the Node.js server
CMD ["node", "server.ts"]