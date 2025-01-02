FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with legacy peer deps to handle React 18 compatibility
RUN npm install --legacy-peer-deps

# Copy the rest of the application
COPY . .

# Expose port 3000
EXPOSE 3000

# Start the app in development mode
CMD ["npm", "start"] 