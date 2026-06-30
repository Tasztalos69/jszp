<p align="center">
  <img src="static/icons/icon.svg" width="80" alt="JSZP logo" />
</p>

<h1 align="center"> JSZP Lookup </h1>

Query Hungarian vehicle data by licence plate via the magyarorszag.hu JSZP service. Requires an Ügyfélkapu+ account with TOTP-based two-factor authentication.

## Self-hosting

### Prerequisites

- [Bun](https://bun.sh) ≥ 1.0
- [Node.js](https://nodejs.org) ≥ 18
- An Ügyfélkapu+ account with TOTP-based two-factor authentication

### Installation

```bash
gh repo clone Tasztalos69/jszp
cd jszp
bun install
bunx playwright install chromium --with-deps
```

### Configuration

Copy `.env.example` and fill in the values:

```bash
cp .env.example .env
```

| Variable                 | Description                                           | Required |
| ------------------------ | ----------------------------------------------------- | -------- |
| `UGYFELKAPU_USERNAME`    | Ügyfélkapu+ username                                  | ✓        |
| `UGYFELKAPU_PASSWORD`    | Ügyfélkapu+ password                                  | ✓        |
| `UGYFELKAPU_TOTP_SECRET` | TOTP secret key                                       | ✓        |
| `CACHE_MAX_ENTRIES`      | Maximum number of cached entries (default: unlimited) |          |
| `NTFY_URL`               | ntfy.sh notification URL for auth errors              |          |
| `DISCORD_WEBHOOK_URL`    | Discord webhook URL for auth errors                   |          |
| `LOG_LEVEL`              | Set to `debug` for verbose logging                    |          |

> **Note:** Passwords containing `#` must be quoted: `UGYFELKAPU_PASSWORD="your#password"`

### Development

```bash
bun dev
```

### Production build

```bash
bun run build
node build
```

The app listens on port `3000` by default. Override with the `PORT` environment variable.

### Cache

Query results are stored in `data/cache.json` (created automatically). This file is not version-controlled.

## Docker

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose

### Quick start

```bash
cp .env.example .env
# Fill in .env
docker compose up -d
```

The app will be available on port `3000`. The cache is stored in a named Docker volume and persists across restarts.

### Manual build

```bash
docker build -t jszp .
docker run -d --env-file .env -p 3000:3000 -v ./data:/app/data jszp
```
