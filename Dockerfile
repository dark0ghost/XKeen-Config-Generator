# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM traefik:v3.6 AS production

# Copy built assets from builder stage
COPY --from=builder /app/dist /srv/app

# Copy Traefik configuration
COPY traefik.yml /etc/traefik/traefik.yml
COPY dynamic.yml /etc/traefik/dynamic.yml

# Install busybox-extras for httpd (simple HTTP server)
RUN apk add --no-cache busybox-extras

# Create log directory
RUN mkdir -p /var/log/traefik

# Expose port 80 for Traefik (reverse proxy)
EXPOSE 80

# Health check - check Traefik proxy
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Start httpd on internal port 8888 and Traefik on port 80
CMD ["sh", "-c", "httpd -f -p 8888 -h /srv/app & traefik --configFile=/etc/traefik/traefik.yml"]
