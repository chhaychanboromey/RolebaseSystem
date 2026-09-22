# Use official Node.js LTS image
FROM node:24-alpine

# Set working directory inside container
WORKDIR /app

# Copy package files first (for caching)
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy rest of the app code
COPY . .

# Expose the port your app runs on
EXPOSE 5002

# Command to run the app
CMD ["node", "index.js"]