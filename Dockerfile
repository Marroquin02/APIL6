# Use the official Node.js image as the base image
FROM node:22.9.0-alpine AS builder

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application dependencies
RUN yarn install --frozen-lockfile

# Copy the rest of the application files
COPY . .

# Build the NestJS application
RUN yarn run build

# Stage 2: Create the production image
FROM node:22.9.0-alpine AS production

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy only the built files and necessary dependencies from the builder stage
COPY --from=builder /usr/src/app/dist ./
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules

ARG PORT

EXPOSE ${PORT}

# Command to run the application
CMD ["node", "main"]