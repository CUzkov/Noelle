# Локальные константы Noelle

Этот файл содержит текущие инфраструктурные адреса. Значения можно скопировать
в shell перед использованием рецептов из `server-operations.md`.

```bash
SSH_USER="cuzkov"

MAIN_HOST="84.252.142.134"
MAIN_KEY="$HOME/.ssh/mc-server"
MAIN_WORLD_DIR="/home/cuzkov/mc-server"

NOELLE_HOST="84.201.177.31"
NOELLE_KEY="$HOME/.ssh/noelle"

CREATIVE_HOST="158.160.8.164"
CREATIVE_KEY="$HOME/.ssh/mc-server-creative"
CREATIVE_WORLD_DIR="/home/cuzkov/mc-server-creative"

REMOTE_HOME="/home/cuzkov"
DOWNLOADS_DIR="$HOME/Downloads"
WORLD_BACKUP_DIR="$DOWNLOADS_DIR/world"

MAIN_TARGET="$SSH_USER@$MAIN_HOST"
NOELLE_TARGET="$SSH_USER@$NOELLE_HOST"
CREATIVE_TARGET="$SSH_USER@$CREATIVE_HOST"
```
