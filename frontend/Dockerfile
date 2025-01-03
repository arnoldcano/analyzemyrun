FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies and type declarations
RUN npm install && \
    npm install --save-dev @types/react @types/react-dom @types/react-router-dom && \
    npm install @mui/material @emotion/react @emotion/styled && \
    npm install axios

# Copy the rest of the application
COPY . .

# Start the application
CMD ["npm", "start"] 