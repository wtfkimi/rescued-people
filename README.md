# 🏔 Rescued People Nepal — Telegram bot

Бот следит за официальным списком спасённых людей NDRRMA (Непал) и присылает уведомление,
как только в списке появляется одна из сохранённых пользователем фамилий.

Источник данных: `https://ndrrma.gov.np/api/v1/rescues/rescued-persons/?nationality=foreign`
Страница для проверки: https://ndrrma.gov.np/en/rasuwa

## Как это работает

1. `/start` → бот **на английском** спрашивает язык: 🇬🇧 English / 🇺🇦 Українська / 🇷🇺 Русский.
2. Пользователь присылает фамилию текстом. Можно сразу несколько — с новой строки, через запятую или `;`.
3. Каждые **30 минут** (cron `@nestjs/schedule`) бот проходит все страницы API (limit/offset) и сравнивает:
   `person.name.toLowerCase().includes(surname.toLowerCase())`.
4. При совпадении приходит уведомление с `id`, `name`, `age`, `gender` и ссылкой «Проверьте здесь».
5. Пара (пользователь, id человека) пишется в `notified_matches`, поэтому одно и то же совпадение
   не присылается повторно.

## Команды

| Команда | Описание |
|---|---|
| `/start` | выбор языка и приветствие |
| любой текст | сохранить одну или несколько фамилий |
| `/list` | список сохранённых фамилий |
| `/remove` | удалить фамилию (инлайн-кнопки) |
| `/check` | проверить список прямо сейчас |
| `/notifications` | включить/выключить уведомления |
| `/language` | сменить язык |
| `/help` | справка |

## Запуск

```bash
cp .env.example .env
# впишите TELEGRAM_BOT_TOKEN от @BotFather
docker compose up -d --build
docker compose logs -f bot
```

Health-check: `curl localhost:3000/health` → `{"status":"ok","uptime":12}`

### Локально без Docker

```bash
docker compose up -d postgres      # Postgres на порту 5433
npm install
POSTGRES_HOST=localhost POSTGRES_PORT=5433 TELEGRAM_BOT_TOKEN=... npm run start:dev
```

## Переменные окружения

Все переменные и значения по умолчанию — в `.env.example`. Основные:

| Переменная | По умолчанию | Назначение |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | — | **обязательно**, токен от @BotFather |
| `NDRRMA_NATIONALITY` | `foreign` | фильтр национальности в API |
| `NDRRMA_PAGE_SIZE` | `100` | размер страницы при обходе API |
| `RASUWA_PAGE_URL` | `https://ndrrma.gov.np/en/rasuwa` | ссылка «Проверьте здесь» |
| `MAX_SURNAMES_PER_USER` | `25` | лимит фамилий на пользователя |
| `MAX_MESSAGES_PER_USER_PER_RUN` | `20` | защита от флуда за один прогон |
| `DB_SYNCHRONIZE` | `true` | автосоздание схемы TypeORM |

## Структура

```
src/
  app.module.ts            конфиг, TypeORM, cron, Telegraf
  bot/                     хендлеры Telegram (telegraf + nestjs-telegraf)
  i18n/                    en / uk / ru переводы + рендер HTML-сообщений
  monitor/                 cron каждые 30 минут, матчинг, отправка уведомлений
  ndrrma/                  клиент API NDRRMA с обходом пагинации
  users/                   пользователи и фамилии
  database/entities/       users, surnames, notified_matches
  health/                  GET /health
```

## Что проверено на живых данных

- обход пагинации API: 209 записей за 3 запроса;
- матчинг: `Sah` → 3 совпадения по `name`, `सहनी` → 3 совпадения по `name_ne`;
- схема БД в Postgres 16, дедупликация фамилий и уведомлений через `UNIQUE + ON CONFLICT DO NOTHING`,
  каскадное удаление, запрос получателей рассылки;
- рендер уведомлений во всех трёх языках, экранирование HTML;
- сборка Docker-образа и старт всего стека (`bot` останавливается только на 401 от Telegram,
  если токен фиктивный).
