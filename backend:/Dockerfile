FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"]
