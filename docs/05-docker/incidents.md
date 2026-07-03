---
sidebar_position: 7
title: "Phase 5: Incident Log"
description: "Real-world incident scenarios for Phase 5"
---

# INCIDENT LOG — Phase: Containerization (Docker + Compose)

---

## Incident #1: Container Exits Immediately
- **Date:** (Practice Scenario)
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

---

## Incident #2: Build Fails — Missing Dependency
- **Date:** (Practice Scenario)
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

---

## Incident #3: Service Dependency Order
- **Date:** (Practice Scenario)
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

---

## Incident #4: Port Already in Use
- **Date:** (Practice Scenario)
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

---

## Incident #5: Container Can't Connect to External Service
- **Date:** (Practice Scenario)
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
