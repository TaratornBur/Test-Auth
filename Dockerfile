# Use the official lightweight Node.js 12 image version 12.18-slim.
# https://hub.docker.com/_/node
FROM node:alpine3.18 AS Build

# Create and change to the app directory.
WORKDIR /usr/src/app

ARG NODE_ENV=production
ENV NODe_ENV=${NODE_ENV}

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure both package.json AND package-lock.json are copied.
# Copying this separately prevents re-running npm install on every code change.
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy local code to the container image.
COPY . ./

# Build the application
RUN npm run build

EXPOSE 3000

# Run the web service on container startup.
CMD [ "npm", "run", "start:prod" ]