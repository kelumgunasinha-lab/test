# Build Stage
FROM node:22-alpine AS build
WORKDIR /app

# Set UTF-8 locale environment variables to eliminate locale warnings
ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source files and build production dist
COPY . .
RUN npm run build

# Runtime Stage
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Set UTF-8 locale environment variables to eliminate locale warnings
ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8

# Remove default Nginx static files
RUN rm -rf ./*

# Copy built static files from build stage
COPY --from=build /app/dist .

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
