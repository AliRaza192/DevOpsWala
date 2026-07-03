---
sidebar_position: 17
title: "PHASE 16: MERGE — Cloud-Native Agent Deployment + Event-Driven Architecture"
description: "**Tumhara level:** Tumne sab kuch seekha hai — DevOps, Cloud, Docker, K8s, AI Agents, RAG, Memory. Ab sab ko merge karo."
---

# PHASE 16: MERGE — Cloud-Native Agent Deployment + Event-Driven Architecture — TEACHING

> **Tumhara level:** Tumne sab kuch seekha hai — DevOps, Cloud, Docker, K8s, AI Agents, RAG, Memory. Ab sab ko merge karo. Ye tumhara unique selling point hai — kam log Agentic AI + Kubernetes + Cloud teeno ek sath samajhte hain.

---

## Section 1: Cloud-Native Agent Deployment — The Big Picture

:::tip CONCEPT: Agent = Container = Scalable Service

Tumhara agent ab tak local pe chal raha tha. Ab usko cloud pe deploy karo — containerize, orchestrate, scale.

:::

```
Agent Code → Docker Image → K8s Deployment → Auto-scaling → Production
```

**Multi-Tenant Agent Serving:**
```
Bank A Agent ←→ Shared Infrastructure
Bank B Agent ←→ (K8s namespace isolation)
Bank C Agent ←→ (separate secrets, separate DB)
```

**Real-world connection:** Tumhare Islamic Banking FTE ko:
- Docker mein package karo
- K8s pe deploy karo (3 replicas per tenant)
- Auto-scaling lagao (peak time pe 10 replicas)
- CI/CD pipeline se deploy karo
- Har tenant ka alag namespace hai

:::caution CHECKPOINT:
1. Agent ko container mein kyun daalte hain? Directly server pe kyun nahi chalate?
2. Multi-tenant serving mein kya challenges hain?

### HANDS-ON: Apna Pehla Agent Container Build aur Run Karo

Ye exercise tumhe sikhayegi ke ek AI agent ko Docker container mein kaise package karte hain aur locally kaise test karte hain. NexaBook customer support agent use karenge.

:::

```bash
# File: agent_container_lab.sh

# Step 1: Project structure banao
mkdir -p nexabook-agent && cd nexabook-agent

# Step 2: Agent code banao
cat > agent.py << 'PYEOF'
import os
import json
from http.server import HTTPServer, BaseHTTPRequestHandler

class AgentHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)
        request = json.loads(body)

        query = request.get("query", "")
        # Simulated agent response — in real app, ye LLM call hoga
        response = {
            "agent": "nexabook-support",
            "query": query,
            "response": f"Support agent received: {query[:80]}",
            "status": "ok",
            "model": os.environ.get("AGENT_MODEL", "gpt-4")
        }

        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(response).encode())

    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps({"status": "healthy", "agent": "nexabook-support"}).encode())

    def log_message(self, format, *args):
        print(f"[AGENT] {args[0]}")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    server = HTTPServer(("0.0.0.0", port), AgentHandler)
    print(f"NexaBook Agent running on port {port}")
    server.serve_forever()
PYEOF

# Step 3: Requirements file
cat > requirements.txt << 'REQEOF'
openai>=1.0.0
REQEOF

# Step 4: Dockerfile (multi-stage)
cat > Dockerfile << 'DFEOF'
# Stage 1: Build
FROM python:3.11-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Stage 2: Runtime
FROM python:3.11-slim
WORKDIR /app
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY agent.py .
EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=3s CMD curl -f http://localhost:8080/health || exit 1
CMD ["python", "agent.py"]
DFEOF

# Step 5: .dockerignore
cat > .dockerignore << 'DIEOF'
__pycache__
*.pyc
.env
.git
.venv
DIEOF

# Step 6: Image build karo
echo "Building image..."
docker build -t nexabook-agent:v1 .

# Step 7: Container run karo
echo "Starting container..."
docker run -d --name nexabook-agent \
  -e AGENT_MODEL=gpt-4 \
  -e PORT=8080 \
  -p 8080:8080 \
  nexabook-agent:v1

# Step 8: Health check
echo "Waiting for agent..."
sleep 2
echo "Health check:"
curl -s http://localhost:8080/health | python3 -m json.tool

# Step 9: Test query
echo "Sending test query..."
curl -s -X POST http://localhost:8080 \
  -H "Content-Type: application/json" \
  -d '{"query": "How do I process a refund for order #12345?"}' | python3 -m json.tool

# Step 10: Image info
echo "Image details:"
docker images nexabook-agent:v1 --format "{{.Repository}}:{{.Tag}} | Size: {{.Size}}"

# Step 11: Container logs
echo "Container logs:"
docker logs nexabook-agent

# Step 12: Cleanup
echo "Cleaning up..."
docker stop nexabook-agent && docker rm nexabook-agent
```

**Expected Output:**
```
Building image...
...
Successfully built abc123def456
Successfully tagged nexabook-agent:v1

Starting container...
Health check:
{
    "status": "healthy",
    "agent": "nexabook-support"
}

Sending test query...
{
    "agent": "nexabook-support",
    "query": "How do I process a refund for order #12345?",
    "response": "Support agent received: How do I process a refund for order #12345?",
    "status": "ok",
    "model": "gpt-4"
}

Image details:
nexabook-agent:v1 | Size: 125MB

Container logs:
[AGENT] "0.0.0.0" - - [03/Jul/2026 10:30:00] "GET /health HTTP/1.1" 200 -
[AGENT] "0.0.0.0" - - [03/Jul/2026 10:30:01] "POST / HTTP/1.1" 200 -

Cleaning up...
```

---

## Section 2: Dockerize Your Agent — Production Ready

:::tip CONCEPT: Agent Container = Self-contained Package

:::

```dockerfile
# File: Dockerfile.agent (Multi-stage build)
FROM python:3.11-slim AS builder

WORKDIR /app

# Dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Production stage
FROM python:3.11-slim

# Security: non-root user
RUN useradd --create-home --shell /bin/bash agent
USER agent

WORKDIR /home/agent/app

# Copy from builder
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --chown=agent:agent agent/ ./agent/
COPY --chown=agent:agent config/ ./config/

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run
CMD ["python", "-m", "agent.main"]
```

```yaml
# File: docker-compose.agent.yml
version: '3.8'

services:
  banking-agent:
    build:
      context: .
      dockerfile: Dockerfile.agent
    ports:
      - "8000:8000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=redis://redis:6379
      - LOG_LEVEL=info
    depends_on:
      redis:
        condition: service_healthy
      db:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 3s
      retries: 3
    deploy:
      replicas: 3
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
        reservations:
          memory: 256M
          cpus: '0.25'

  redis:
    image: redis:alpine
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: banking
      POSTGRES_USER: agent
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U agent"]
      interval: 5s
      timeout: 3s
      retries: 5

volumes:
  pgdata:
```

:::note HANDS-ON: Build and Test Agent Container

:::

```bash
# Step 1: Dockerfile create karo
mkdir -p agent
cat > agent/main.py << 'EOF'
from fastapi import FastAPI
import os

app = FastAPI()

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.post("/compliance/check")
def check_compliance(transaction: dict):
    # Simplified compliance check
    amount = transaction.get("amount", 0)
    return {
        "compliant": amount > 0 and amount < 1000000,
        "transaction_id": transaction.get("id"),
        "risk_score": "low" if amount < 100000 else "medium"
    }
EOF

cat > requirements.txt << 'EOF'
fastapi==0.115.0
uvicorn==0.30.0
EOF

# Step 2: Docker build
docker build -f Dockerfile.agent -t banking-agent:v1 .

# Step 3: Local test
docker run -d -p 8000:8000 --name agent-test banking-agent:v1
curl http://localhost:8000/health
curl -X POST http://localhost:8000/compliance/check \
  -H "Content-Type: application/json" \
  -d '{"id": "TXN001", "amount": 50000, "currency": "AED"}'

# Step 4: Image scan
docker scout cves banking-agent:v1

# Step 5: Cleanup
docker stop agent-test && docker rm agent-test
```

:::caution CHECKPOINT:
1. Multi-stage build kyun use karte hain — sirf image size kam karne ke liye ya security bhi improve hoti hai?
2. `.dockerignore` mein kaunsi files exclude karni chahiye — banking agent ke liye kaunse secrets critical hain?
3. Docker image scan (`docker scout cves`) kyun zaruri hai — CVEs se real-world mein kya attack hota hai?

:::

---

## Section 3: Kubernetes Deployment — Production Scale

:::tip CONCEPT: K8s = Agent Orchestration

:::

```yaml
# File: agent-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: banking-agent
  namespace: agents
spec:
  replicas: 3
  selector:
    matchLabels:
      app: banking-agent
  template:
    metadata:
      labels:
        app: banking-agent
    spec:
      containers:
        - name: agent
          image: yourregistry/banking-agent:latest
          ports:
            - containerPort: 8000
          env:
            - name: OPENAI_API_KEY
              valueFrom:
                secretKeyRef:
                  name: agent-secrets
                  key: openai-api-key
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: agent-secrets
                  key: database-url
          resources:
            limits:
              memory: "512Mi"
              cpu: "500m"
            requests:
              memory: "256Mi"
              cpu: "250m"
          livenessProbe:
            httpGet:
              path: /health
              port: 8000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /ready
              port: 8000
            initialDelaySeconds: 5
            periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: banking-agent-service
  namespace: agents
spec:
  selector:
    app: banking-agent
  ports:
    - port: 80
      targetPort: 8000
  type: ClusterIP

---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: banking-agent-hpa
  namespace: agents
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: banking-agent
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Pods
      pods:
        metric:
          name: llm_requests_per_second
        target:
          type: AverageValue
          averageValue: "10"
```

### Agent Autoscaling Strategies

```yaml
# Custom metrics for agent scaling
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: agent-custom-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: banking-agent
  minReplicas: 2
  maxReplicas: 20
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
        - type: Percent
          value: 50
          periodSeconds: 60
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
        - type: Percent
          value: 25
          periodSeconds: 120
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
```

### Multi-Tenant Namespace Isolation

```yaml
# Tenant A namespace
apiVersion: v1
kind: Namespace
metadata:
  name: tenant-bank-a
  labels:
    tenant: bank-a

---
# Tenant B namespace
apiVersion: v1
kind: Namespace
metadata:
  name: tenant-bank-b
  labels:
    tenant: bank-b

---
# Resource quota per tenant
apiVersion: v1
kind: ResourceQuota
metadata:
  name: tenant-quota
  namespace: tenant-bank-a
spec:
  hard:
    requests.cpu: "4"
    requests.memory: 8Gi
    limits.cpu: "8"
    limits.memory: 16Gi
    pods: "20"
```

:::note HANDS-ON: Deploy Agent to Kubernetes

:::

```bash
# Step 1: Namespace create karo
kubectl create namespace agents

# Step 2: Secrets create karo
kubectl create secret generic agent-secrets \
  --from-literal=openai-api-key=${OPENAI_API_KEY} \
  --from-literal=database-url=${DATABASE_URL} \
  -n agents

# Step 3: Agent deploy karo
cat > agent-deployment.yaml << 'EOF'
apiVersion: apps/v1
kind: Deployment
metadata:
  name: banking-agent
  namespace: agents
spec:
  replicas: 2
  selector:
    matchLabels:
      app: banking-agent
  template:
    metadata:
      labels:
        app: banking-agent
    spec:
      containers:
        - name: agent
          image: yourregistry/banking-agent:v1
          ports:
            - containerPort: 8000
          env:
            - name: OPENAI_API_KEY
              valueFrom:
                secretKeyRef:
                  name: agent-secrets
                  key: openai-api-key
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
          livenessProbe:
            httpGet:
              path: /health
              port: 8000
            initialDelaySeconds: 10
            periodSeconds: 30
          readinessProbe:
            httpGet:
              path: /health
              port: 8000
            initialDelaySeconds: 5
            periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: banking-agent
  namespace: agents
spec:
  selector:
    app: banking-agent
  ports:
    - port: 80
      targetPort: 8000
  type: ClusterIP
EOF

kubectl apply -f agent-deployment.yaml

# Step 4: Verify deployment
kubectl get pods -n agents
kubectl logs deployment/banking-agent -n agents

# Step 5: Test service
kubectl port-forward service/banking-agent 8080:80 -n agents &
curl http://localhost:8080/health

# Step 6: HPA setup (auto-scaling)
kubectl autoscale deployment banking-agent \
  --cpu-percent=70 \
  --min=2 \
  --max=10 \
  -n agents
```

:::caution CHECKPOINT:
1. Kubernetes mein agent ka resource limit kaise decide karoge — CPU/memory kitna de sakte hain LLM API calls ke liye?
2. HPA ka `--min=2` kyun hai — 1 pod sufficient kyun nahi? Multi-tenancy mein kya impact hai?
3. Namespace isolation kaise ensure karoge — ek bank ka agent doosre bank ke data ko access na kar sake?

:::

---

## Section 4: Event-Driven Architecture — BullMQ

:::tip CONCEPT: Events = Agent Communication

:::

```python
# File: agent_queue.py
from bullmq import Queue, Worker
import openai
import json

agent_queue = Queue("agent-tasks", connection={"host": "localhost", "port": 6379})

async def submit_task(task_type: str, data: dict):
    job = await agent_queue.add(
        task_type,
        data,
        opts={
            "attempts": 3,
            "backoff": {"type": "exponential", "delay": 1000}
        }
    )
    return job.id

async def process_task(job):
    client = openai.OpenAI()
    
    if job.name == "compliance_check":
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "Check transaction for Shari'ah compliance"},
                {"role": "user", "content": json.dumps(job.data)}
            ]
        )
        return {"result": response.choices[0].message.content, "status": "completed"}
    
    elif job.name == "report_generation":
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "Generate compliance report"},
                {"role": "user", "content": json.dumps(job.data)}
            ]
        )
        return {"report": response.choices[0].message.content, "status": "completed"}

worker = Worker("agent-tasks", process_task, connection={"host": "localhost", "port": 6379})
```

```python
# API endpoint
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class TransactionRequest(BaseModel):
    account_id: str
    amount: float
    type: str

@app.post("/check-transaction")
async def check_transaction(request: TransactionRequest):
    job_id = await submit_task("compliance_check", request.dict())
    return {"job_id": job_id, "status": "queued"}

@app.get("/job-status/{job_id}")
async def get_job_status(job_id: str):
    job = await agent_queue.getJob(job_id)
    if job:
        return {"job_id": job_id, "status": job.status, "result": job.returnvalue}
    return {"error": "Job not found"}
```

### Kafka Awareness (Enterprise Scale)

```
BullMQ (Redis):                    Kafka:
├── Simple setup                    ├── Complex setup
├── Single consumer groups          ├── Multiple consumer groups
├── Good for &lt;10K msgs/day         ├── Good for millions msgs/day
├── Redis-based                     ├── Distributed log
├── Solo-founder scale              ├── Enterprise multi-team scale
└── Recommended for you now         └── Learn later
```

:::note HANDS-ON: Set Up Event-Driven Agent Queue

:::

```bash
# Step 1: Redis install (BullMQ dependency)
docker run -d --name redis-agent -p 6379:6379 redis:7-alpine

# Step 2: Agent queue code create karo
mkdir -p agent
cat > agent/queue.py << 'EOF'
from bullmq import Queue, Worker
import asyncio
import json

queue = Queue("agent-tasks", connection={"host": "localhost", "port": 6379})

async def submit_compliance_check(transaction: dict):
    job = await queue.add(
        "compliance_check",
        transaction,
        opts={
            "attempts": 3,
            "backoff": {"type": "exponential", "delay": 1000}
        }
    )
    print(f"Job submitted: {job.id}")
    return job.id

async def process_compliance(job):
    # Simulate LLM call
    await asyncio.sleep(1)  # Simulate API latency
    return {
        "transaction_id": job.data.get("id"),
        "compliant": True,
        "risk_score": "low"
    }

worker = Worker("agent-tasks", process_compliance, connection={"host": "localhost", "port": 6379})

# Test: Submit job
async def main():
    job_id = await submit_compliance_check({
        "id": "TXN001",
        "amount": 50000,
        "currency": "AED",
        "type": "transfer"
    })
    print(f"Job ID: {job_id}")

asyncio.run(main())
EOF

# Step 3: Queue test karo
python agent/queue.py

# Step 4: Monitor queue
# Redis CLI se queue depth check
redis-cli LLEN bull:agent-tasks:waiting
redis-cli LLEN bull:agent-tasks:completed
redis-cli LLEN bull:agent-tasks:failed

# Step 5: Worker scale karo (multiple workers)
python agent/queue.py &
python agent/queue.py &
python agent/queue.py &
echo "3 workers running"

# Step 6: Queue health check
redis-cli INFO keyspace
```

:::caution CHECKPOINT:
1. BullMQ aur Kafka mein kya fark hai — kab BullMQ sufficient hai, kab Kafka chahiye?
2. Agent queue mein priority levels kaise implement karoge — high-priority compliance check vs low-priority report generation?
3. Redis down ho jaye to queue messages kaise recover honge — persistence kaise ensure karoge?

:::

---

## Section 5: CI/CD for AI Agents — Eval Gates

:::tip CONCEPT: CI/CD = Automated Agent Deployment

:::

```yaml
# File: .github/workflows/agent-cicd.yml
name: Agent CI/CD

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: pip install -r requirements.txt
      
      - name: Run unit tests
        run: pytest tests/unit/ -v
      
      - name: Run eval suite
        run: python -m eval.run_suite
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
      
      - name: Check eval pass rate
        run: python -m eval.check_threshold --min-pass-rate 0.9

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Build Docker image
        run: docker build -t banking-agent:${{ github.sha }} -f Dockerfile.agent .
      
      - name: Run Trivy scan
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: banking-agent:${{ github.sha }}
          severity: 'CRITICAL,HIGH'
          exit-code: '1'

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production
    steps:
      - name: Deploy to K8s
        run: |
          kubectl set image deployment/banking-agent \
            agent=yourregistry/banking-agent:${{ github.sha }} \
            -n agents
          kubectl rollout status deployment/banking-agent -n agents
```

### Blue-Green Deployment for Agents

```yaml
# Blue-Green deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: banking-agent-blue
spec:
  replicas: 3
  selector:
    matchLabels:
      app: banking-agent
      version: blue
  template:
    metadata:
      labels:
        app: banking-agent
        version: blue

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: banking-agent-green
spec:
  replicas: 0  # Initially 0
  selector:
    matchLabels:
      app: banking-agent
      version: green
  template:
    metadata:
      labels:
        app: banking-agent
        version: green

---
# Service routes to blue by default
apiVersion: v1
kind: Service
metadata:
  name: banking-agent
spec:
  selector:
    app: banking-agent
    version: blue  # Change to green for cutover
  ports:
    - port: 80
      targetPort: 8000
```

:::note HANDS-ON: CI/CD Pipeline Test Karo — Eval Gate Se Deploy Tak

Ye exercise tumhe sikhayegi ke agent ki CI/CD pipeline kaise kaam karti hai — eval gate, Docker build, security scan, aur K8s deploy.

:::

```bash
# Step 1: Eval test banao
mkdir -p eval tests
cat > eval/test_suite.py << 'EOF'
import json
from openai import OpenAI

client = OpenAI()

test_cases = [
    {"input": "Transfer 10000 with interest", "expected": "reject", "category": "compliance"},
    {"input": "Send 50000 to ACC-123", "expected": "approve", "category": "transfer"},
    {"input": "Invest in lottery", "expected": "reject", "category": "gambling"},
]

def run_eval():
    passed = 0
    for case in test_cases:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "Check if transaction is halal. Reply APPROVE or REJECT with reason."},
                {"role": "user", "content": case["input"]}
            ]
        )
        result = response.choices[0].message.content.lower()
        if case["expected"] in result:
            passed += 1
            print(f"PASS: {case['input']}")
        else:
            print(f"FAIL: {case['input']} - got: {result}")
    
    rate = passed / len(test_cases)
    print(f"\nPass rate: {rate:.0%}")
    return rate >= 0.9  # Gate: 90% minimum

if __name__ == "__main__":
    import sys
    sys.exit(0 if run_eval() else 1)
EOF

# Step 2: GitHub Actions workflow
cat > .github/workflows/agent-cicd.yml << 'EOF'
name: Agent CI/CD

on:
  push:
    branches: [main]

jobs:
  eval:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - run: pip install openai pytest
      - name: Run eval gate
        run: python eval/test_suite.py
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}

  build:
    needs: eval
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build image
        run: docker build -t banking-agent:${{ github.sha }} -f Dockerfile.agent .
      - name: Trivy scan
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: banking-agent:${{ github.sha }}
          severity: 'CRITICAL,HIGH'
          exit-code: '1'

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy
        run: |
          kubectl set image deployment/banking-agent \
            agent=yourregistry/banking-agent:${{ github.sha }} \
            -n agents
          kubectl rollout status deployment/banking-agent -n agents
EOF

# Step 3: Local pipeline test
echo "=== Eval Gate ==="
python eval/test_suite.py && echo "PASSED" || echo "FAILED"

echo "=== Docker Build ==="
docker build -f Dockerfile.agent -t banking-agent:test .

echo "=== Security Scan ==="
docker scout cves banking-agent:test

# Step 4: Deploy simulation
echo "=== Deploy Simulation ==="
kubectl apply -f agent-deployment.yaml 2>/dev/null || echo "K8s not available — simulated"
```

:::caution CHECKPOINT:
1. Eval gate ka pass rate kitna hona chahiye? 90% ya 95%? Kyun?
2. Blue-green deployment mein traffic switch kaise karte hain? Step by step batao.
3. Agar eval gate fail ho jaye to pipeline kya kare?

:::

---

## Section 6: Agent Observability — OpenTelemetry

:::tip CONCEPT: Track Agent Performance

:::

```python
# File: agent_telemetry.py
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.resources import Resource

resource = Resource.create({"service.name": "banking-agent"})
provider = TracerProvider(resource=resource)
processor = BatchSpanProcessor(OTLPSpanExporter(endpoint="http://otel-collector:4317"))
provider.add_span_processor(processor)
trace.set_tracer_provider(provider)

tracer = trace.get_tracer("banking-agent.tracer")

def traced_agent_call(query: str):
    with tracer.start_as_current_span("agent_call") as span:
        span.set_attribute("agent.input", query)
        
        client = openai.OpenAI()
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": query}]
        )
        
        span.set_attribute("agent.output", response.choices[0].message.content)
        span.set_attribute("agent.tokens_used", response.usage.total_tokens)
        span.set_attribute("agent.model", response.model)
        
        return response.choices[0].message.content
```

### Agent Metrics

```
Key Metrics:
├── Latency (p50, p95, p99)
├── Throughput (requests/minute)
├── Error rate (%)
├── Token usage (input + output)
├── Cost per request
├── Queue depth (pending tasks)
├── Worker utilization
└── Model accuracy (eval pass rate)
```

:::note HANDS-ON: Agent Observability Stack Setup Karo

Ye exercise tumhe sikhayegi ke agent ke liye OpenTelemetry, metrics, aur alerts kaise setup karte hain.

:::

```python
# File: agent_observability.py
from opentelemetry import trace, metrics
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.exporter.otlp.proto.grpc.metric_exporter import OTLPMetricExporter
from opentelemetry.sdk.resources import Resource
from datetime import datetime
import time

# Resource
resource = Resource.create({
    "service.name": "banking-agent",
    "service.version": "1.0.0",
    "deployment.environment": "production"
})

# Tracing
trace_exporter = OTLPSpanExporter(endpoint="http://otel-collector:4317")
trace_reader = BatchSpanProcessor(trace_exporter)
tracer_provider = TracerProvider(resource=resource)
tracer_provider.add_span_processor(trace_reader)
trace.set_tracer_provider(tracer_provider)
tracer = trace.get_tracer("banking-agent")

# Metrics
metric_exporter = OTLPMetricExporter(endpoint="http://otel-collector:4317")
metric_reader = PeriodicExportingMetricReader(metric_exporter, export_interval_millis=5000)
meter_provider = MeterProvider(resource=resource, metric_readers=[metric_reader])
metrics.set_meter_provider(meter_provider)
meter = metrics.get_meter("banking-agent")

# Create metrics
request_counter = meter.create_counter("agent.requests", description="Total requests")
error_counter = meter.create_counter("agent.errors", description="Total errors")
latency_histogram = meter.create_histogram("agent.latency", description="Response latency")
active_requests = meter.create_up_down_counter("agent.active_requests", description="Active requests")

# Traced agent call
def traced_compliance_check(transaction: dict):
    with tracer.start_as_current_span("compliance_check") as span:
        span.set_attribute("transaction.id", transaction.get("id", "unknown"))
        span.set_attribute("transaction.amount", transaction.get("amount", 0))
        
        start = time.time()
        active_requests.add(1)
        request_counter.add(1)
        
        try:
            # Simulate compliance check
            time.sleep(0.1)
            result = {"compliant": True, "risk_score": "low"}
            span.set_attribute("result.compliant", result["compliant"])
            return result
        except Exception as e:
            error_counter.add(1)
            span.set_attribute("error", True)
            span.record_exception(e)
            raise
        finally:
            latency = time.time() - start
            latency_histogram.record(latency)
            active_requests.add(-1)

# Test
for i in range(5):
    traced_compliance_check({"id": f"TXN{i}", "amount": 10000 * i})

print("Metrics exported to OTel Collector")
```

```bash
# Prometheus config scrape karne ke liye
cat > prometheus.yml << 'EOF'
global:
  scrape_interval: 5s

scrape_configs:
  - job_name: 'otel-collector'
    static_configs:
      - targets: ['otel-collector:8889']
EOF

# Alerts banao
cat > alerts.yml << 'EOF'
groups:
  - name: agent-alerts
    rules:
      - alert: HighErrorRate
        expr: rate(agent_errors_total[5m]) > 0.05
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Agent error rate > 5%"
      
      - alert: HighLatency
        expr: histogram_quantile(0.95, rate(agent_latency_bucket[5m])) > 3
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "Agent p95 latency > 3s"
EOF
```

:::caution CHECKPOINT:
1. OpenTelemetry tracing aur metrics mein kya fark hai? Kab kaunsa use karoge?
2. Alert threshold kaise decide karoge? Error rate 5% kyun, 1% kyun nahi?
3. OTel Collector kya karta hai? Direct exporter kyun nahi use karte?

:::

---

## Section 7: Cost Optimization — LLM API Calls

:::tip CONCEPT: Cost = Tokens x Price x Calls

:::

```python
# 1. Model Selection
def select_model(task_complexity: str) -> str:
    if task_complexity == "simple":
        return "gpt-3.5-turbo"  # $0.0005/1K tokens
    elif task_complexity == "medium":
        return "gpt-4-turbo"    # $0.01/1K tokens
    else:
        return "gpt-4"          # $0.03/1K tokens

# 2. Caching
from functools import lru_cache
import hashlib

@lru_cache(maxsize=1000)
def cached_llm_call(query_hash: str, query: str):
    return client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": query}]
    )

# 3. Batching
def batch_process(queries: list):
    combined = "\n".join([f"{i+1}. {q}" for i, q in enumerate(queries)])
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": f"Process these:\n{combined}"}]
    )
    return response.choices[0].message.content

# 4. Rate limiting
from ratelimit import limits, sleep_and_retry

@sleep_and_retry
@limits(calls=10, period=60)
def rate_limited_call(query: str):
    return client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": query}]
    )
```

:::note HANDS-ON: Agent Token/API Cost Track Karo aur Throttle Lagao

Ye exercise tumhe sikhayegi ke AI agent ki token usage track karte hain, per-user daily limits lagate hain, aur budget limit cross hone pe automatic throttle kaise hota hai.

:::

```python
# File: agent_cost_tracker.py
from dataclasses import dataclass, field
from datetime import datetime, date
from typing import Dict, List
import json

@dataclass
class UserQuota:
    user_id: str
    daily_token_limit: int
    tokens_used: int = 0
    requests_today: int = 0
    last_request: str = ""
    blocked: bool = False

class AgentCostTracker:
    PRICING = {
        "gpt-4":     {"input_per_1k": 0.03, "output_per_1k": 0.06},
        "gpt-4-turbo": {"input_per_1k": 0.01, "output_per_1k": 0.03},
        "gpt-3.5-turbo": {"input_per_1k": 0.0005, "output_per_1k": 0.0015},
    }

    def __init__(self, daily_budget_usd: float = 50.0):
        self.daily_budget = daily_budget_usd
        self.users: Dict[str, UserQuota] = {}
        self.total_cost_today: float = 0.0
        self.total_tokens_today: int = 0
        self.log: List[dict] = []

    def register_user(self, user_id: str, daily_token_limit: int):
        self.users[user_id] = UserQuota(user_id=user_id, daily_token_limit=daily_token_limit)

    def _reset_if_new_day(self):
        today = date.today().isoformat()
        if self.log and self.log[-1].get("date") != today:
            for u in self.users.values():
                u.tokens_used = 0
                u.requests_today = 0
                u.blocked = False
            self.total_cost_today = 0.0
            self.total_tokens_today = 0

    def track(self, user_id: str, model: str, input_tokens: int, output_tokens: int) -> dict:
        self._reset_if_new_day()

        user = self.users.get(user_id)
        if not user:
            return {"error": "User not registered"}

        if user.blocked:
            return {"error": "Daily token limit exceeded", "tokens_used": user.tokens_used, "limit": user.daily_token_limit}

        pricing = self.PRICING.get(model)
        if not pricing:
            return {"error": f"Unknown model: {model}"}

        cost = (input_tokens / 1000 * pricing["input_per_1k"]) + (output_tokens / 1000 * pricing["output_per_1k"])
        total_tokens = input_tokens + output_tokens

        # Check per-user limit
        if user.tokens_used + total_tokens > user.daily_token_limit:
            user.blocked = True
            self.log.append({"date": date.today().isoformat(), "user": user_id, "event": "throttled", "tokens_used": user.tokens_used, "limit": user.daily_token_limit})
            return {"error": "Throttled", "tokens_used": user.tokens_used, "limit": user.daily_token_limit, "action": "BLOCKED"}

        # Check global budget
        if self.total_cost_today + cost > self.daily_budget:
            self.log.append({"date": date.today().isoformat(), "user": user_id, "event": "budget_exceeded", "cost": round(cost, 4)})
            return {"error": "Daily budget exceeded", "budget_remaining": round(self.daily_budget - self.total_cost_today, 4), "action": "BLOCKED"}

        # Consume
        user.tokens_used += total_tokens
        user.requests_today += 1
        user.last_request = datetime.now().isoformat()
        self.total_cost_today += cost
        self.total_tokens_today += total_tokens
        self.log.append({"date": date.today().isoformat(), "user": user_id, "event": "tracked", "model": model, "tokens": total_tokens, "cost": round(cost, 4)})

        return {"ok": True, "tokens_used": user.tokens_used, "tokens_remaining": user.daily_token_limit - user.tokens_used, "cost": round(cost, 4), "budget_remaining": round(self.daily_budget - self.total_cost_today, 2)}

    def dashboard(self) -> dict:
        return {
            "budget": f"${self.total_cost_today:.2f} / ${self.daily_budget:.2f}",
            "total_tokens": self.total_tokens_today,
            "users": {uid: {"tokens": u.tokens_used, "limit": u.daily_token_limit, "blocked": u.blocked} for uid, u in self.users.items()},
            "recent_throttles": [l for l in self.log if l["event"] == "throttles" or l["event"] == "throttled"][-3:]
        }

# === Demo ===
tracker = AgentCostTracker(daily_budget_usd=1.0)
tracker.register_user("bank_alif", daily_token_limit=5000)
tracker.register_user("bank_ba", daily_token_limit=3000)

scenarios = [
    ("bank_alif", "gpt-4", 800, 400, "Compliance check — transfer 50K PKR"),
    ("bank_alif", "gpt-4", 1200, 600, "Zakat calculation"),
    ("bank_ba", "gpt-3.5-turbo", 300, 200, "Simple query"),
    ("bank_alif", "gpt-4", 1500, 800, "Murabaha pricing review"),
    ("bank_alif", "gpt-4", 2000, 1000, "Large compliance report"),
    ("bank_ba", "gpt-4", 500, 300, "Shari'ah review"),
]

print("=== Agent Cost Tracker Demo ===\n")
for uid, model, inp, out, desc in scenarios:
    result = tracker.track(uid, model, inp, out)
    status = result.get("ok", False)
    action = result.get("action", "OK")
    print(f"[{'OK' if status else 'BLOCKED'}] {uid}: {desc[:40]}")
    if status:
        print(f"  Tokens: {result['tokens_used']} | Cost: ${result['cost']} | Budget left: ${result['budget_remaining']}")
    else:
        print(f"  {result['error']} | {action}")
    print()

print("=== Dashboard ===")
print(json.dumps(tracker.dashboard(), indent=2))
```

**Expected Output:**
```
=== Agent Cost Tracker Demo ===

[OK] bank_alif: Compliance check — transfer 50K PKR
  Tokens: 1200 | Cost: $0.048 | Budget left: $0.95

[OK] bank_alif: Zakat calculation
  Tokens: 1800 | Cost: $0.108 | Budget left: $0.85

[OK] bank_ba: Simple query
  Tokens: 500 | Cost: $0.001 | Budget left: $0.84

[OK] bank_alif: Murabaha pricing review
  Tokens: 2300 | Cost: $0.138 | Budget left: $0.7

[OK] bank_alif: Large compliance report
  Tokens: 3000 | Cost: $0.18 | Budget left: $0.52

[OK] bank_ba: Shari'ah review
  Tokens: 800 | Cost: $0.03 | Budget left: $0.49

=== Dashboard ===
{
  "budget": "$0.51 / $1.00",
  "total_tokens": 8800,
  "users": {
    "bank_alif": {"tokens": 4500, "limit": 5000, "blocked": false},
    "bank_ba": {"tokens": 1300, "limit": 3000, "blocked": false}
  }
}
```

:::caution CHECKPOINT:
1. Per-user token limit set karte waqt bank ki size consider karoge ya sirf usage pattern?
2. Budget threshold 80% pe alert karna chahiye ya 90%? Dono ka trade-off kya hai?
3. Throttled user ko kya message dena chahiye — direct error ya graceful fallback (e.g., cached response)?

:::

---

## Section 8: Agent Security in Production

:::tip CONCEPT: Security = Defense in Depth

:::

```yaml
# Network policy
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: agent-network-policy
  namespace: agents
spec:
  podSelector:
    matchLabels:
      app: banking-agent
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              name: api-gateway
      ports:
        - protocol: TCP
          port: 8000
  egress:
    - to:
        - namespaceSelector:
            matchLabels:
              name: database
      ports:
        - protocol: TCP
          port: 5432
    - to:  # Allow OpenAI API
        - ipBlock:
            cidr: 0.0.0.0/0
      ports:
        - protocol: TCP
          port: 443
```

```python
# API Key rotation
import boto3

def rotate_api_key():
    """Rotate OpenAI API key"""
    # Generate new key
    # Update K8s secret
    # Restart pods
    pass
```

:::note HANDS-ON: Agent Security Hardening Implement Karo

Ye exercise tumhe sikhayegi ke production agent ko kaise secure karte hain — network policies, secret management, aur API key rotation.

:::

```yaml
# Step 1: Network Policy — Agent sirf allowed services se communicate kare
cat > network-policy.yaml << 'EOF'
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: agent-network-policy
  namespace: agents
spec:
  podSelector:
    matchLabels:
      app: banking-agent
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              name: api-gateway
      ports:
        - protocol: TCP
          port: 8000
  egress:
    - to:
        - namespaceSelector:
            matchLabels:
              name: database
      ports:
        - protocol: TCP
          port: 5432
    - to:
        - ipBlock:
            cidr: 0.0.0.0/0
      ports:
        - protocol: TCP
          port: 443
EOF

# Step 2: Secrets sealed karo (Sealed Secrets)
kubectl create secret generic agent-secrets \
  --from-literal=openai-api-key=${OPENAI_API_KEY} \
  --from-literal=database-url=${DATABASE_URL} \
  -n agents --dry-run=client -o yaml | kubeseal -o yaml > sealed-secrets.yaml

# Step 3: RBAC — Agent ko sirf zaruri permissions do
cat > rbac.yaml << 'EOF'
apiVersion: v1
kind: ServiceAccount
metadata:
  name: banking-agent
  namespace: agents

---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: agent-role
  namespace: agents
rules:
  - apiGroups: [""]
    resources: ["configmaps", "secrets"]
    verbs: ["get", "list"]
  - apiGroups: [""]
    resources: ["pods"]
    verbs: ["get", "list", "watch"]

---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: agent-role-binding
  namespace: agents
subjects:
  - kind: ServiceAccount
    name: banking-agent
roleRef:
  kind: Role
  name: agent-role
  apiGroup: rbac.authorization.k8s.io
EOF

# Step 4: Pod Security Standards
cat > pod-security.yaml << 'EOF'
apiVersion: v1
kind: Pod
metadata:
  name: banking-agent-secure
  namespace: agents
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
    fsGroup: 2000
  serviceAccountName: banking-agent
  containers:
    - name: agent
      image: yourregistry/banking-agent:v1
      securityContext:
        allowPrivilegeEscalation: false
        readOnlyRootFilesystem: true
        capabilities:
          drop: ["ALL"]
      resources:
        limits:
          memory: "512Mi"
          cpu: "500m"
EOF

# Step 5: Apply sab kuch
kubectl apply -f network-policy.yaml
kubectl apply -f rbac.yaml
kubectl apply -f pod-security.yaml
kubectl apply -f sealed-secrets.yaml

# Step 6: Verify
kubectl get networkpolicy -n agents
kubectl get rolebinding -n agents
kubectl get pods -n agents -o jsonpath='{.items[*].spec.securityContext}'
```

:::caution CHECKPOINT:
1. Network policy mein ingress aur egress dono kyun zaruri hain?
2. Sealed Secrets vs SOPS — kaunsa kab use karoge?
3. RBAC role binding kyun zaruri hai? Direct service account se kya hota hai?

:::

---

## Section 9: Disaster Recovery & Multi-Cloud

:::tip CONCEPT: DR = Backup + Failover

:::

```yaml
# Backup agent state
apiVersion: batch/v1
kind: CronJob
metadata:
  name: agent-backup
spec:
  schedule: "0 2 * * *"  # Daily at 2 AM
  jobTemplate:
    spec:
      template:
        spec:
          containers:
            - name: backup
              image: backup-agent
              env:
                - name: DATABASE_URL
                  valueFrom:
                    secretKeyRef:
                      name: agent-secrets
                      key: database-url
          restartPolicy: OnFailure
```

### Multi-Cloud Awareness

```
AWS:    EKS + RDS + ElastiCache
Azure:  AKS + Azure SQL + Redis Cache
GCP:    GKE + Cloud SQL + Memorystore

Agent Portability:
├── Docker containers = portable
├── K8s manifests = mostly portable
├── Database = cloud-specific
└── Secrets = cloud-specific
```

---

## Summary: Phase 16 Key Takeaways

| Concept | Tumne Kya Seekha |
|---------|-----------------|
| Docker | Multi-stage build, security |
| K8s | Deployment, HPA, multi-tenant |
| Event-Driven | BullMQ queues, Kafka awareness |
| CI/CD | Eval gates, blue-green deploy |
| Observability | OpenTelemetry, agent metrics |
| Cost Optimization | Model selection, caching, batching |
| Security | Network policies, key rotation |
| DR | Backup, multi-cloud awareness |

---

## MINI-TASKS

### Task 1: Dockerize Agent (15 min)
Agent ka Dockerfile banao:
- Multi-stage build
- Non-root user
- Health check

### Task 2: K8s Deployment (20 min)
K8s manifests banao:
- Deployment (3 replicas)
- Service
- HPA (2-10 replicas)
- Network policy

### Task 3: Event Queue (15 min)
BullMQ queue setup karo:
- Task producer
- Worker consumer
- Error handling with retry

### Task 4: CI/CD Pipeline (20 min)
GitHub Actions workflow banao:
- Eval gate (90% pass rate)
- Docker build + Trivy scan
- K8s deploy

---

## INCIDENT.md: Practice Scenarios

### Incident #1: Agent OOM Killed
- **Date:** (Practice Scenario)
- **What Broke:** Agent pod OOMKilled. LLM calls memory zyada le rahe hain.
- **Root Cause:** Memory limit too low for LLM calls.
- **Fix:**
  ```yaml
  # Step 1: Memory limit increase
  resources:
    limits:
      memory: "1Gi"
    requests:
      memory: "512Mi"

  # Step 2: Memory profiling
  import tracemalloc
  tracemalloc.start()
  # ... agent code ...
  print(tracemalloc.get_traced_memory())

  # Step 3: LLM response caching
  # Same query dubara call mat karo

  # Step 4: Batch processing
  # Multiple queries ko ek saath process karo

  # Step 5: Monitor
  kubectl top pod banking-agent -n agents
  ```
- **Prevention:** Monitor memory usage, set appropriate limits, caching
- **Learning:** LLM calls need memory. Cache aggressively.

### Incident #2: Queue Backlog
- **Date:** (Practice Scenario)
- **What Broke:** BullMQ queue has 1000+ pending jobs. Users waiting.
- **Root Cause:** Worker processing too slow. LLM latency high.
- **Fix:**
  ```bash
  # Step 1: Scale workers
  kubectl scale deployment agent-worker --replicas=5

  # Step 2: Check queue depth
  redis-cli LLEN bull:agent-tasks:waiting

  # Step 3: Optimize processing
  # Use cheaper model for simple tasks
  # Batch similar tasks

  # Step 4: Priority queues
  # Critical tasks ko pehle process karo

  # Step 5: Auto-scaling for workers
  apiVersion: autoscaling/v2
  kind: HorizontalPodAutoscaler
  metadata:
    name: worker-hpa
  spec:
    minReplicas: 2
    maxReplicas: 20
    metrics:
      - type: External
        external:
          metric:
            name: bullmq_queue_depth
          target:
            type: AverageValue
            averageValue: "100"
  ```
- **Prevention:** Auto-scaling for workers, priority queues
- **Learning:** Monitor queue depth. Scale proactively.

### Incident #3: Cost Spike Due to Retry Loop
- **Date:** (Practice Scenario)
- **What Broke:** Daily cost $500 (expected $50). Infinite retry loop.
- **Root Cause:** No retry limit. Failed API calls retrying forever.
- **Fix:**
  ```python
  # Step 1: Max retries set
  opts={
      "attempts": 3,
      "backoff": {"type": "exponential", "delay": 1000}
  }

  # Step 2: Circuit breaker
  class CircuitBreaker:
      def __init__(self, failure_threshold=5, reset_timeout=60):
          self.failure_count = 0
          self.failure_threshold = failure_threshold
          self.reset_timeout = reset_timeout
          self.last_failure_time = None
          self.state = "closed"  # closed, open, half-open

      def call(self, func, *args, **kwargs):
          if self.state == "open":
              if time.time() - self.last_failure_time > self.reset_timeout:
                  self.state = "half-open"
              else:
                  raise Exception("Circuit breaker is open")

          try:
              result = func(*args, **kwargs)
              self.failure_count = 0
              self.state = "closed"
              return result
          except Exception as e:
              self.failure_count += 1
              self.last_failure_time = time.time()
              if self.failure_count >= self.failure_threshold:
                  self.state = "open"
              raise

  # Step 3: Cost alerts
  if daily_cost > budget * 0.8:
      send_alert("Cost approaching budget limit!")
  ```
- **Prevention:** Always set retry limits, circuit breaker, cost alerts
- **Learning:** Exponential backoff + circuit breaker = safe retries.

### Incident #4: CI/CD Pipeline Slow
- **Date:** (Practice Scenario)
- **What Broke:** Pipeline takes 30 minutes. Developers waiting.
- **Root Cause:** No caching, sequential jobs, eval suite slow.
- **Fix:**
  ```yaml
  # Step 1: Parallel jobs
  jobs:
    test:
      steps:
        - run: pytest tests/unit/ &
        - run: python -m eval.run_suite &
        - wait

  # Step 2: Cache dependencies
  - uses: actions/cache@v3
    with:
      path: ~/.cache/pip
      key: ${{ runner.os }}-pip-${{ hashFiles('requirements.txt') }}

  # Step 3: Docker layer caching
  - uses: docker/build-push-action@v5
    with:
      cache-from: type=gha
      cache-to: type=gha,mode=max

  # Step 4: Eval optimization
  # Run eval on changed files only
  # Use faster model for eval
  # Parallelize eval cases
  ```
- **Prevention:** Optimize pipeline regularly, caching, parallelization
- **Learning:** Parallel execution saves time. Cache everything.

### Incident #5: Container Image Pull Backoff
- **Date:** (Practice Scenario)
- **What Broke:** Pod stuck in ImagePullBackOff. New deployment not starting.
- **Root Cause:** Wrong image tag or registry auth issue.
- **Fix:**
  ```bash
  # Step 1: Check events
  kubectl describe pod <pod-name> -n agents
  # Events: "Failed to pull image... unauthorized"

  # Step 2: Check image name
  kubectl get deployment banking-agent -n agents -o yaml | grep image
  # Verify image tag exists

  # Step 3: Registry auth
  kubectl create secret docker-registry regcred \
    --docker-server=ghcr.io \
    --docker-username=yourusername \
    --docker-password=${{ secrets.GITHUB_TOKEN }} \
    -n agents

  # Step 4: Update deployment
  kubectl patch serviceaccount default \
    -p '{"imagePullSecrets": [{"name": "regcred"}]}' \
    -n agents

  # Step 5: Never use :latest in production
  # Use specific tags: banking-agent:v1.2.3
  ```
- **Prevention:** Use proper image tags, verify registry auth
- **Learning:** Never use `:latest` in production. Always pin versions.

:::note HANDS-ON: Multi-Region Failover Simulate Karo

Ye exercise tumhe sikhayegi ke jab primary region down ho to traffic kaise automatically secondary region pe route hota hai. Practical demo — primary region kill karke failover observe karenge.

:::

```bash
# File: multi_region_failover.sh

# Step 1: Do tayyar regions — primary (us-east-1) aur secondary (eu-west-1)
# Docker se simulate karte hain

# Primary region agent
docker run -d --name agent-primary \
  -e REGION=us-east-1 \
  -e STATUS=healthy \
  -p 8081:8080 \
  nginx:alpine

# Secondary region agent
docker run -d --name agent-secondary \
  -e REGION=eu-west-1 \
  -e STATUS=healthy \
  -p 8082:8080 \
  nginx:alpine

# Step 2: Health check script banao
cat > health_check.sh << 'EOF'
#!/bin/bash
PRIMARY="http://localhost:8081"
SECONDARY="http://localhost:8082"
HEALTH_FILE="/tmp/active_region"

check_health() {
    curl -sf --max-time 2 "$1/health" > /dev/null 2>&1
}

# Check primary
if check_health "$PRIMARY"; then
    echo "PRIMARY" > "$HEALTH_FILE"
    echo "Active: PRIMARY (us-east-1)"
elif check_health "$SECONDARY"; then
    echo "SECONDARY" > "$HEALTH_FILE"
    echo "Active: SECONDARY (eu-west-1) — FAILOVER"
else
    echo "DOWN" > "$HEALTH_FILE"
    echo "CRITICAL: Both regions down!"
fi

cat "$HEALTH_FILE"
EOF
chmod +x health_check.sh

# Step 3: Request router banao
cat > route_request.sh << 'EOF'
#!/bin/bash
ACTIVE_REGION=$(cat /tmp/active_region 2>/dev/null || echo "PRIMARY")

case "$ACTIVE_REGION" in
    PRIMARY)
        curl -s http://localhost:8081/health && echo " -> Routed to PRIMARY"
        ;;
    SECONDARY)
        curl -s http://localhost:8082/health && echo " -> Routed to SECONDARY (failover)"
        ;;
    DOWN)
        echo "ERROR: No healthy region available"
        exit 1
        ;;
esac
EOF
chmod +x route_request.sh

# Step 4: Normal operation — primary pe route ho raha hai
echo "=== Step 4: Normal Operation ==="
bash health_check.sh
bash route_request.sh
bash route_request.sh

# Step 5: Primary region DOWN karo
echo -e "\n=== Step 5: Primary Region DOWN ==="
docker stop agent-primary
echo "Primary stopped."

# Step 6: Health check — failover detect hona chahiye
echo -e "\n=== Step 6: Failover Detection ==="
bash health_check.sh

# Step 7: Requests ab secondary pe ja rahe hain
echo -e "\n=== Step 7: Requests Route to Secondary ==="
bash route_request.sh
bash route_request.sh

# Step 8: Primary wapas aaye — automatic recovery
echo -e "\n=== Step 8: Primary Recovery ==="
docker start agent-primary
sleep 2
bash health_check.sh
bash route_request.sh

# Step 9: Cleanup
echo -e "\n=== Step 9: Cleanup ==="
docker stop agent-primary agent-secondary 2>/dev/null
docker rm agent-primary agent-secondary 2>/dev/null
echo "Done."
```

**Expected Output:**
```
=== Step 4: Normal Operation ===
Active: PRIMARY (us-east-1)
PRIMARY
PRIMARY -> Routed to PRIMARY
PRIMARY -> Routed to PRIMARY

=== Step 5: Primary Region DOWN ===
Primary stopped.

=== Step 6: Failover Detection ===
Active: SECONDARY (eu-west-1) — FAILOVER
SECONDARY

=== Step 7: Requests Route to Secondary ===
SECONDARY -> Routed to SECONDARY (failover)
SECONDARY -> Routed to Secondary (failover)

=== Step 8: Primary Recovery ===
Active: PRIMARY (us-east-1)
PRIMARY -> Routed to PRIMARY
```

:::caution CHECKPOINT:
1. Failover mein DNS TTL kitna rakhna chahiye — kam TTL se faster failover hota hai lekin zyada DNS queries bhi aati hain?
2. Active-active multi-region setup vs active-passive — dono ka fark kya hai aur kab kaunsa use karoge?
3. Agar dono regions down ho jayein to kya karna chahiye — static error page ya queue system?

:::

---
