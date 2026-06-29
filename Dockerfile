FROM mcr.microsoft.com/playwright:v1.61.0-jammy

WORKDIR /app

RUN npm install -g bun

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "build/index.js"]
