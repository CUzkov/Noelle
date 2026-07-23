# Noelle

Noelle — домашний набор сервисов для управления Minecraft-серверами в
Yandex Cloud.

Проект объединяет:

- два Minecraft Java-сервера: основной survival и creative;
- Discord-бота, который показывает состояние VM и Minecraft-серверов,
  количество игроков и кнопки запуска/остановки;
- управление виртуальными машинами через Yandex Cloud API;
- запуск Minecraft по SSH и периодическое копирование статистики игроков;
- небольшой веб-сервис. Сейчас его интерфейс фактически является
  незавершённой заглушкой.

## Как это устроено

```text
Discord
   │
   ▼
discord-bot ── Yandex Cloud API ── VM start/stop/status
   │
   ├── Minecraft protocol ──────── server status and players
   ├── SSH ─────────────────────── start Minecraft process
   └── SCP ─────────────────────── copy player statistics

minecraft-servers/
   ├── mc-server/                 survival world
   └── mc-server-creative/        creative world
```

Основной `docker-compose.yml` собирает Discord-бота и веб-сайт на управляющей
машине. У каждого Minecraft-сервера есть собственные `Dockerfile`,
`docker-compose.yml` и `start.sh`; данные мира монтируются из каталога
`/home/cuzkov/...` хостовой машины.

Секреты Discord, Yandex Cloud, конфигурация серверов и приватные SSH-ключи не
хранятся в репозитории. Бот получает их из Yandex Cloud Lockbox.

## Деплой Noelle

GitHub Actions не используется. Полный деплой запускается локально:

```bash
./deploy
```

Команда устанавливает зависимости строго по lock-файлу, запускает проверки
TypeScript и production-сборку сайта, синхронизирует проект через `rsync`, а
затем пересобирает и запускает Docker Compose-сервисы на Noelle.

Можно задеплоить только один сервис:

```bash
./deploy discord-bot
./deploy web-site
```

Константы подключения находятся в `scripts/deploy.env`; приватный SSH-ключ
остаётся в `~/.ssh` и в репозиторий не копируется.

То же самое можно запустить через package script: `pnpm run deploy`.

## Состояние проекта

Это старый рабочий/экспериментальный проект, а не готовый продукт:

- корневых тестов нет;
- web UI пока выводит только заглушку;
- Compose-файлы используют старый синтаксис;
- версии Minecraft и URL server JAR нужно перепроверять перед очередным
  запуском или обновлением.

## Операции с серверами

Повторяемые SSH-, upload- и backup-команды описаны в
[`docs/server-operations.md`](docs/server-operations.md).

Локальные адреса и пути к ключам находятся в
`docs/server-operations.local.md`.
