# 🏔 Rescued People Nepal — Telegram Bot

A bot that monitors the official NDRRMA (Nepal) list of rescued people and sends a notification as soon as one of the user's saved surnames appears in the list.

**Data source:** `https://ndrrma.gov.np/api/v1/rescues/rescued-persons/?nationality=foreign`  
**Verification page:** https://ndrrma.gov.np/en/rasuwa

## How It Works

1. `/start` → The bot asks the user to select a language **in English**: 🇬🇧 English / 🇺🇦 Ukrainian / 🇷🇺 Russian.
2. The user sends surnames as text. Multiple surnames are supported — separated by new lines, commas, or `;`.
3. Every **30 minutes** (using `@nestjs/schedule` cron), the bot fetches all API pages (limit/offset pagination) and compares:
   `person.name.toLowerCase().includes(surname.toLowerCase())`.
4. When a match is found, the bot sends a notification containing `id`, `name`, `age`, `gender`, and a "Check here" link.
5. Each `(user, person_id)` pair is stored in `notified_matches` to prevent duplicate notifications for the same match.

## Commands

| Command | Description |
|---|---|
| `/start` | Language selection and welcome message |
| Any text | Save one or multiple surnames |
| `/list` | Display saved surnames |
| `/remove` | Remove a surname (via inline buttons) |
| `/check` | Check the list immediately |
| `/notifications` | Enable/disable notifications |
| `/language` | Change language |
| `/help` | Help and usage instructions |

## Getting Started

```bash
cp .env.example .env
# Enter your TELEGRAM_BOT_TOKEN obtained from @BotFather
docker compose up -d --build
docker compose logs -f bot
```

**Health check:**

```bash
curl localhost:3000/health
```

Expected response: `{"status":"ok","uptime":12}`

### Running Locally Without Docker

```bash
docker compose up -d postgres      # PostgreSQL on port 5433
npm install
POSTGRES_HOST=localhost POSTGRES_PORT=5433 TELEGRAM_BOT_TOKEN=... npm run start:dev
```

## Environment Variables

All environment variables and their default values are defined in `.env.example`. Key variables:

| Variable | Default | Description |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | — | **Required**, token obtained from @BotFather |
| `NDRRMA_NATIONALITY` | `foreign` | Nationality filter for the API |
| `NDRRMA_PAGE_SIZE` | `100` | Number of records per API page |
| `RASUWA_PAGE_URL` | `https://ndrrma.gov.np/en/rasuwa` | Link included in notifications ("Check here") |
| `MAX_SURNAMES_PER_USER` | `25` | Maximum number of surnames per user |
| `MAX_MESSAGES_PER_USER_PER_RUN` | `20` | Anti-spam limit per user per monitoring run |
| `DB_SYNCHRONIZE` | `true` | Automatically create database schema using TypeORM |

## Project Structure

```text
src/
  app.module.ts            configuration, TypeORM, cron, Telegraf
  bot/                     Telegram handlers (telegraf + nestjs-telegraf)
  i18n/                    en / uk / ru translations + HTML message rendering
  monitor/                 cron every 30 minutes, matching, notification delivery
  ndrrma/                  NDRRMA API client with pagination support
  users/                   users and surnames
  database/entities/       users, surnames, notified_matches
  health/                  GET /health
```

## Verified Against Live Data

- API pagination: 209 records fetched across 3 requests.
- Matching: `Sah` → 3 matches by `name`, `सहनी` → 3 matches by `name_ne`.
- PostgreSQL 16 database schema, surname and notification deduplication using `UNIQUE + ON CONFLICT DO NOTHING`, cascading deletes, and recipient lookup queries.
- Notification rendering in all three languages, including HTML escaping.
- Docker image build and full stack startup (the `bot` service stops only when receiving a 401 response from Telegram due to an invalid token).
