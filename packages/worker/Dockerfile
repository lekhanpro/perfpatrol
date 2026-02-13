FROM ghcr.io/puppeteer/puppeteer:22.0.0

USER root
WORKDIR /app

# Copy dependency manifests
COPY packages/worker/package*.json ./
COPY packages/database/prisma ./prisma/

# Install all dependencies (including dev)
RUN npm install

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY packages/worker/ .

# Build TypeScript
RUN npm run build

# Run as non-root for security
USER pptruser

CMD ["node", "dist/index.js"]
