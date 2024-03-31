FROM node:18-alpine as builder
# Set the working directory inside the container
WORKDIR /app
# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./
# Install app dependencies from package-lock.json file
RUN npm ci
# Copy the rest of our app's source code into the container
COPY . .
# Build the TypeScript code
RUN npm run build
# Use a new stage to create a smaller image without the TypeScript source code
FROM node:18-alpine as production
# Install only production dependencies
ENV NODE_ENV=prod
# Set the working directory inside the container
WORKDIR /app
# Copy package.json and package-lock.json to the new stage
COPY package*.json ./
# Install only production dependencies
RUN npm ci --ignore-scripts
# Copy the built application from the builder stage
COPY --from=builder /app/dist ./
# Expose the port the app will run on
EXPOSE 5500
# The command to run our app
CMD ["node", "src/server.js"]