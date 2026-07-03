---
sidebar_position: 6
title: "PHASE 5: Containerization — Docker + Compose"
description: "**Tumhara level:** Tumne Docker kabhi dekha hai lekin deeply use nahi kiya. Is phase mein tum Docker mastering karoge — "
---

# PHASE 5: Containerization — Docker + Compose — TEACHING

> **Tumhara level:** Tumne Docker kabhi dekha hai lekin deeply use nahi kiya. Is phase mein tum Docker mastering karoge — images, containers, Dockerfile best practices, multi-stage builds, Compose, networking, aur registries. Ye tumhare Islamic Banking FTE aur NexaBook ke liye directly applicable hai. Docker = "Works on my machine" problem ka solution.

---

## Section 1: Containers vs VMs — The Mental Model

:::tip CONCEPT: Containers = Lightweight Isolation

**VM** — Pura OS hota hai (GBs mein). Heavy, slow startup (minutes). Har VM ka apna kernel hota hai.
**Container** — Sirf tumhara app + dependencies (MBs mein). Light, fast startup (seconds). Host OS ka kernel share karte hain.

:::

```
VM:
┌─────────────────┐
│    App A        │
│    Libraries    │
│    Guest OS     │  ← Heavy (GB)
│    Hypervisor   │
│    Host OS      │
└─────────────────┘

Container:
┌─────────────────┐
│    App A        │
│    Libraries    │  ← Light (MB)
│    Container Engine (Docker)
│    Host OS      │
└─────────────────┘
```

**Key differences:**
- Startup: Containers seconds mein start, VMs minutes mein
- Size: Containers MBs, VMs GBs
- Isolation: VMs stronger isolation (separate kernel), containers process-level isolation
- Resource: Containers kam resources lete hain
- Use case: VMs = full OS chahiye, Containers = app package karna hai

**Real-world connection:** Tumhare NexaBook ko container mein chalao to same image pehle dev pe kaam karegi, phir production pe. "Works on my machine" problem khatam! Islamic Banking FTE ke liye compliance testing alag container mein kar sakte ho.

:::note HANDS-ON: VM vs Container Feel Karo

:::

```bash
# Container — seconds mein start
time docker run --rm alpine echo "Hello from container"
# ~0.5 seconds

# Container interactive
docker run -it --rm ubuntu bash
# Inside container:
cat /etc/os-release
uname -r  # Host kernel dikhega (container share karta hai)
exit
```

:::caution CHECKPOINT:
1. Container aur VM mein kya fark hai? Kab VM chahiye, kab container?
2. Agar tumhare app ko kernel-level access chahiye (e.g., custom network driver), to container ya VM?
3. Docker image aur Docker container mein kya fark hai?

:::

---

## Section 2: Docker Basics — The Commands You Actually Need

:::tip CONCEPT: Docker = Ship + Run Containers

:::

```bash
# Docker install verify
docker --version
docker info  # System info — storage driver, kernel version

# === IMAGE COMMANDS ===
docker run hello-world          # Image chalao (pull + run)
docker images                   # Image list
docker images -a                # All images including intermediate
docker pull nginx:1.25-alpine   # Image pull
docker rmi nginx:1.25-alpine    # Image remove
docker image inspect nginx:1.25-alpine  # Image inspect
docker history nginx:1.25-alpine  # Layers dekho

# === CONTAINER COMMANDS ===
docker run -it ubuntu bash      # Interactive container
docker run -d --name my-nginx -p 8080:80 nginx  # Detached

docker ps                       # Running containers
docker ps -a                    # All containers (including stopped)
docker ps -q                    # Sirf IDs

docker stop <id>                # Stop
docker start <id>               # Start
docker restart <id>             # Restart
docker pause <id>               # Pause
docker unpause <id>             # Unpause
docker rm <id>                  # Delete
docker rm -f <id>               # Force delete (running)

docker inspect <id>             # Full details
docker stats                    # Live resource usage
docker stats --no-stream        # One-time snapshot
docker top <id>                 # Processes inside

# Logs
docker logs <id>
docker logs -f <id>             # Live logs
docker logs --tail 100 <id>     # Last 100 lines
docker logs --since 1h <id>     # Last 1 hour

# Shell
docker exec -it <id> bash
docker exec -it <id> sh         # Alpine images

# Copy files
docker cp <id>:/app/logs ./logs  # Container -> host
docker cp ./config.json <id>:/app/  # Host -> container

# Cleanup
docker system df                # Space usage
docker system prune             # Stopped containers, unused networks
docker system prune -a          # + unused images
docker system prune -a --volumes  # + unused volumes (careful!)
docker container prune          # Sirf stopped containers
docker image prune              # Sirf dangling images
docker volume prune             # Sirf unused volumes
```

:::note HANDS-ON: First Container

:::

```bash
# Nginx server chalao
docker run -d --name my-nginx -p 8080:80 nginx
# -d = detached (background)
# --name = container name
# -p = port mapping (host:container)

curl http://localhost:8080
docker logs my-nginx

docker exec -it my-nginx bash
ls /usr/share/nginx/html/
cat /etc/nginx/nginx.conf
exit

docker stats my-nginx
docker stop my-nginx
docker rm my-nginx
```

:::caution CHECKPOINT:
1. `docker run -d` aur `docker run` mein kya fark hai?
2. `docker exec` aur `docker attach` mein kya fark hai?
3. `docker logs --tail 100` aur `docker logs --since 1h` kab use karoge?

:::

---

## Section 3: Dockerfile — Tumhara App Ka Blueprint

:::tip CONCEPT: Dockerfile = Recipe for Your App Image

:::

```dockerfile
# File: Dockerfile (NexaBook example)
FROM node:20-alpine

WORKDIR /app

# Dependencies copy (cached layer!)
COPY package*.json ./
RUN npm ci --only=production

# App code copy
COPY . .

RUN npm run build

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

:::tip CONCEPT: Layers = Dockerfile Ki Efficiency

Har instruction ek naya layer banata hai. Pehle layers cached rehti hain — sirf changed layers rebuild hoti hain.

:::

```dockerfile
# BAD — har change pe poori rebuild
COPY . .
RUN npm install

# GOOD — dependencies cached rehti hain
COPY package*.json ./
RUN npm install
COPY . .

# WHY? Agar sirf src/ change hua hai, to npm install skip hota hai (cache hit)
```

:::tip CONCEPT: Multi-Stage Build — Image Size 1GB -> 50MB

:::

```dockerfile
# Stage 1: Build (dev dependencies hain)
FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN npm prune --production  # Dev dependencies hatao

# Stage 2: Production (sirf built app + runtime dependencies)
FROM node:20-alpine
WORKDIR /app

# Non-root user banao
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

# Builder se sirf zaroori files copy
COPY --from=builder --chown=appuser:appgroup /app/dist ./dist
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/package.json ./

USER appuser
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

**Why?** Builder stage mein dev dependencies hain (webpack, typescript etc.). Production stage mein sirf runtime chahiye — image 3x chhota hota hai.

:::note HANDS-ON: Multi-Stage Python App

:::

```dockerfile
# Python FastAPI multi-stage
FROM python:3.12-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

FROM python:3.12-slim
WORKDIR /app
COPY --from=builder /install /usr/local
COPY . .
RUN useradd -m appuser
USER appuser
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

:::caution CHECKPOINT:
1. `COPY` aur `ADD` mein kya fark hai? Kab `ADD` use karoge? (Hint: tar auto-extract)
2. `CMD` aur `ENTRYPOINT` mein kya fark hai?
3. Multi-stage build kyun use karte hain? Kab zaroori nahi hai?

:::

---

## Section 4: Dockerfile Best Practices — Production Ready

:::tip CONCEPT: Image Size = Deployment Speed

Chhota image = fast pull, fast deploy, kam storage, kam attack surface.

:::

```dockerfile
# 1. Alpine base image use karo (tiny)
FROM node:20-alpine    # 50MB vs 1GB
FROM python:3.12-slim  # 50MB vs 900MB

# 2. Combine RUN commands (kam layers = chhota image)
# BAD — 3 layers
RUN apt-get update
RUN apt-get install -y curl
RUN rm -rf /var/lib/apt/lists/*

# GOOD — 1 layer
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*

# 3. .dockerignore use karo (build context chhota)
# File: .dockerignore
node_modules
.git
.env
.env.local
*.log
README.md
Dockerfile
docker-compose.yml
.vscode
coverage

# 4. Run as non-root (security)
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup
USER appuser

# 5. Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# 6. LABEL metadata
LABEL maintainer="ali@example.com"
LABEL version="1.0"
```

:::tip CONCEPT: Security — Image Scanning

:::

```bash
# Trivy (popular open-source)
trivy image nexabook:latest
trivy image --severity HIGH,CRITICAL nexabook:latest

# Docker Scout (built-in)
docker scout cves nexabook:latest
docker scout recommendations nexabook:latest
```

:::note HANDS-ON: Optimize Image Size

:::

```bash
# Naive Dockerfile
cat > Dockerfile.naive << 'EOF'
FROM node:20
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/index.js"]
EOF

# Optimized Dockerfile
cat > Dockerfile.optimized << 'EOF'
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
RUN addgroup -g 1001 -S app && adduser -S app -u 1001 -G app
COPY --from=builder --chown=app:app /app/dist ./dist
COPY --from=builder --chown=app:app /app/node_modules ./node_modules
USER app
EXPOSE 3000
CMD ["node", "dist/index.js"]
EOF

# Build and compare sizes
docker build -t nexabook:naive -f Dockerfile.naive .
docker build -t nexabook:optimized -f Dockerfile.optimized .
docker images | grep nexabook
# naive: ~1GB
# optimized: ~150MB
```

:::caution CHECKPOINT:
1. `.dockerignore` mein kya hota hai? Agar na lagao to kya problem hogi?
2. Non-root user kyun zaroori hai? Agar root pe chalao to kya risk hai?

:::

---

## Section 5: Docker Compose — Multi-Service Apps

:::tip CONCEPT: Compose = Tumhara Local Development Environment

Jab tumhare app ko Node.js + PostgreSQL + Redis chahiye — Compose se ek command mein sab chalao.

:::

```yaml
# File: docker-compose.yml
services:
  # Web app
  nexabook:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:password@db:5432/nexabook
      - REDIS_URL=redis://redis:6379
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - .:/app
      - /app/node_modules
    restart: unless-stopped

  # Database
  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_DB=nexabook
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  # Cache
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

```bash
# Sab services chalao
docker compose up -d

# Status dekho
docker compose ps

# Logs dekho
docker compose logs -f
docker compose logs -f nexabook

# Service restart karo
docker compose restart nexabook

# Shell mein jao
docker compose exec db psql -U postgres

# Band karo
docker compose down
docker compose down -v  # Volumes bhi delete
```

:::tip CONCEPT: Compose Override — Dev vs Production

:::

```yaml
# docker-compose.yml (base)
services:
  nexabook:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production

# docker-compose.override.yml (dev — auto-loads)
services:
  nexabook:
    environment:
      - NODE_ENV=development
    volumes:
      - .:/app  # Hot reload
    command: npm run dev

# docker-compose.prod.yml (production)
# docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

:::note HANDS-ON: Islamic Banking FTE with Compose

:::

```yaml
# Islamic Banking FTE — full stack
services:
  api:
    build: ./api
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/islamic_banking
      - REDIS_URL=redis://cache:6379
    depends_on:
      db:
        condition: service_healthy
      cache:
        condition: service_healthy

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_DB=islamic_banking
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - pg_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  cache:
    image: redis:alpine
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  pg_data:
```

:::caution CHECKPOINT:
1. `depends_on` aur `healthcheck` ka kya relationship hai? Bina healthcheck ke kya problem aa sakti hai?
2. Named volumes aur bind mounts mein kya fark hai? Kab kaunsa use karoge?
3. `docker compose down` aur `docker compose down -v` mein kya fark hai?

:::

---

## Section 6: Docker Networking — Containers Talking to Each Other

:::tip CONCEPT: Networks = Container Isolation + Communication

:::

```bash
# Networks dekho
docker network ls

# Custom network banao
docker network create nexabook-net

# Container ko network se connect
docker run -d --name my-nginx --network nexabook-net nginx

# Container ka IP dekho
docker inspect my-nginx | grep IPAddress

# Doosre container se ping karo
docker exec -it my-nginx ping my-other-container
# Hostname = container name!

# Network inspect
docker network inspect nexabook-net

# Container ko naye network se connect
docker network connect my-new-network my-nginx

# Disconnect
docker network disconnect my-new-network my-nginx
```

**Network types:**
- **bridge** — Default. Containers ek dusre se baat kar sakte hain through bridge network.
- **host** — Container host ke network pe directly. Port mapping nahi chahiye.
- **overlay** — Swarm/Docker cluster mein use hota hai. Cross-host communication.
- **none** — Koi network nahi. Pure isolation.

```bash
# Host network (performance ke liye)
docker run -d --network host nginx
# Ab localhost:80 pe directly accessible

# None network (isolation)
docker run -d --network none alpine
# Koi network access nahi
```

:::note HANDS-ON: Multi-Container Network

:::

```bash
# Custom network banao
docker network create app-net

# Database chalao
docker run -d --name db --network app-net \
    -e POSTGRES_PASSWORD=password postgres:16-alpine

# App chalao (database se connect karo by container name)
docker run -d --name app --network app-net \
    -e DATABASE_URL=postgresql://postgres:password@db:5432/myapp \
    my-app-image

# Verify connectivity
docker exec -it app ping db
# PING db (172.18.0.2): 56 data bytes
```

:::caution CHECKPOINT:
1. Bridge network aur host network mein kya fark hai?
2. Container A ko Container B se baat karna hai — kya dono ko same network mein hona zaroori hai?

:::

---

## Section 7: Volumes — Data Persistence

:::tip CONCEPT: Volumes = Data Jab Container Mare

Container delete hone pe data gayab ho jaata hai. Volume se data safe rehta hai.

:::

```bash
# Named volume banao
docker volume create postgres_data

# Volume use karo
docker run -v postgres_data:/var/lib/postgresql/data postgres

# Bind mount (tumhara local folder)
docker run -v $(pwd)/src:/app/src node:20

# Read-only mount
docker run -v $(pwd)/config:/app/config:ro nginx

# Volumes list
docker volume ls

# Volume inspect
docker volume inspect postgres_data

# Volume remove
docker volume rm postgres_data

# All unused volumes remove
docker volume prune
```

**Named Volumes vs Bind Mounts:**
- Named Volume: Docker manage karta hai. Production ke liye better.
- Bind Mount: Tumhara local folder. Development ke liye better (hot reload).

```bash
# Named volume (production)
docker run -v postgres_data:/var/lib/postgresql/data postgres

# Bind mount (development — hot reload)
docker run -v $(pwd)/src:/app/src -w /app node:20 npm run dev
```

:::note HANDS-ON: Data Persistence Test

:::

```bash
# Volume banao
docker volume create test-data

# Container mein data likho
docker run --rm -v test-data:/data alpine sh -c "echo 'hello' > /data/test.txt"

# Naye container mein data check karo
docker run --rm -v test-data:/data alpine cat /data/test.txt
# Output: hello

# Container delete karo (data safe hai)
docker volume rm test-data
```

:::caution CHECKPOINT:
1. Named volume aur bind mount mein kya fark hai? Production mein kaunsa better hai?
2. Agar tumhara database container crash ho jaye, to data safe rahega kya? (Hint: named volume)

:::

---

## Section 8: Registries — Image Share Karo

:::tip CONCEPT: Registry = Image Ka Warehouse

:::

```bash
# Docker Hub (default)
docker login
docker tag nexabook:latest ali123/nexabook:latest
docker push ali123/nexabook:latest

# AWS ECR
aws ecr create-repository --repository-name nexabook
aws ecr get-login-password | docker login --username AWS --password-stdin 123456789.dkr.ecr.ap-south-1.amazonaws.com
docker tag nexabook:latest 123456789.dkr.ecr.ap-south-1.amazonaws.com/nexabook:latest
docker push 123456789.dkr.ecr.ap-south-1.amazonaws.com/nexabook:latest

# Azure ACR
az acr create --resource-group nexabook-rg --name nexabookregistry --sku Basic
az acr login --name nexabookregistry
docker tag nexabook:latest nexabookregistry.azurecr.io/nexabook:latest
docker push nexabookregistry.azurecr.io/nexabook:latest

# GitHub Container Registry (GHCR)
docker login ghcr.io
docker tag nexabook:latest ghcr.io/ali123/nexabook:latest
docker push ghcr.io/ali123/nexabook:latest
```

**Tagging strategies:**
- `latest` — Hamesha latest version (production mein avoid karo)
- `v1.0.0` — Semantic versioning (recommended)
- `main-abc1234` — Branch + short commit hash

```bash
# Production tagging
docker tag nexabook:latest nexabook:1.0.0
docker tag nexabook:latest nexabook:main-$(git rev-parse --short HEAD)
docker push nexabook:1.0.0
docker push nexabook:main-abc1234
```

:::caution CHECKPOINT:
1. Docker Hub aur private registry (ECR/ACR) mein kya fark hai?
2. Production mein `latest` tag kyun avoid karna chahiye?

:::

---

## Section 9: Docker in Production — Best Practices

:::tip CONCEPT: Production Docker != Development Docker

:::

```bash
# Resource limits (container zyada CPU/memory na le)
docker run -d \
    --name nexabook \
    --memory="512m" \
    --cpus="1.5" \
    --restart unless-stopped \
    nexabook:1.0.0

# Logging (production mein json logs)
docker run -d \
    --log-driver=json-file \
    --log-opt max-size=10m \
    --log-opt max-file=3 \
    nexabook:1.0.0

# Read-only filesystem (security)
docker run -d \
    --read-only \
    --tmpfs /tmp \
    --tmpfs /var/run \
    nexabook:1.0.0

# No new capabilities (security)
docker run -d \
    --cap-drop ALL \
    --cap-add NET_BIND_SERVICE \
    nexabook:1.0.0
```

:::tip CONCEPT: Container Debugging

:::

```bash
# Container crash ho raha hai — kaise debug karo?
# 1. Logs dekho
docker logs <container_id>
docker logs --tail 50 <container_id>

# 2. Shell mein jao (agar start hota hai lekin crash hota hai)
docker run -it --rm nexabook:1.0.0 sh

# 3. Entry point override karo
docker run -it --rm --entrypoint sh nexabook:1.0.0

# 4. Container inspect karo
docker inspect <container_id> | grep -A 5 "State"

# 5. Events dekho
docker events --since 1h
docker events --filter container=my-container
```

:::note HANDS-ON: Production-Ready Setup

:::

```bash
# Production container
docker run -d \
    --name nexabook-prod \
    --restart unless-stopped \
    --memory="512m" \
    --cpus="1.5" \
    --log-driver=json-file \
    --log-opt max-size=10m \
    --log-opt max-file=3 \
    -p 8080:3000 \
    -e NODE_ENV=production \
    -e DATABASE_URL=postgresql://user:pass@db:5432/prod \
    --health-cmd "curl -f http://localhost:3000/health || exit 1" \
    --health-interval 30s \
    --health-timeout 5s \
    --health-retries 3 \
    nexabook:1.0.0

# Status check
docker inspect --format='{{.State.Health.Status}}' nexabook-prod
# healthy / unhealthy / starting
```

:::caution CHECKPOINT:
1. `--restart unless-stopped` aur `--restart always` mein kya fark hai?
2. Container pe `--read-only` flag lagana kyun zaroori hai? (Hint: security)

:::

---

## Summary: Phase 5 Key Takeaways

| Concept | Tumne Kya Seekha |
|---------|-----------------|
| Containers vs VMs | Lightweight isolation, shared kernel |
| Docker Basics | run, exec, logs, stop, rm, stats, cp |
| Dockerfile | FROM, COPY, RUN, CMD, multi-stage builds |
| Best Practices | Alpine, non-root, healthcheck, .dockerignore |
| Compose | Multi-service apps, depends_on, healthchecks, override files |
| Networking | Bridge, hostnames, custom networks |
| Volumes | Data persistence, named volumes vs bind mounts |
| Registries | Docker Hub, ECR, ACR, GHCR, tagging strategies |
| Production | Resource limits, logging, security, debugging |

---

## MINI-TASKS

### Task 1: Dockerize Your App (20 min)
NexaBook ya Islamic Banking FTE ka Dockerfile banao with:
- Multi-stage build
- Non-root user
- Healthcheck
- Image size < 200MB

### Task 2: Docker Compose (15 min)
`docker-compose.yml` banao with:
- App service
- PostgreSQL with healthcheck
- Redis with healthcheck
- Named volume for database

### Task 3: Image Optimization (15 min)
Tumhara image 1GB se 100MB tak lao using:
- Alpine base
- Multi-stage build
- .dockerignore

### Task 4: Production Hardening (15 min)
Docker run command banao with:
- Memory limit (512m)
- CPU limit (1.5)
- JSON logging with rotation
- Restart policy
- Healthcheck

---

## INCIDENT.md: Practice Scenarios

### Incident #1: Container Exits Immediately
- **What Broke:** Container start hote hi band ho raha hai
- **Root Cause:** CMD/ENTRYPOINT galat hai ya app crash ho raha hai
- **Fix:**
  ```bash
  # Step 1: Logs dekho
  docker logs <container_id>
  # Error message dikhega
  
  # Step 2: Interactive mode mein test karo
  docker run -it --rm <image> sh
  # Inside: command manually run karo jo CMD mein hai
  
  # Step 3: Entry point override karo (debug ke liye)
  docker run -it --rm --entrypoint sh <image>
  
  # Step 4: Dockerfile mein fix karo
  # Galat: CMD ["node", "dist/index.js"]
  # Sahi: CMD ["node", "server.js"]  (jo file exist karti hai)
  
  # Step 5: Build karo aur test karo
  docker build -t nexabook:fixed .
  docker run -d --name test nexabook:fixed
  docker logs test
  ```
- **Prevention:** Hamesha `docker logs` pehle check karo, ENTRYPOINT override se test karo
- **Learning:** Container exit code 0 = success, non-zero = error. `docker inspect` se exit code dekho

### Incident #2: Build Fails — Missing Dependency
- **What Broke:** `docker build` fail ho raha hai, package install error
- **Root Cause:** Package.json mein dependency missing ya wrong base image
- **Fix:**
  ```bash
  # Step 1: Error message padho — kaunsa package missing hai
  docker build . 2>&1 | tail -20
  
  # Step 2: Cache bypass karo
  docker build --no-cache .
  
  # Step 3: Base image check karo
  # Galat: FROM node:14 (project Node 20 use karta hai)
  # Sahi: FROM node:20-alpine
  
  # Step 4: Requirements check karo (Python)
  # Galat: requirements.txt mein Flask 3.0 hai lekin Python 3.8 hai
  # Sahi: FROM python:3.12-slim
  
  # Step 5: Multi-stage mein dependencies alag check karo
  docker build --target builder -t nexabook:builder .
  docker run -it --rm nexabook:builder sh
  # Inside: npm ls dekho, missing packages identify karo
  ```
- **Prevention:** `.dockerignore` se unnecessary files exclude karo, base image version lock karo
- **Learning:** Docker layer cache — `--no-cache` se fresh build hota hai

### Incident #3: Service Dependency Order
- **What Broke:** App start ho gaya lekin database ready nahi, connection error
- **Root Cause:** `depends_on` bina healthcheck ke sirf start order define karta hai, readiness nahi
- **Fix:**
  ```bash
  # Step 1: Docker compose logs mein dekho — kaunsa service pehle start hua
  docker compose logs db
  docker compose logs app
  
  # Step 2: Database readiness check manually
  docker compose exec db pg_isready -U postgres
  
  # Step 3: Compose file mein healthcheck add karo
  # db:
  #   image: postgres:16-alpine
  #   healthcheck:
  #     test: ["CMD-SHELL", "pg_isready -U postgres"]
  #     interval: 5s
  #     timeout: 5s
  #     retries: 5
  
  # Step 4: depends_on mein condition add karo
  # app:
  #   depends_on:
  #     db:
  #       condition: service_healthy
  
  # Step 5: Restart karo
  docker compose down
  docker compose up -d
  ```
- **Prevention:** Hamesha healthcheck lagao services pe, `depends_on` mein `condition: service_healthy` use karo
- **Learning:** `depends_on` sirf start order deta hai, readiness nahi. Healthcheck se actual readiness check hoti hai

### Incident #4: Port Already in Use
- **What Broke:** `docker: Error response from daemon: Ports 8080:80 are already allocated`
- **Root Cause:** Pehle se koi container ya service same port use kar raha hai
- **Fix:**
  ```bash
  # Step 1: Check karo kaunsa process port use kar raha hai
  lsof -i :8080
  # ya
  ss -tlnp | grep 8080
  
  # Step 2: Docker containers check karo
  docker ps --format "table {{.Names}}\t{{.Ports}}"
  
  # Step 3: Purana container stop/delete karo
  docker stop <old_container_id>
  docker rm <old_container_id>
  
  # Step 4: Agar host service hai to use band karo
  sudo systemctl stop nginx  # ya jo bhi service hai
  
  # Step 5: Alternate port use karo
  docker run -d -p 8081:80 nginx  # Different host port
  
  # Step 6: Ya port release karo
  docker container prune  # Sab stopped containers delete
  ```
- **Prevention:** `docker ps` se pehle check karo, dynamic ports use karo dev mein
- **Learning:** Port mapping = host:container. Host port unique hona chahiye, container port conflict nahi hota

### Incident #5: Container Can't Connect to External Service
- **What Broke:** Container se internet ya doosra service accessible nahi
- **Root Cause:** DNS resolution fail ho raha hai ya network configuration galat hai
- **Fix:**
  ```bash
  # Step 1: Container ke andar DNS check karo
  docker exec -it <container> nslookup google.com
  
  # Step 2: Network mode check karo
  docker inspect <container> | grep NetworkMode
  
  # Step 3: DNS manually set karo
  docker run --dns 8.8.8.8 --dns 8.8.4.4 my-image
  
  # Step 4: Custom network pe DNS resolve hota hai container name se
  docker network create app-net
  docker run -d --name api --network app-net my-api
  docker run -d --name db --network app-net postgres
  # API: db:5432 se connect ho sakta hai (container name = DNS)
  
  # Step 5: Host network mode (for direct host network access)
  docker run --network host my-image
  
  # Step 6: Firewall check (host pe)
  sudo iptables -L -n | grep DOCKER
  ```
- **Prevention:** Custom networks banao, container names meaningful rakho, DNS settings verify karo
- **Learning:** Docker default bridge pe container names resolve nahi hote. Custom network pe hota hai.

---

*Next: Phase 6 — CI/CD Pipelines jab bolo "next"*
