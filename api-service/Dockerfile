# Multi-stage build for a lightweight, production-ready image
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .

# Production runner image
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --only=production

# Copy core files
COPY --from=builder /usr/src/app/db.js ./
COPY --from=builder /usr/src/app/server.js ./

# Create default data directory and set node user permissions
RUN mkdir -p data && chown -R node:node /usr/src/app

USER node

EXPOSE 5000

ENV PORT=5000
ENV HOST=0.0.0.0
ENV DB_DIR=/usr/src/app/data

CMD ["node", "server.js"]
