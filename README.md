<p align="center">
  <img src="static/icons/icon.svg" width="80" alt="JSZP logo" />
</p>

<h1 align="center"> JSZP Lookup </h1>

Query Hungarian vehicle data by licence plate via the magyarorszag.hu JSZP service. Requires an Ügyfélkapu+ account with TOTP-based two-factor authentication.

## Motive

Getting vehicle information based on a license plate in Hungary is free and legal, but a cumbersome process. You have to manually log into the government portal with your phone, navigate to the service page and then enter the license plate number.

This tool aims to automate that process, with the authentication and querying happening in the background.

> [!WARNING]
> This tool is intended for personal use. Do not share the application with other people, as that may get your Mo.hu account flagged or suspended, or even worse, incur legal consequences.

## Installation

### Quickstart via Docker

```bash
docker run -d \
  -p 3000:3000 \
  -e UGYFELKAPU_USERNAME=xxx \
  -e UGYFELKAPU_PASSWORD=xxx \
  -e UGYFELKAPU_TOTP_SECRET=xxx \
  --volume data:/app/data \
  ghcr.io/tasztalos69/jszp
```

The app will be available on port `3000`. The cache is stored in a named Docker volume and persists across restarts.

### Docker Compose (basic)

This is to spin up a container and try out the application on a local network.

```bash
gh repo clone Tasztalos69/jszp
cp .env.example .env
# Fill in .env
docker compose up -d
```

<details>
  <summary>Compose file</summary>

```yaml
services:
  jszp:
    image: ghcr.io/tasztalos69/jszp:latest
    restart: unless-stopped
    container_name: jszp
    hostname: jszp
    ports:
      - '3000:3000'
    env_file: .env
    volumes:
      - cache:/app/data

volumes:
  cache:
```

</details>

### Docker Compose (reverse proxy + Oauth2)

The application features no authentication. By default, everyone who can access the webpage can query vehicles.
Therefore, before exposing to the internet, it is good practice to guard the app with access control.

This example uses [Traefik](https://traefik.io/traefik) and [Oauth2 Proxy](https://oauth2-proxy.github.io/oauth2-proxy/), but you may use any authentication mechanism.

```bash
gh repo clone Tasztalos69/jszp
cp .env.proxy.example .env
# Fill in .env
docker compose -f compose.proxy.yml up -d
```

<details>
  <summary>Compose file</summary>

```yaml
services:
  web:
    image: ghcr.io/tasztalos69/jszp:latest
    hostname: jszp
    container_name: jszp
    env_file: .env
    volumes:
      - data:/app/data
    networks:
      - traefik
    labels:
      - traefik.enable=true
      - traefik.http.routers.jszp.rule=Host(`${DOMAIN}`)
      - traefik.http.routers.jszp.middlewares=jszp-errors@docker,jszp-auth@docker
      - traefik.http.routers.jszp.entrypoints=web
      - traefik.http.routers.jszp.tls=true
      - traefik.http.services.jszp.loadbalancer.server.port=3000

      # ForwardAuth
      - traefik.http.middlewares.jszp-auth.forwardauth.address=http://jszp-proxy:4180/oauth2/auth
      - traefik.http.middlewares.jszp-auth.forwardauth.authResponseHeaders=X-Forwarded-User,X-Forwarded-Email,X-Auth-Request-Access-Token,Authorization
      - traefik.http.middlewares.jszp-auth.forwardauth.trustForwardHeader=true

      # Errors
      - traefik.http.middlewares.jszp-errors.errors.status=401,402,403
      - traefik.http.middlewares.jszp-errors.errors.statusRewrites.401=302
      - traefik.http.middlewares.jszp-errors.errors.service=jszp-proxy@docker
      - traefik.http.middlewares.jszp-errors.errors.query=/oauth2/sign_in?rd={url}

  proxy:
    image: quay.io/oauth2-proxy/oauth2-proxy:latest
    hostname: jszp-proxy
    container_name: jszp-proxy
    env_file: .env
    labels:
      - traefik.enable=true
      - traefik.http.routers.jszp-proxy.rule=Host(`${DOMAIN}`) && PathPrefix(`/oauth2`)
      - traefik.http.services.jszp-proxy.loadbalancer.server.port=4180
    environment:
      OAUTH2_PROXY_PROVIDER: 'oidc'
      OAUTH2_PROXY_REDIRECT_URL: 'https://${DOMAIN}/oauth2/callback'
      OAUTH2_PROXY_WHITELIST_DOMAINS: '${DOMAIN}'
      OAUTH2_PROXY_REVERSE_PROXY: 'true'
      OAUTH2_PROXY_UPSTREAMS: 'static://202'
      OAUTH2_PROXY_CODE_CHALLENGE_METHOD: 'S256'
      OAUTH2_PROXY_SKIP_PROVIDER_BUTTON: 'true'
      OAUTH2_PROXY_COOKIE_SECURE: 'true'
      OAUTH2_PROXY_HTTP_ADDRESS: '0.0.0.0:4180'
      OAUTH2_PROXY_EMAIL_DOMAINS: '*'
      OAUTH2_PROXY_SET_XAUTHREQUEST: 'true'
      OAUTH2_PROXY_SET_AUTHORIZATION_HEADER: 'true'
      OAUTH2_PROXY_PASS_ACCESS_TOKEN: 'true'
      OAUTH2_PROXY_PASS_AUTHORIZATION_HEADER: 'true'
      OAUTH2_PROXY_SHOW_DEBUG_ON_ERROR: 'true'
      OAUTH2_PROXY_LOG_LEVEL: 'debug'
      OAUTH2_PROXY_SKIP_AUTH_ROUTES: 'GET=^/s/[A-Z0-9]{6}$$,GET=^/s/[A-Z0-9]{7}$$,GET=^/s/[A-Z0-9]{8}$$,GET=^/_app/immutable/.*$$,GET=^/icons/.*$$,GET=^/s/icons/.*$$,GET=^/api/mot-photos/.*$$'
    networks:
      - traefik

networks:
  traefik:
    external: true

volumes:
  data:
```

</details>

## Environment variables

| Variable                 | Description                                           | Required |
| ------------------------ | ----------------------------------------------------- | -------- |
| `UGYFELKAPU_USERNAME`    | Ügyfélkapu+ username                                  | ✓        |
| `UGYFELKAPU_PASSWORD`    | Ügyfélkapu+ password                                  | ✓        |
| `UGYFELKAPU_TOTP_SECRET` | TOTP secret key                                       | ✓        |
| `CACHE_MAX_ENTRIES`      | Maximum number of cached entries (default: unlimited) |          |
| `NTFY_URL`               | ntfy.sh notification URL for auth errors              |          |
| `LOG_LEVEL`              | Set to `debug` for verbose logging                    |          |

> **Note:** Passwords containing `#` must be quoted: `UGYFELKAPU_PASSWORD="your#password"`

## Local development

```bash
gh repo clone Tasztalos69/jszp
cd jszp
bun install
bunx playwright install chromium --with-deps
bun dev
```

## Acknowledgements

The UI is inspired by the [Instacar](https://instacar.hu/) mobile application, but the project is not affiliated with or endorsed by Instacar.
