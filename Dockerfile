FROM node:18-alpine AS base

# Stage 1: Building application
FROM base AS builder
# System dependencies required by Prisma (OpenSSL and libc6-compat)
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Runtime environment
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache openssl

# Copy public static files
COPY --from=builder /app/public ./public
# Copy compiled standalone application
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
# Copy Prisma schema to run migrations
COPY --from=builder /app/prisma ./prisma

# Dependencies required to run migrations and seeding at runtime
RUN npm install prisma tsx @prisma/client

# Directory for local fonts
RUN mkdir -p /app/public/fonts && chown -R node:node /app/public

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Default command: Migration -> Seeding -> Start server
CMD npx prisma migrate deploy && npx prisma db seed && node server.js