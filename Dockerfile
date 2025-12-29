# Build frontend
FROM node:20-bookworm-slim AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Build backend
FROM node:20-bookworm-slim AS backend-builder
WORKDIR /app/server

# Prisma engine needs OpenSSL available during generate
RUN apt-get update -y \
	&& apt-get install -y --no-install-recommends openssl ca-certificates \
	&& rm -rf /var/lib/apt/lists/*

COPY server/package*.json ./
COPY server/prisma ./prisma
RUN npm ci
RUN npx prisma generate
COPY server/ .
RUN npm run build

# Production image
FROM node:20-bookworm-slim AS production
WORKDIR /app

# Prisma runtime needs OpenSSL libs
RUN apt-get update -y \
	&& apt-get install -y --no-install-recommends openssl ca-certificates \
	&& rm -rf /var/lib/apt/lists/*

# Copy backend
COPY --from=backend-builder /app/server/dist ./dist
COPY --from=backend-builder /app/server/node_modules ./node_modules
COPY --from=backend-builder /app/server/package.json ./
COPY --from=backend-builder /app/server/prisma ./prisma

# Copy frontend build to be served by backend
COPY --from=frontend-builder /app/dist ./public

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "dist/index.js"]
