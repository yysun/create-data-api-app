# Use the official Node.js 18 image as the base
FROM node:18-alpine

# Set working directory for the backend
WORKDIR /app

COPY package*.json ./
RUN npm install

# Move the app
COPY public/ ./public/
COPY api/ ./api/
COPY server.js ./

# Expose the port that your backend server uses
EXPOSE 8080

# Command to start the backend server
CMD ["node", "server.js"]
