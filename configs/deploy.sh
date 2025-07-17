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
  -p 8042:8042 -p 4242:4242 jodogne/orthanc

# Restart Nginx container
docker rm -f nginx || true
docker buildx build --load -t custom-nginx -f "$REPO_DIR/Dockerfile.nginx" "$REPO_DIR"
docker run -d --name nginx \
  --network host \
  custom-nginx

echo "Deployment complete."