#!/bin/bash
set -e

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$REPO_DIR"

echo "Watching for changes in remote repo and configs/*.conf, *.json, *.lua ..."
while true; do
  git pull --rebase
  inotifywait -t 10 -e close_write,moved_to,create *.conf *.json *.lua && bash deploy.sh
  sleep 60
done