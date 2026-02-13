FROM ghcr.io/puppeteer/puppeteer:22.0.0

USER root
WORKDIR /app

# Copy dependency manifests
COPY package*.json ./
COPY ../../packages/database/prisma ./prisma/

# Install production dependencies
RUN npm install --omit=dev

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Run as non-root for security
USER pptruser

CMD ["node", "dist/index.js"]
