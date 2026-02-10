#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

git pull

npm run build
# PORT=3001 npm run start
cat ui.prod.config.js

pm2 start ui.prod.config.js
# pm2 start next.config.js
pm2 list

