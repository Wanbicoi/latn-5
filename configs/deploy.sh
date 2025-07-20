#!/bin/bash
set -ex

# Use configs directly from the repo path
REPO_DIR="$(cd "$(dirname "$0")" && pwd)"

# Restart Orthanc container
docker rm -f orthanc || true
docker run -d --name orthanc \
  -v "$REPO_DIR/orthanc.json":/etc/orthanc/orthanc.json:ro \
  -v "$REPO_DIR/sync-public-ids.lua":/etc/orthanc/lua/sync-public-ids.lua:ro \
  -v "$REPO_DIR/orthanc-db":/var/lib/orthanc/db \
  -p 8042:8042 -p 4242:4242 jodogne/orthanc-plugins:1.12.8

# Restart Nginx container
docker rm -f nginx || true
docker run -d --name nginx \
  -v "$REPO_DIR/nginx.conf":/etc/nginx/nginx.conf:ro \
  -v ~/certbot/conf:/etc/letsencrypt:ro \
  -p 80:80 -p 443:443 \
  nginx:1.25-alpine

echo "Deployment complete."