# OmniCalc: Post-Jenkins Build & Production Deployment Guide

Congratulations on successfully building and packaging **OmniCalc** through Jenkins! 

This guide details exactly **what to do next** after your Jenkins pipeline or freestyle job finishes building the application and packaging the Docker container (`omnicalc:latest` / `omnicalc:${BUILD_NUMBER}`).

---

## 1. Overview of the Post-Build Lifecycle

```
┌─────────────────────────┐
│ Jenkins Build Finishes  │ (dist/ created, tests pass, Docker image built)
└────────────┬────────────┘
             │
┌────────────▼────────────┐
│ 1. Validate Image       │ Verify container boots, healthcheck returns 200 OK
└────────────┬────────────┘
             │
┌────────────▼────────────┐
│ 2. Tag & Push Registry  │ Docker Hub / GitHub Container Registry (ghcr.io)
└────────────┬────────────┘
             │
┌────────────▼────────────┐
│ 3. Deploy to Production │ Docker Compose / Cloud Run / Kubernetes / VPS
└────────────┬────────────┘
             │
┌────────────▼────────────┐
│ 4. Monitor & Operate    │ Logs, healthchecks, domain SSL & reverse proxy
└─────────────────────────┘
```

---

## Step 1: Verify the Built Docker Image Locally

Before shipping to production or pushing to a registry, verify that the image runs cleanly:

### 1.1 List Built Images
Check that Jenkins produced the tagged image:
```bash
docker images | grep omnicalc
```
Expected output:
```
omnicalc   2        ba498158d540   2 minutes ago   ~150MB
omnicalc   latest   ba498158d540   2 minutes ago   ~150MB
```

### 1.2 Test-Run the Image
Start a test container on port 3000:
```bash
docker run -d \
  --name omnicalc-test \
  -p 3000:3000 \
  -e NODE_ENV=production \
  omnicalc:latest
```

### 1.3 Verify Application Health
Query the calculation history API endpoint:
```bash
curl -I http://localhost:3000/
curl -s http://localhost:3000/api/calc/history
```
Expected response: `HTTP/1.1 200 OK` and a JSON object with `{"ok": true, "data": [...]}`.

### 1.4 Clean Up Test Container
```bash
docker stop omnicalc-test && docker rm omnicalc-test
```

---

## Step 2: Push the Image to a Container Registry

To deploy the image to a cloud server, Kubernetes cluster, or remote VM, publish it to a Docker registry.

### Option A: Docker Hub

1. **Log in to Docker Hub**:
   ```bash
   docker login
   ```
2. **Tag your image with your Docker Hub username**:
   ```bash
   docker tag omnicalc:latest <your-dockerhub-username>/omnicalc:latest
   docker tag omnicalc:latest <your-dockerhub-username>/omnicalc:${BUILD_NUMBER}
   ```
3. **Push to Docker Hub**:
   ```bash
   docker push <your-dockerhub-username>/omnicalc:latest
   docker push <your-dockerhub-username>/omnicalc:${BUILD_NUMBER}
   ```

---

### Option B: GitHub Container Registry (GHCR)

1. **Create a GitHub Personal Access Token (PAT)** with `write:packages` permission.
2. **Log in to GHCR**:
   ```bash
   echo $CR_PAT | docker login ghcr.io -u <your-github-username> --password-stdin
   ```
3. **Tag and Push**:
   ```bash
   docker tag omnicalc:latest ghcr.io/<your-github-username>/omnicalc:latest
   docker push ghcr.io/<your-github-username>/omnicalc:latest
   ```

---

## Step 3: Deploy OmniCalc to Production

Choose the deployment method that fits your infrastructure:

### Method 1: Single Server / Cloud VM (Docker Compose)

On your production server (Ubuntu/Debian EC2, DigitalOcean Droplet, Compute Engine, etc.):

1. **Copy `docker-compose.yml` to the production server**:
   ```yaml
   services:
     app:
       image: <your-dockerhub-username>/omnicalc:latest
       container_name: OmniCalc-prod
       restart: always
       ports:
         - "3000:3000"
       environment:
         - NODE_ENV=production
         - PORT=3000
       healthcheck:
         test: ["CMD", "curl", "-f", "http://localhost:3000/api/calc/history"]
         interval: 30s
         timeout: 5s
         retries: 3
         start_period: 15s
   ```

2. **Pull and Launch**:
   ```bash
   docker compose pull
   docker compose up -d
   ```

3. **Verify Container Health**:
   ```bash
   docker compose ps
   docker compose logs -f
   ```

---

### Method 2: Serverless Cloud Deployment (Google Cloud Run)

If you use Google Cloud:

1. **Tag and push to Google Artifact Registry**:
   ```bash
   gcloud auth configure-docker asia-southeast1-docker.pkg.dev
   docker tag omnicalc:latest asia-southeast1-docker.pkg.dev/<PROJECT_ID>/omnicalc/app:latest
   docker push asia-southeast1-docker.pkg.dev/<PROJECT_ID>/omnicalc/app:latest
   ```

2. **Deploy to Cloud Run**:
   ```bash
   gcloud run deploy omnicalc \
     --image asia-southeast1-docker.pkg.dev/<PROJECT_ID>/omnicalc/app:latest \
     --platform managed \
     --region asia-southeast1 \
     --allow-unauthenticated \
     --port 3000
   ```

---

### Method 3: Reverse Proxy & Free SSL with Nginx + Certbot

To expose OmniCalc securely on `https://your-domain.com`:

1. **Install Nginx & Certbot on your host server**:
   ```bash
   sudo apt update && sudo apt install -y nginx certbot python3-certbot-nginx
   ```

2. **Create an Nginx configuration file** (`/etc/nginx/sites-available/omnicalc`):
   ```nginx
   server {
       server_name your-domain.com www.your-domain.com;

       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. **Enable the site and restart Nginx**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/omnicalc /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

4. **Obtain automated SSL certificate**:
   ```bash
   sudo certbot --nginx -d your-domain.com -d www.your-domain.com
   ```

---

## Step 4: Automate Continuous Deployment (CD) in Jenkins

To make Jenkins automatically deploy the application whenever a build succeeds:

### Add a Post-Build Deployment Step in Jenkins:

In your Jenkins **Freestyle project** -> **Execute shell** (or **Pipeline stage**), append an automated deployment step:

```bash
# 7. AUTOMATED CONTINUOUS DEPLOYMENT
echo "=========================================="
echo "7. DEPLOYING PRODUCTION CONTAINER"
echo "=========================================="
# Stop previous running production instance if active
docker stop OmniCalc-live 2>/dev/null || true
docker rm OmniCalc-live 2>/dev/null || true

# Run new container version
docker run -d \
  --name OmniCalc-live \
  --restart unless-stopped \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  omnicalc:latest

# Verify live deployment
sleep 3
curl -f http://localhost:3000/api/calc/history && echo "Deployment Successful!"
```

---

## Step 5: Production Monitoring & Operations

### 5.1 Real-Time Log Streaming
```bash
docker logs -f OmniCalc-live
```

### 5.2 CPU & RAM Consumption
```bash
docker stats OmniCalc-live
```

### 5.3 Automated Container Restart on System Reboot
OmniCalc containers use `--restart unless-stopped`, which ensures Docker automatically relaunches the calculator suite if the host server reboots.

### 5.4 Zero-Downtime Rollback (If Needed)
If a future build introduces an unexpected bug, roll back instantly using the previous Jenkins build number image:
```bash
docker stop OmniCalc-live
docker run -d --name OmniCalc-live -p 3000:3000 omnicalc:<PREVIOUS_BUILD_NUMBER>
```
