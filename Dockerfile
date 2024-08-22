# Use an official Node.js 18 runtime as a parent image
FROM node:20

# Set the working directory in the container to the root of the project
WORKDIR /

# Copy package.json and package-lock.json to the root
COPY package*.json ./

# Install dependencies
RUN npm install

# Install Angular CLI globally
RUN npm install -g @angular/cli

# Copy the rest of the application code to the root
COPY . .

# Set the working directory to the app directory
WORKDIR /src/app

# Build the Angular application
RUN ng build --prod

# Expose the port the app runs on
EXPOSE 8080

# Start the Node.js server
CMD ["node", "server.ts"]