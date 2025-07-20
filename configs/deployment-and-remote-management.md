# Full Redeployment and Server Management Guide

This document provides a complete, step-by-step workflow for deploying the entire application stack on a fresh Google Cloud (COS) VM. It is designed for both human operators and LLMs to ensure consistent and automated redeployment.

---

## 1. Initial VM and Firewall Setup

These steps are performed once when creating a new VM instance.

### 1.1. Prerequisites
- A Google Cloud Platform (GCP) project.
- `gcloud` CLI installed and authenticated locally.

### 1.2. Firewall Configuration
Create firewall rules in your GCP project to allow public traffic to the following ports:
- **TCP 22:** For SSH access.
- **TCP 80:** For HTTP (required by Let's Encrypt for certificate validation).
- **TCP 443:** For HTTPS.

### 1.3. SSH into the VM
Connect to your Container-Optimized OS (COS) instance using `gcloud` or standard SSH.
```bash
gcloud compute ssh <your-vm-name> --zone <your-zone>
```

---

## 2. Application and Persistence Setup

Prepare the environment for the application and its data.

### 2.1. Clone the Repository
Clone the project repository into the user's home directory.
```bash
cd ~
git clone <your-repository-url> latn-5
cd latn-5
```

### 2.2. Create Persistent Directories
Create directories on the host to store persistent data for Orthanc and Let's Encrypt certificates. This ensures data is not lost when containers are recreated.
```bash
mkdir -p ~/orthanc-db
mkdir -p ~/certbot/conf ~/certbot/www
```

---

## 3. HTTPS Certificate Generation (Certbot)

Because Container-Optimized OS (COS) does not have a traditional package manager, we use the official Certbot Docker image to obtain and renew SSL certificates.

### 3.1. Obtain Initial Certificate
Run the Certbot container to generate the first certificate. This command temporarily uses port 80 for domain validation.
```bash
docker run --rm \
  -p 80:80 \
  -v ~/certbot/conf:/etc/letsencrypt \
  -v ~/certbot/www:/var/www/certbot \
  certbot/certbot certonly --standalone \
  -d mediflow-latn.duckdns.org \
  --non-interactive --agree-tos -m admin@mediflow-latn.duckdns.org
```
The certificates will be saved in `~/certbot/conf`.

---

## 4. Service Deployment

The `configs/deploy.sh` script starts and configures all necessary services.

### 4.1. Run the Deployment Script
Execute the script from the root of the repository.
```bash
bash configs/deploy.sh
```
This will:
1.  Stop and remove any existing `orthanc` and `nginx` containers.
2.  Start a new `orthanc` container with persistent database storage.
3.  Start a new `nginx` container, mounting the configuration from the repo and the SSL certificates from `~/certbot/conf`.

---

## 5. Certificate Renewal

Let's Encrypt certificates are valid for 90 days. To renew them, you must stop Nginx temporarily to free up port 80, then run the Certbot container again.

### 5.1. Renewal Command
Run this command every 60-80 days.
```bash
docker stop nginx || true

docker run --rm \
  -p 80:80 \
  -v ~/certbot/conf:/etc/letsencrypt \
  -v ~/certbot/www:/var/www/certbot \
  certbot/certbot renew --quiet

docker start nginx
```

---

## 6. Automated Deployment via GitHub Actions

For continuous integration, deployments are triggered automatically by GitHub Actions when changes are pushed to files in `configs/` or the workflow file itself.

- **Workflow file:** [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml:1)
- **Process:** On a push event, the workflow connects to the GCP VM via SSH and executes the following command:
  ```bash
  cd ~/latn-5 && git pull && bash configs/deploy.sh
  ```
This ensures that the running services are always in sync with the latest configuration in the repository.
