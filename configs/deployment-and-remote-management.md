# Deployment and Remote Server Management Guide

This document provides comprehensive instructions and workflows for deploying, managing, and troubleshooting the remote server and all related services (Docker, Nginx, Orthanc, swap, firewall, monitoring). It is designed for both human operators and LLMs to reference for automation and future deployments.

---

## 1. Deployment Overview

### 1.1. Directory Structure

- `configs/` — All deployment scripts, configuration files, and documentation.
- `configs/deploy.sh` — Main deployment script for Docker containers.
- `configs/nginx.conf` — Nginx reverse proxy configuration.
- `configs/orthanc.json` — Orthanc DICOM server configuration.
- `configs/Dockerfile.nginx` — Custom Dockerfile for Nginx with CA certificates.

---

## 2. Automated Deployment via GitHub Actions

Deployment is triggered automatically by GitHub Actions when changes are pushed to files in `configs/` or the workflow file itself.

- Workflow file: [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml:1)
- On push, the workflow:
  - Checks out the code
  - Sets up SSH using a secret key
  - Connects to the GCP VM and runs:
    ```
    cd ~/latn-5 && git pull && bash configs/deploy.sh
    ```
- This ensures all deployment steps are executed remotely and consistently.

---

## 3. Dockerized Service Deployment

### 3.1. Build and Run Services

- **Orthanc** (DICOM server):
  - Config: [`configs/orthanc.json`](configs/orthanc.json:1)
  - Deploy:  
    ```
    docker rm -f orthanc || true
    docker run -d --name orthanc \
      -v "$REPO_DIR/orthanc.json":/etc/orthanc/orthanc.json:ro \
      -v "$REPO_DIR/sync-public-ids.lua":/etc/orthanc/lua/sync-public-ids.lua:ro \
      -v "$REPO_DIR/orthanc-db":/var/lib/orthanc/db \
      -p 8042:8042 -p 4242:4242 jodogne/orthanc
    ```
  - **Disable authentication**: Set `"AuthenticationEnabled": false` in `orthanc.json`.

- **Nginx** (reverse proxy):
  - Custom image with CA certificates for HTTPS proxying.
  - Dockerfile: [`configs/Dockerfile.nginx`](configs/Dockerfile.nginx:1)
  - Deploy:
    ```
    docker build -t custom-nginx -f "$REPO_DIR/Dockerfile.nginx" "$REPO_DIR"
    docker run -d --name nginx --network host custom-nginx
    ```
  - Config: [`configs/nginx.conf`](configs/nginx.conf:1)
  - Key settings:
    - `proxy_ssl_server_name on;` for HTTPS upstreams.
    - `resolver 8.8.8.8 ipv6=off;` to force IPv4 DNS.

---
