# Операции с Minecraft-серверами

Это памятка-шаблон. Сначала подставь константы из
`server-operations.local.md` в текущую shell-сессию. Не читай и не печатай
содержимое приватных ключей: командам нужен только путь к файлу ключа.

Адреса облачных VM могут измениться. Если соединение не устанавливается,
сначала сверь адрес VM в Yandex Cloud.

> [!IMPORTANT]
> Noelle деплоится командой `./deploy` из корня репозитория. Она сама
> выполняет проверки, синхронизацию и Docker Compose-команды. Не повторяй эти
> шаги вручную без необходимости.

## Константы

Используемые имена:

```bash
SSH_USER=...

MAIN_HOST=...
MAIN_KEY=...
MAIN_WORLD_DIR=...

NOELLE_HOST=...
NOELLE_KEY=...

CREATIVE_HOST=...
CREATIVE_KEY=...
CREATIVE_WORLD_DIR=...

REMOTE_HOME=...
DOWNLOADS_DIR=...
WORLD_BACKUP_DIR=...
```

Удобные производные значения:

```bash
MAIN_TARGET="$SSH_USER@$MAIN_HOST"
NOELLE_TARGET="$SSH_USER@$NOELLE_HOST"
CREATIVE_TARGET="$SSH_USER@$CREATIVE_HOST"
```

## Подключиться по SSH

Общий паттерн:

```bash
ssh -i "$KEY_PATH" "$SSH_USER@$HOST"
```

Для известных машин:

```bash
ssh -i "$MAIN_KEY" "$MAIN_TARGET"
ssh -i "$NOELLE_KEY" "$NOELLE_TARGET"
ssh -i "$CREATIVE_KEY" "$CREATIVE_TARGET"
```

Для обычного деплоя вместо ручной SSH-сессии используй `./deploy`.

## Загрузить datapack на основной сервер

Задай имя архива. Путь допускает пробелы:

```bash
DATAPACK_FILE="example datapack.zip"
DATAPACK_LOCAL="$DOWNLOADS_DIR/$DATAPACK_FILE"
```

Сначала загрузи архив в домашний каталог пользователя:

```bash
rsync -avzh -e "ssh -i $MAIN_KEY" \
  "$DATAPACK_LOCAL" \
  "$MAIN_TARGET:$REMOTE_HOME/"
```

Затем перемести его в datapacks мира:

```bash
ssh -i "$MAIN_KEY" "$MAIN_TARGET" \
  "sudo mv '$REMOTE_HOME/$DATAPACK_FILE' '$MAIN_WORLD_DIR/datapacks/'"
```

После замены datapack серверу может потребоваться `/reload` или перезапуск.
Перед заменой существующего файла сначала проверь его имя на сервере.

## Скачать `level.dat` для резервной копии

Создай локальную папку назначения и скачай файл:

```bash
mkdir -p "$WORLD_BACKUP_DIR"

rsync -avzh -e "ssh -i $MAIN_KEY" \
  "$MAIN_TARGET:$MAIN_WORLD_DIR/level.dat" \
  "$WORLD_BACKUP_DIR/"
```

Для полного бэкапа мира вместо одного `level.dat` копируй каталог мира,
желательно при остановленном сервере:

```bash
rsync -avzh -e "ssh -i $MAIN_KEY" \
  "$MAIN_TARGET:$MAIN_WORLD_DIR/" \
  "$WORLD_BACKUP_DIR/"
```

## Как адаптировать рецепт

Для creative-сервера замени `MAIN_TARGET`, `MAIN_KEY` и `MAIN_WORLD_DIR` на
`CREATIVE_TARGET`, `CREATIVE_KEY` и `CREATIVE_WORLD_DIR`.

Опции `rsync`:

- `-a` — рекурсивное копирование с сохранением основных атрибутов;
- `-v` — подробный вывод;
- `-z` — сжатие при передаче;
- `-h` — читаемые размеры;
- `-e "ssh -i ..."` — SSH с выбранным приватным ключом.
