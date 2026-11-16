# Stage 1: install producrtion dependencies
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Stage 2: final image
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=deps /app/node_modules ./node_modules
COPY . .

USER node

EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "fetch('http://localhost:3000/health').then(res => res.json()).then(json => { if (json.status !== 'ok') { process.exit(1) } }).catch(err => process.exit(1))"

CMD ["node", "main.js"]