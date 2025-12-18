# Backend Dockerfile for Blockchain Voting System
FROM node:20-bullseye-slim

# Set working directory
WORKDIR /app

# Install dependencies for native modules (crypto, bcrypt, etc.)
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies (SAFE for CI/CD)
RUN npm install --legacy-peer-deps --omit=dev

# Copy application source code
COPY . .

# Create uploads directory if it doesn't exist
RUN mkdir -p uploads

# Expose backend port
EXPOSE 5000

# Set environment to production
ENV NODE_ENV=production

# Start backend
CMD ["node", "index.js"]
