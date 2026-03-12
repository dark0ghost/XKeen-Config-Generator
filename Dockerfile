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
FROM traefik:v3.4-alpine AS production

# Copy built assets from builder stage
COPY --from=builder /app/dist /srv/app

# Copy Traefik configuration
COPY traefik.yml /etc/traefik/traefik.yml
COPY dynamic.yml /etc/traefik/dynamic.yml

# Create log directory
RUN mkdir -p /var/log/traefik

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/ping || exit 1

# Start Traefik
CMD ["traefik", "--configFile=/etc/traefik/traefik.yml"]
