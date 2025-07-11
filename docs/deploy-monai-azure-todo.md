# TODO: Persistent MONAI Label Server on Azure (Future Reference)

## Azure VM Creation with az CLI

To provision the VM used for MONAI, we ran:

```bash
az vm create \
  --resource-group monai-rg \
  --name monai-vm \
  --image Ubuntu2204 \
  --size Standard_D4s_v3 \
  --admin-username azureuser \
  --generate-ssh-keys \
  --public-ip-sku Standard
```

- This creates a VM with 4 vCPUs, 16GB RAM, Ubuntu 22.04, and SSH access.
- After creation, we opened port 8000 for MONAI:
  ```bash
  az vm open-port --port 8000 --resource-group monai-rg --name monai-vm
  ```

---

## What We Haven't Done Yet

1. **Automated HTTPS Reverse Proxy for MONAI**
   - We manually edited nginx for `/monai/` and `/infer/`, but a full, robust config (with error handling, logging, and security) should be scripted and versioned.
   - No automated SSL certificate renewal (Let's Encrypt cron job) is set up.

2. **Production-Ready Security**
   - No firewall rules restricting access to only trusted IPs.
   - No authentication in front of MONAI server.
   - No monitoring or alerting for the VM or MONAI service.

3. **Persistent Storage for MONAI Apps/Models**
   - MONAI app is downloaded at container start; persistent storage for models or logs is not configured.

4. **Automated VM/Container Management**
   - No scripts for auto-restarting MONAI if it crashes.
   - No VM auto-shutdown/auto-start for cost savings.

5. **Scaling/Upgrade Path**
   - No plan for scaling up (AKS, VMSS) if more compute is needed.
   - No GPU support due to student/free quota.

6. **Backup and Disaster Recovery**
   - No backup of VM, nginx config, or MONAI data.

---

## How To Do It Step By Step (Future Reference)

### 1. Harden and Automate Nginx Reverse Proxy

- Script nginx config for `/monai/` and `/infer/` with all required headers and error handling.
- Use Certbot for Let's Encrypt SSL and set up a cron job for renewal:
  ```bash
  sudo apt install certbot python3-certbot-nginx
  sudo certbot --nginx -d your.domain.com
  # Add to crontab: 0 0 * * * certbot renew --quiet
  ```

### 2. Secure the VM

- Restrict inbound ports in Azure NSG to only trusted IPs.
- Consider basic auth or OAuth2 proxy in front of MONAI for sensitive data.

### 3. Persistent Storage

- Mount an Azure Disk or File Share to the VM for MONAI models/logs.
- Update Docker run command to use `-v /mnt/monai:/workspace` for persistence.

### 4. Automation

- Use `systemd` or a process manager (e.g., `supervisord`) to auto-restart Docker containers.
- Enable Azure VM auto-shutdown in the Azure Portal for cost savings.

### 5. Scaling/Upgrade

- If you get quota, consider moving to AKS for scaling and GPU support.
- Use Azure VM Scale Sets for CPU scaling.

### 6. Backup

- Regularly snapshot the VM and backup nginx/MONAI configs.
- Store critical configs in a Git repo.

---

## Quick Checklist for Future

- [ ] Harden nginx config and automate SSL renewal
- [ ] Restrict VM/network access
- [ ] Add persistent storage for MONAI
- [ ] Set up auto-restart and auto-shutdown
- [ ] Plan for scaling (AKS/VMSS) if needed
- [ ] Implement backup and disaster recovery

---
**Keep this file updated as you improve your deployment!**