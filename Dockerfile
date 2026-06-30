FROM oven/bun:1 AS builder
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

FROM mcr.microsoft.com/playwright:v1.61.0-noble AS runner
WORKDIR /app
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
RUN npx playwright install chromium
EXPOSE 3000
VOLUME ["/app/data"]
LABEL org.opencontainers.image.source=https://github.com/Tasztalos69/jszp
LABEL org.opencontainers.image.description="JSZP Lekérdező"
LABEL org.opencontainers.image.licenses=MIT
ENV NODE_ENV=production
CMD ["node", "build/index.js"]
