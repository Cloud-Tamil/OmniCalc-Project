# OmniCalc Post-Build & Operations Resources

This directory contains guides and reference configurations for deploying, managing, and maintaining OmniCalc after successful Jenkins CI/CD builds.

## Guides in this Folder

- **[Next-Steps-Guide.md](./Next-Steps-Guide.md)**: Comprehensive end-to-end instructions for image validation, pushing to Docker Hub / GHCR, deploying via Docker Compose / Cloud Run, setting up Nginx SSL reverse proxies, and continuous deployment (CD).

## Quick Reference Commands

| Stage | Command |
|---|---|
| **Test Image** | `docker run -d -p 3000:3000 --name omnicalc-test omnicalc:latest` |
| **Health Check** | `curl -f http://localhost:3000/api/calc/history` |
| **Push Image** | `docker tag omnicalc:latest <user>/omnicalc:latest && docker push <user>/omnicalc:latest` |
| **Deploy Live** | `docker compose up -d` |
| **Stream Logs** | `docker logs -f OmniCalc-live` |
| **Rollback** | `docker run -d -p 3000:3000 omnicalc:<PREVIOUS_BUILD_NUMBER>` |
