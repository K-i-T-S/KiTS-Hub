# Multi-stage build for production optimization
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application with production configuration
RUN npm run build:prod

# Production stage
FROM nginx:alpine AS production

# Install curl for health checks
RUN apk add --no-cache curl

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.prod.conf /etc/nginx/nginx.conf

# Create health check endpoint
RUN echo 'location /health { access_log off; return 200 "healthy\n"; add_header Content-Type text/plain; }' > /tmp/health.conf

# Add health check location to nginx config
RUN sed -i '/server {/a \    include /tmp/health.conf;' /etc/nginx/nginx.conf

# Expose port
EXPOSE 4177

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4177/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
