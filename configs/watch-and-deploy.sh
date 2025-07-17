#!/bin/bash
set -e

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$REPO_DIR"

echo "Watching for changes in configs/*.conf, *.json, *.lua ..."
while inotifywait -e close_write,moved_to,create *.conf *.json *.lua; do
  bash deploy.sh
done