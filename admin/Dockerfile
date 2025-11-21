# ==========================================
# Admin Dashboard Dockerfile
# ==========================================
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Clean install all dependencies for Linux platform
RUN rm -rf node_modules package-lock.json && npm install

# Copy source code (excluding node_modules)
COPY . .
RUN rm -rf node_modules

# Reinstall all dependencies to ensure correct platform binaries
RUN npm install

# Build the application
RUN npm run build

# ==========================================
# Production stage
# ==========================================
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY --from=builder /app/nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 3000

# Start nginx
CMD ["nginx", "-g", "daemon off;"]