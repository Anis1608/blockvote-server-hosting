# Backend Dockerfile for Blockchain Voting System
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies for native modules (required for crypto libraries)
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Create uploads directory if it doesn't exist
RUN mkdir -p uploads

# Expose the port the app runs on
EXPOSE 5000

# Set environment to production
ENV NODE_ENV=production

# Start the application
CMD ["node", "index.js"]
