#!/usr/bin/env bash

set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"

# shellcheck source=deploy.env
source "$SCRIPT_DIR/deploy.env"

required_commands=(corepack rsync ssh)
for command_name in "${required_commands[@]}"; do
    if ! command -v "$command_name" >/dev/null 2>&1; then
        echo "Required command is not installed: $command_name" >&2
        exit 1
    fi
done

# Package scripts invoke `pnpm` directly. Prefer the pnpm shim installed next
# to Corepack over a potentially stale user-level shim earlier in PATH.
corepack_bin_dir="$(dirname -- "$(command -v corepack)")"
export PATH="$corepack_bin_dir:$PATH"

if [[ ! -f "$NOELLE_DEPLOY_KEY" ]]; then
    echo "SSH key not found: $NOELLE_DEPLOY_KEY" >&2
    exit 1
fi

services=("$@")
if [[ ${#services[@]} -eq 0 ]]; then
    services=(discord-bot web-site)
fi

for service in "${services[@]}"; do
    case "$service" in
        discord-bot | web-site) ;;
        *)
            echo "Unknown service: $service (expected discord-bot or web-site)" >&2
            exit 1
            ;;
    esac
done

target="$NOELLE_DEPLOY_USER@$NOELLE_DEPLOY_HOST"
ssh_options=(
    -o BatchMode=yes
    -o ConnectTimeout=12
    -i "$NOELLE_DEPLOY_KEY"
)

cd "$PROJECT_DIR"

echo "==> Installing locked dependencies"
CI=true corepack pnpm install --frozen-lockfile

echo "==> Running pre-deploy checks"
CI=true pnpm_config_verify_deps_before_run=false corepack pnpm run check

echo "==> Syncing project to $target:$NOELLE_DEPLOY_PATH"
rsync \
    --archive \
    --compress \
    --delete-after \
    --human-readable \
    --exclude=.git/ \
    --exclude=node_modules/ \
    --exclude=.DS_Store \
    -e "ssh -o BatchMode=yes -o ConnectTimeout=12 -i $NOELLE_DEPLOY_KEY" \
    ./ \
    "$target:$NOELLE_DEPLOY_PATH/"

printf -v service_args ' %q' "${services[@]}"
remote_command=$(
    printf \
        "cd %q && sudo docker-compose config >/dev/null && sudo docker-compose build%s && sudo docker-compose up -d --remove-orphans%s && sudo docker-compose ps" \
        "$NOELLE_DEPLOY_PATH" \
        "$service_args" \
        "$service_args"
)

echo "==> Building and starting:${service_args}"
ssh "${ssh_options[@]}" "$target" "$remote_command"

echo "==> Deploy completed"
