FROM node:20-alpine AS builder
WORKDIR /app
COPY server/package.json ./
RUN npm install
COPY server/ ./
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY server/package.json ./
RUN npm install --omit=dev
COPY --from=builder /app/dist ./dist
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/server.js"]
