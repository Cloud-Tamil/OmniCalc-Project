# OmniCalc Docker Setup & Container Guide

This guide details the containerization, deployment, and management of the **OmniCalc** application using the multi-stage `Dockerfile` and `docker-compose.yml`.

---

## 1. Container Architecture & Multi-Stage Pipeline

OmniCalc uses an optimized **2-stage multi-stage Docker build** based on `node:22-alpine` to produce a secure, minimal container image (~150MB):

```
┌────────────────────────────────────────────────────────┐
│  Stage 1: builder (node:22-alpine)                     │
│  - Install build tooling and libc6-compat               │
│  - Install dependencies via npm install --legacy-peer-deps │
│  - Compile React 19 SPA bundle to /app/dist (npm build) │
│  - Prune devDependencies (npm prune --omit=dev)        │
└───────────────────────────┬────────────────────────────┘
                            │ (copies /dist, /index.html, /public & /node_modules)
┌───────────────────────────▼────────────────────────────┐
│  Stage 2: runner (node:22-alpine)                      │
│  - Minimal production footprint (~150 MB)              │
│  - Auto-serves production static bundle from /app/dist │
│  - Runs under unprivileged user: USER node (UID 1000)  │
│  - Exposes port 3000                                   │
│  - Periodic Healthcheck: /api/calc/history             │
│  - Starts: node --experimental-strip-types server.ts   │
└────────────────────────────────────────────────────────┘
```

---

## 2. Quick Start: Exact Docker Commands

### Option A: Using Docker Compose (Recommended)

Docker Compose coordinates the build context, port mapping, environment flags (`NODE_ENV=production`), and automated health checks in a single configuration.

#### 1. Build and Start the Container
```bash
docker compose up -d --build
```
> **What this does**: Builds the `omnicalc:latest` image using the multi-stage `Dockerfile` and starts the `OmniCalc-app` container in the background.

#### 2. Verify Container Status & Health Check
```bash
docker compose ps
```
Expected output:
```
NAME            IMAGE             COMMAND                  SERVICE   CREATED         STATUS                    PORTS
OmniCalc-app    omnicalc:latest   "docker-entrypoint.s…"   app       2 minutes ago   Up 2 minutes (healthy)    0.0.0.0:3000->3000/tcp
```

#### 3. View Real-Time Streaming Logs
```bash
docker compose logs -f
```

#### 4. Restart the Container
```bash
docker compose restart
```

#### 5. Stop and Clean Up
```bash
docker compose down
```

---

### Option B: Using Standalone Docker CLI Commands

If you are running Docker without Docker Compose, use these standard CLI commands:

#### 1. Build the Production Docker Image
```bash
docker build -t omnicalc:latest .
```

#### 2. Run the Container
```bash
docker run -d \
  --name OmniCalc-app \
  --restart unless-stopped \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  omnicalc:latest
```

#### 3. Check Running Containers & Health
```bash
docker ps -f name=OmniCalc-app
```

#### 4. Test Container HTTP Endpoint
```bash
curl -s http://localhost:3000/api/calc/history
```

#### 5. Follow Container Logs
```bash
docker logs -f OmniCalc-app
```

#### 6. Stop and Remove Container
```bash
docker stop OmniCalc-app
docker rm OmniCalc-app
```

---

## 3. Accessing Port 3000 in Different Environments

- **Local Machine**: Open your browser at [http://localhost:3000](http://localhost:3000).
- **Google Cloud Shell**:
  1. Click the **Web Preview** button (eye icon in the top right toolbar of Cloud Shell).
  2. Select **Change port** and enter `3000`.
  3. Click **Change and Preview**.
- **Remote VM / Cloud Server**:
  Ensure inbound traffic on TCP port 3000 is permitted in your cloud security group / firewall rules, then browse to `http://<VM_PUBLIC_IP>:3000`.

---

## 4. Container Management & Diagnostics

### View Real-Time Resource Usage (CPU & Memory)
```bash
docker stats OmniCalc-app
```

### Inspect Container Health Check Details
```bash
docker inspect --format='{{json .State.Health}}' OmniCalc-app
```

### Open an Interactive Terminal Shell Inside the Container
```bash
docker exec -it OmniCalc-app sh
```

### Inspect Built Image Size and Layers
```bash
docker images omnicalc
docker history omnicalc:latest
```

### Rebuild Image from Scratch (Ignoring Cache)
```bash
docker build --no-cache -t omnicalc:latest .
```

---

## 5. Troubleshooting Common Docker Issues

### Issue 1: `npm error code ERESOLVE could not resolve dependency`
- **Cause**: npm 10+ strict peer dependency resolution can flag optional peer discrepancies (such as between vite and esbuild).
- **Fix**: The Dockerfile uses `RUN npm install --legacy-peer-deps`, and conflicting redundant pins in `package.json` have been removed.

### Issue 2: `Error: ENOENT: no such file or directory, open '/app/index.html'`
- **Cause**: Occurred when `NODE_ENV` was set to a non-production value (e.g. `Testing`), triggering Vite dev server initialization inside a production image that lacked `/app/index.html`.
- **Fix**: 
  1. `docker-compose.yml` is configured with `NODE_ENV=production`.
  2. `server.ts` automatically detects the built `dist/index.html` directory and serves static assets directly.
  3. The runner stage copies `dist`, `public`, and `index.html` for resilient fallback.

---

## 6. Environment Variables Reference

| Variable | Default Value | Description |
|---|---|---|
| `NODE_ENV` | `production` | Node.js execution environment (`production`, `development`) |
| `PORT` | `3000` | Port on which the Express server listens inside the container |
| `APP_URL` | `http://localhost:3000` | Base URL used for origin headers and public linking |
