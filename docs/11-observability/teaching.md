---
sidebar_position: 12
title: "PHASE 11: Observability + SRE + AIOps"
description: "**Tumhara level:** Tumne deploy karna seekh liya (Phase 6-9). Ab monitoring seekho — kaise pata chalega ke kuch galat ho"
---

# PHASE 11: Observability + SRE + AIOps — TEACHING

> **Tumhara level:** Tumne deploy karna seekh liya (Phase 6-9). Ab monitoring seekho — kaise pata chalega ke kuch galat ho raha hai. Observability = tumhara system ka CCTV + Health Check + Alarm System. SRE = reliability engineering with data-driven decisions.

---

## Section 1: Observability Kya Hai? — The Three Pillars

:::tip CONCEPT: Observability = Tumhe Pata Hai Kya Ho Raha Hai

**Monitoring vs Observability:**
- Monitoring = predefined questions (CPU high hai?)
- Observability = ad-hoc questions (Why is this specific user slow?)

**3 Pillars:**
1. **Metrics** — Numbers (CPU, memory, request count, error rate)
2. **Logs** — Text records (what happened)
3. **Traces** — Request path (how request traveled through services)

:::

```
User Request
    ↓
[Gateway] → trace_id: abc123
    ↓
[Auth Service] → 2ms
    ↓
[API Service] → 15ms
    ↓
[Database] → 5ms
    ↓
Response → 22ms total
```

**RED Method (Microservices):**
- **Rate** — Requests per second
- **Errors** — Errors per second
- **Duration** — Latency distribution

**USE Method (Infrastructure):**
- **Utilization** — % of resource used
- **Saturation** — Queue depth
- **Errors** — Error count

**Real-world connection:** Tumhare Islamic Banking FTE mein:
- Metrics: "500 error rate 2% hai" → alert
- Logs: "Transaction timeout at 3:42 AM" → debug
- Traces: "Request took 5 seconds because DB was slow" → optimize
- Dashboard: Real-time transaction monitoring

:::caution CHECKPOINT:
1. Metrics, Logs, Traces — ye teeno alag kyun hain? Agar sirf logs ho to kya problem aa sakti hai?
2. Monitoring aur Observability mein kya fark hai?
3. RED aur USE method kab use karoge?

:::

---

## Section 2: Prometheus — Metrics Ka King

:::tip CONCEPT: Prometheus = Numbers Collect + Store + Query

:::

```bash
# Docker se Prometheus chalao
docker run -d --name prometheus \
    -p 9090:9090 \
    -v $(pwd)/prometheus.yml:/etc/prometheus/prometheus.yml \
    prom/prometheus

# prometheus.yml
cat > prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alerts.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets: ['alertmanager:9093']

scrape_configs:
  - job_name: 'nexabook'
    static_configs:
      - targets: ['host.docker.internal:3000']
    metrics_path: '/metrics'
  
  - job_name: 'node-exporter'
    static_configs:
      - targets: ['host.docker.internal:9100']
  
  - job_name: 'kubernetes-pods'
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
EOF
```

### PromQL Deep Dive

```promql
# Request rate (per second)
rate(http_requests_total[5m])

# Error rate (5xx errors)
rate(http_requests_total{status=~"5.."}[5m])

# Error percentage
rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) * 100

# Memory usage percentage
node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes * 100

# 95th percentile latency
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Top 5 endpoints by request count
topk(5, rate(http_requests_total[5m]))

# Predict disk full in 4 hours
predict_linear(node_filesystem_free_bytes[1h], 4*3600) < 0

# Apdex score (satisfaction ratio)
(
  sum(rate(http_request_duration_seconds_bucket{le="0.5"}[5m]))
  +
  sum(rate(http_request_duration_seconds_bucket{le="1.0"}[5m]))
) / 2 / sum(rate(http_request_duration_seconds_bucket[5m]))
```

### Recording Rules (Pre-compute Expensive Queries)

```yaml
# File: recording-rules.yml
groups:
  - name: nexabook-rules
    interval: 30s
    rules:
      - record: nexabook:http_requests:rate5m
        expr: rate(http_requests_total[5m])
      
      - record: nexabook:http_errors:rate5m
        expr: rate(http_requests_total{status=~"5.."}[5m])
      
      - record: nexabook:http_error_ratio:rate5m
        expr: nexabook:http_errors:rate5m / nexabook:http_requests:rate5m
      
      - record: nexabook:http_latency:p95_5m
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

:::note HANDS-ON: Custom Metrics in Python

:::

```python
# File: app.py
from prometheus_client import Counter, Histogram, Gauge, generate_latest
from fastapi import FastAPI
import time, psutil, os

app = FastAPI()

# Metrics define karo
REQUEST_COUNT = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status']
)

REQUEST_LATENCY = Histogram(
    'http_request_duration_seconds',
    'HTTP request latency',
    ['method', 'endpoint'],
    buckets=[0.1, 0.5, 1.0, 2.0, 5.0]
)

ACTIVE_REQUESTS = Gauge(
    'http_active_requests',
    'Number of active requests'
)

@app.middleware("http")
async def metrics_middleware(request, call_next):
    ACTIVE_REQUESTS.inc()
    start_time = time.time()
    try:
        response = await call_next(request)
        duration = time.time() - start_time
        REQUEST_COUNT.labels(
            method=request.method,
            endpoint=request.url.path,
            status=response.status_code
        ).inc()
        REQUEST_LATENCY.labels(
            method=request.method,
            endpoint=request.url.path
        ).observe(duration)
        return response
    finally:
        ACTIVE_REQUESTS.dec()

@app.get("/metrics")
async def metrics():
    return generate_latest()

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "cpu_percent": psutil.cpu_percent(),
        "memory_percent": psutil.virtual_memory().percent
    }
```

:::caution CHECKPOINT:
1. Counter, Histogram, Gauge — ye teeno alag kyun hain? Kab kaunsa use karoge?
2. `rate()` aur `irate()` mein kya fark hai?
3. Recording rules kyun use karte hain?

:::

---

## Section 3: Grafana — Dashboard Ka King

:::tip CONCEPT: Grafana = Metrics Ka Beautiful Face

:::

```bash
# Docker se Grafana chalao
docker run -d --name grafana \
    -p 3000:3000 \
    -e GF_SECURITY_ADMIN_PASSWORD=admin \
    -v grafana-data:/var/lib/grafana \
    grafana/grafana

# Access: http://localhost:3000
# Username: admin
# Password: admin
```

### Dashboard Setup

```json
{
  "dashboard": {
    "title": "NexaBook API Dashboard",
    "panels": [
      {
        "title": "Request Rate",
        "type": "timeseries",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{endpoint}}"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "stat",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~'5..'}[5m]) / rate(http_requests_total[5m]) * 100"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "thresholds": {
              "steps": [
                {"value": 0, "color": "green"},
                {"value": 1, "color": "yellow"},
                {"value": 5, "color": "red"}
              ]
            }
          }
        }
      },
      {
        "title": "P95 Latency",
        "type": "timeseries",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))"
          }
        ]
      }
    ]
  }
}
```

### Import Pre-built Dashboards

```bash
# Popular Dashboard IDs:
# 1860 — Node Exporter Full
# 14282 — Kubernetes Cluster Monitoring
# 12006 — Docker Container Monitoring
# 1471 — FastAPI Application

# Grafana -> + -> Import -> Dashboard ID dallo -> Load
```

### Grafana Variables (Dynamic Dashboards)

```json
{
  "templating": {
    "list": [
      {
        "name": "namespace",
        "type": "query",
        "query": "label_values(kube_pod_info, namespace)",
        "refresh": 2
      },
      {
        "name": "pod",
        "type": "query",
        "query": "label_values(kube_pod_info{namespace=\"$namespace\"}, pod)",
        "refresh": 2
      }
    ]
  }
}
```

### Annotations

```json
{
  "annotations": {
    "list": [
      {
        "name": "Deployments",
        "datasource": "Prometheus",
        "query": "changes(kube_deployment_status_replicas[5m]) > 0",
        "iconColor": "green",
        "titleFormat": "Deployment: {{labels.deployment}}"
      }
    ]
  }
}
```

---

## Section 4: Alerting — Kab Alarm Bajega

:::tip CONCEPT: Alerts = Tumhara Early Warning System

:::

```yaml
# File: alerts.yml (Prometheus)
groups:
  - name: nexabook-alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) * 100 > 5
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }}% (threshold: 5%)"
      
      - alert: HighLatency
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High latency detected"
          description: "P95 latency is {{ $value }}s"
      
      - alert: ServiceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Service is down"
          description: "{{ $labels.instance }} is down"
      
      - alert: HighMemory
        expr: (1 - node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes) * 100 > 90
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage"
          description: "Memory usage is {{ $value }}%"
      
      - alert: DiskSpaceLow
        expr: (node_filesystem_free_bytes / node_filesystem_size_bytes) * 100 < 10
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Disk space low"
          description: "Disk space is {{ $value }}% free"
```

### Alertmanager Configuration

```yaml
# alertmanager.yml
global:
  smtp_smarthost: 'smtp.gmail.com:587'
  smtp_from: 'alerts@nexabook.com'
  smtp_auth_username: 'alerts@nexabook.com'
  smtp_auth_password: 'app-password'

route:
  group_by: ['alertname', 'severity']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'email-alerts'
  routes:
    - match:
        severity: critical
      receiver: 'slack-critical'
      continue: true
    - match:
        severity: warning
      receiver: 'email-alerts'

receivers:
  - name: 'email-alerts'
    email_configs:
      - to: 'ops-team@nexabook.com'
        send_resolved: true
  
  - name: 'slack-critical'
    slack_configs:
      - api_url: 'https://hooks.slack.com/services/xxx/yyy/zzz'
        channel: '#alerts-critical'
        title: '{{ .GroupLabels.alertname }}'
        text: '{{ .CommonAnnotations.description }}'
        send_resolved: true

inhibit_rules:
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname', 'instance']
```

:::note HANDS-ON: Alertmanager Setup

:::

```bash
# Alertmanager run
docker run -d --name alertmanager \
    -p 9093:9093 \
    -v $(pwd)/alertmanager.yml:/etc/alertmanager/alertmanager.yml \
    prom/alertmanager

# Alert test
curl -X POST http://localhost:9093/api/v2/alerts \
  -H "Content-Type: application/json" \
  -d '[{"labels":{"alertname":"TestAlert","severity":"critical"}}]'

# Prometheus alert rules verify
curl http://localhost:9090/api/v1/rules | jq '.data.groups[].rules[] | select(.state=="firing")'
```

:::caution CHECKPOINT:
1. Alert `for:` duration kyun use karte hain? Instant alert kyun nahi?
2. Inhibit rules kya hain? Kab use karoge?
3. Grouping alerts kyun zaroori hai?

:::

---

## Section 5: OpenTelemetry — The Future Standard

:::tip CONCEPT: OpenTelemetry = Metrics + Logs + Traces (Sab Ek Jagah)

OpenTelemetry 2026 ka primary standard hai. Vendor-neutral, language-agnostic.

:::

### Auto-Instrumentation (Zero Code Change)

```bash
# Python auto-instrumentation
pip install opentelemetry-distro
opentelemetry-bootstrap -a install

# Run with auto-instrumentation
opentelemetry-instrument \
  --service_name nexabook \
  --exporter_otlp_endpoint http://otel-collector:4317 \
  python app.py
```

### Manual Instrumentation (Python)

```python
# File: otel_example.py
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.resources import Resource

# Setup
resource = Resource.create({"service.name": "nexabook"})
provider = TracerProvider(resource=resource)
processor = BatchSpanProcessor(OTLPSpanExporter(endpoint="http://otel-collector:4317"))
provider.add_span_processor(processor)
trace.set_tracer_provider(provider)

tracer = trace.get_tracer("nexabook.tracer")

# Usage
def process_transaction(transaction_id: str):
    with tracer.start_as_current_span("process_transaction") as span:
        span.set_attribute("transaction.id", transaction_id)
        
        with tracer.start_as_current_span("validate_input"):
            # Validation logic
            pass
        
        with tracer.start_as_current_span("save_to_database"):
            # Database logic
            pass
        
        with tracer.start_as_current_span("send_notification"):
            # Notification logic
            pass
```

### OpenTelemetry Collector Config

```yaml
# otel-collector-config.yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318
  prometheus:
    config:
      scrape_configs:
        - job_name: 'otel-collector'
          static_configs:
            - targets: ['localhost:8888']

processors:
  batch:
    timeout: 1s
    send_batch_size: 1024
  memory_limiter:
    check_interval: 1s
    limit_mib: 512
    spike_limit_mib: 128

exporters:
  prometheus:
    endpoint: "0.0.0.0:8889"
  logging:
    loglevel: debug
  otlp/tempo:
    endpoint: tempo:4317
    tls:
      insecure: true

service:
  pipelines:
    metrics:
      receivers: [otlp]
      processors: [batch, memory_limiter]
      exporters: [prometheus]
    traces:
      receivers: [otlp]
      processors: [batch, memory_limiter]
      exporters: [otlp/tempo, logging]
```

:::note HANDS-ON: OTel Stack Deploy

:::

```bash
# Docker Compose
cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  otel-collector:
    image: otel/opentelemetry-collector-contrib:latest
    command: --config=/etc/otelcol/config.yaml
    volumes:
      - ./otel-collector-config.yaml:/etc/otelcol/config.yaml
    ports:
      - 4317:4317
      - 4318:4318
      - 8889:8889
  
  tempo:
    image: grafana/tempo:latest
    command: -config.file=/etc/tempo/tempo.yaml
    ports:
      - 3200:3200
  
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - 9090:9090
  
  grafana:
    image: grafana/grafana:latest
    ports:
      - 3000:3000
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
  
  loki:
    image: grafana/loki:latest
    ports:
      - 3100:3100

  promtail:
    image: grafana/promtail:latest
    volumes:
      - /var/log:/var/log
      - ./promtail-config.yml:/etc/promtail/config.yml
    command: -config.file=/etc/promtail/config.yml
EOF
```

---

## Section 6: Distributed Tracing — Jaeger + Tempo

:::tip CONCEPT: Traces = Request Ka Journey Map

Har request ka trace hota hai — kaunsa service kitna time laga.

:::

### Jaeger Setup

```bash
# Docker Compose
cat > docker-compose-jaeger.yml << 'EOF'
version: '3.8'
services:
  jaeger:
    image: jaegertracing/all-in-one:latest
    environment:
      - COLLECTOR_OTLP_ENABLED=true
    ports:
      - 16686:16686  # UI
      - 14268:14268  # Collector HTTP
      - 4317:4317    # OTLP gRPC
      - 4318:4318    # OTLP HTTP
EOF

docker-compose -f docker-compose-jaeger.yml up -d
# Access: http://localhost:16686
```

### Grafana Tempo (Lightweight Tracing)

```yaml
# tempo.yaml
server:
  http_listen_port: 3200

distributor:
  receivers:
    otlp:
      protocols:
        grpc:
          endpoint: 0.0.0.0:4317
        http:
          endpoint: 0.0.0.0:4318

storage:
  trace:
    backend: local
    local:
      path: /var/tempo/traces
```

### Trace-Log Correlation

```yaml
# Loki + Tempo link
# Grafana -> Data Sources -> Loki -> Derived Fields
# TraceID field -> Tempo data source
```

:::caution CHECKPOINT:
1. Jaeger aur Tempo mein kya fark hai?
2. Trace-Log correlation kyun zaroori hai?

:::

---

## Section 7: SRE Principles — Error Budgets + Postmortems

:::tip CONCEPT: SLO/SLA/Error Budget = Tumhari Reliability Contract

:::

```yaml
# SLO Definition
# Service: Nexabook API
# SLO: 99.9% availability (30 days)
# Error Budget: 0.1% = 43.2 minutes downtime per month

# Alert: Error budget 50% consumed
- alert: ErrorBudgetBurnRate
  expr: |
    (
      1 - (
        sum(rate(http_requests_total{status!~"5.."}[30d]))
        /
        sum(rate(http_requests_total[30d]))
      )
    ) > 0.0005
  for: 5m
  labels:
    severity: critical
  annotations:
    summary: "Error budget burning too fast"
```

### SRE Hierarchy

```
1. Eliminate Toil — Automate repetitive tasks
2. Automate Everything — If you do it twice, script it
3. Measure Everything — If you can't measure it, you can't improve it
4. Fail Fast, Learn Fast — Blameless postmortems
```

### Blameless Postmortem Template

```markdown
# Incident Postmortem: [Incident Name]

## Summary
- **Date:** YYYY-MM-DD
- **Duration:** X hours Y minutes
- **Impact:** X% of users affected
- **Severity:** P1/P2/P3

## Timeline (UTC)
- HH:MM — Alert fired
- HH:MM — On-call engineer paged
- HH:MM — Root cause identified
- HH:MM — Fix deployed
- HH:MM — Service fully recovered

## Root Cause
[Technical description of what went wrong]

## What Went Well
- [List things that worked]

## What Went Wrong
- [List things that failed]

## Action Items
| Action | Owner | Due Date | Status |
|--------|-------|----------|--------|
| Add Prometheus alerting for API latency > 500ms | Ali | [apni date daalo] | TODO |
| Automate log rotation for /var/log/nginx/ | Ali | [apni date daalo] | TODO |

## Lessons Learned
- [Key takeaways]
```

### On-Call Best Practices

```
1. Runbook har alert ke liye ho
2. Escalation path documented ho
3. Contact list updated ho
4. Handoff notes proper ho
5. Postmortem within 48 hours
6. Action items tracked
```

---

## Section 8: Chaos Engineering — Break Things on Purpose

:::tip CONCEPT: Chaos = Controlled Experiments to Find Weaknesses

:::

```bash
# Chaos Mesh install
helm repo add chaos-mesh https://charts.chaos-mesh.org
helm install chaos-mesh chaos-mesh/chaos-mesh \
    --namespace chaos-mesh \
    --create-namespace \
    --set chaosDaemon.runtime=containerd \
    --set chaosDaemon.socketPath=/run/containerd/containerd.sock
```

### Chaos Experiments

```yaml
# Pod Failure
apiVersion: chaos-mesh.org/v1alpha1
kind: PodChaos
metadata:
  name: pod-failure
spec:
  action: pod-failure
  mode: one
  selector:
    namespaces: [nexabook]
    labelSelectors:
      app: nexabook
  duration: "5m"

---
# Network Latency
apiVersion: chaos-mesh.org/v1alpha1
kind: NetworkChaos
metadata:
  name: network-latency
spec:
  action: delay
  mode: one
  selector:
    namespaces: [nexabook]
  delay:
    latency: "200ms"
    correlation: "50"
    jitter: "50ms"
  duration: "10m"

---
# CPU Stress
apiVersion: chaos-mesh.org/v1alpha1
kind: StressChaos
metadata:
  name: cpu-stress
spec:
  mode: one
  selector:
    namespaces: [nexabook]
  stressors:
    cpu:
      workers: 2
      load: 80
  duration: "5m"
```

### Litmus (Alternative)

```bash
# Litmus install
kubectl apply -f https://litmuschaos.github.io/litmus/litmus-3.0.0.yaml

# Create experiment
kubectl apply -f - << 'EOF'
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: pod-delete
spec:
  engineState: active
  experimentinfo:
    experimentSpaceref: litmus/pod-delete
    experimentComponents:
      env:
        - name: TOTAL_CHAOS_DURATION
          value: '30'
        - name: CHAOS_NAMESPACE
          value: 'litmus'
EOF
```

---

## Section 9: AIOps — AI for Operations

:::tip CONCEPT: AIOps = AI Tumhari Monitoring Ko Smart Banata Hai

**AIOps Use Cases:**
- Anomaly detection (unusual patterns detect karo)
- Noise reduction (false alerts filter karo)
- Root cause analysis (problem kahan se aayi)
- Capacity planning (future demand predict karo)

:::

### Anomaly Detection with Python

```python
# File: anomaly_detection.py
import numpy as np
from scipy import stats

def detect_anomalies(metrics: list, threshold: float = 3.0):
    """Z-score based anomaly detection"""
    mean = np.mean(metrics)
    std = np.std(metrics)
    z_scores = [(x - mean) / std for x in metrics]
    anomalies = [(i, x) for i, (x, z) in enumerate(zip(metrics, z_scores)) if abs(z) > threshold]
    return anomalies

# Example
error_rates = [0.5, 0.3, 0.4, 0.6, 0.5, 15.0, 0.4, 0.3]  # 15.0 is anomaly
anomalies = detect_anomalies(error_rates)
print(f"Anomalies at indices: {anomalies}")
```

### Alert Noise Reduction

```python
# Correlation engine — group related alerts
def correlate_alerts(alerts):
    """Group alerts by root cause"""
    groups = {}
    for alert in alerts:
        key = (alert['service'], alert['alertname'])
        if key not in groups:
            groups[key] = []
        groups[key].append(alert)
    return groups
```

### AIOps Tools

```
- Datadog (commercial, ML-based anomaly detection)
- Moogsoft (AI event correlation)
- PagerDuty (AI-assisted incident response)
- BigPanda (AIOps platform)
- Open source: Prometheus + Grafana + custom ML
```

:::caution CHECKPOINT:
1. AIOps sirf large companies ke liye hai ya small teams ke liye bhi?
2. Anomaly detection kaise kaam karta hai? Z-score kya hai?

:::

---

## Summary: Phase 11 Key Takeaways

| Concept | Tumne Kya Seekha |
|---------|-----------------|
| Three Pillars | Metrics, Logs, Traces |
| Prometheus | PromQL, recording rules, custom metrics |
| Grafana | Dashboards, variables, annotations |
| Alerting | Rules, Alertmanager, grouping, inhibition |
| OpenTelemetry | Auto-instrumentation, collector, unified telemetry |
| Distributed Tracing | Jaeger, Tempo, trace-log correlation |
| SRE | SLO, SLA, Error Budget, Postmortems |
| Chaos Engineering | Chaos Mesh, Litmus, controlled experiments |
| AIOps | Anomaly detection, noise reduction |

---

## MINI-TASKS

### Task 1: Prometheus + Grafana (20 min)
Stack deploy karo:
- Prometheus scraping
- Grafana dashboard import (ID: 1860)
- Custom metric add karo

### Task 2: Alert Rules (15 min)
5 alerts setup karo:
- High error rate
- High latency
- Service down
- High memory
- Disk space low

### Task 3: OpenTelemetry (15 min)
OTel setup karo:
- Auto-instrumentation Python app
- Collector deploy karo
- Grafana mein traces dekho

### Task 4: Chaos Experiment (15 min)
Chaos Mesh deploy karo:
- Pod failure experiment
- Network latency experiment
- Verify karo ke monitoring detect karta hai

---

## INCIDENT.md: Practice Scenarios

### Incident #1: No Metrics Being Scraped
- **Date:** (Practice Scenario)
- **What Broke:** Grafana dashboard empty hai. Sab panels "No data" dikha rahe hain.
- **Root Cause:** Prometheus target down hai. Network firewall port 9100 block kar raha hai.
- **Fix:**
  ```bash
  # Step 1: Prometheus targets check
  curl http://localhost:9090/targets
  # node-exporter "DOWN" dikhega

  # Step 2: Port connectivity test
  curl http://host.docker.internal:9100/metrics
  # Connection refused = port blocked

  # Step 3: Firewall check
  sudo ufw status
  # Port 9100 blocked hai

  # Step 4: Firewall rule add
  sudo ufw allow 9100/tcp
  sudo ufw reload

  # Step 5: Verify
  curl http://host.docker.internal:9100/metrics
  # Metrics output aayega

  # Step 6: Prometheus refresh
  # Prometheus UI -> Status -> Targets
  # node-exporter "UP" hona chahiye

  # Step 7: Grafana refresh
  # Dashboard reload karo, data aana chahiye
  ```
- **Prevention:** Network rules document karo, Prometheus health monitoring
- **Learning:** Prometheus = pull-based. Agar target accessible nahi hai to metrics nahi aayenge.

### Incident #2: Alert Not Firing
- **Date:** (Practice Scenario)
- **What Broke:** Error rate 10% hai lekin alert nahi aaya. 30 minutes ho gaye.
- **Root Cause:** Alert rule mein `for: 30m` set hai. 30 minutes wait karna padega.
- **Fix:**
  ```bash
  # Step 1: Alert rules check
  curl http://localhost:9090/api/v1/rules | jq '.data.groups[].rules[] | select(.state=="pending")'
  # "pending" status dikhega

  # Step 2: Rule detail check
  curl http://localhost:9090/api/v1/rules | jq '.data.groups[].rules[].duration'
  # duration: 1800 (30 minutes)

  # Step 3: Temporarily reduce duration
  # alerts.yml mein for: 30m -> for: 1m
  # Prometheus reload
  curl -X POST http://localhost:9090/-/reload

  # Step 4: Alert fire hoga
  curl http://localhost:9090/api/v1/alerts | jq '.data.alerts[] | select(.labels.alertname=="HighErrorRate")'
  # "firing" status

  # Step 5: Permanent fix
  # alerts.yml mein rational duration set karo
  # for: 5m (production ke liye sahi)
  ```
- **Prevention:** Alert rules regularly test karo, `amtool` use karo
- **Learning:** `for:` duration = delay before firing. Short duration = noise, long duration = slow response.

### Incident #3: Production Outage — No Logs
- **Date:** (Practice Scenario)
- **What Broke:** Service down hai lekin logs nahi mil rahe. Debug karne mein 2 hours lag gaye.
- **Root Cause:** Logging level DEBUG set hai. Production mein INFO chahiye tha. Debug logs flooding ho rahi hai.
- **Fix:**
  ```bash
  # Step 1: Current log level check
  kubectl get configmap nexabook-config -o yaml
  # LOG_LEVEL: DEBUG

  # Step 2: Quick fix
  kubectl set env deployment/nexabook LOG_LEVEL=INFO

  # Step 3: ConfigMap update
  kubectl patch configmap nexabook-config -p '{"data":{"LOG_LEVEL":"INFO"}}'

  # Step 4: Pod restart
  kubectl rollout restart deployment/nexabook

  # Step 5: Verify logs
  kubectl logs -l app=nexabook --tail=50
  # INFO level logs aayenge

  # Step 6: Permanent fix
  # Environment-based configuration
  # dev: DEBUG, staging: INFO, production: WARN
  ```
- **Prevention:** Environment-based log levels, ConfigMap use karo
- **Learning:** Debug logs production mein flooding karte hain. Right level = right debugging.

### Incident #4: Prometheus OOM Killed
- **Date:** (Practice Scenario)
- **What Broke:** Prometheus crash ho raha hai. Pod OOM killed.
- **Root Cause:** Too many metrics, low memory. 10,000+ time series.
- **Fix:**
  ```bash
  # Step 1: Memory usage check
  kubectl top pod prometheus-0
  # Memory: 3.8Gi (limit: 4Gi)

  # Step 2: Metrics count
  curl http://localhost:9090/api/v1/label/__name__/values | jq length
  # 10000+

  # Step 3: Resource limit increase
  # prometheus-statefulset.yaml:
  resources:
    limits:
      memory: "8Gi"
    requests:
      memory: "4Gi"

  # Step 4: Scrape interval increase
  # prometheus.yml: scrape_interval: 15s -> 30s

  # Step 5: Recording rules add karo
  # Complex queries ko pre-compute karo
  groups:
    - name: recording-rules
      rules:
        - record: job:http_requests:rate5m
          expr: rate(http_requests_total[5m])

  # Step 6: Prometheus WAL size limit
  # --storage.tsdb.wal-compression enabled
  ```
- **Prevention:** Recordings rules, right memory limits, scrape interval optimization
- **Learning:** Prometheus memory proportional hai time series ke. Recording rules complex queries ko optimize karte hain.

### Incident #5: Distributed Tracing Not Working
- **Date:** (Practice Scenario)
- **What Broke:** Jaeger mein traces nahi aa rahe. Services connected nahi hain.
- **Root Cause:** OTel collector properly configured nahi hai. Port 4317 block hai.
- **Fix:**
  ```bash
  # Step 1: Collector status check
  kubectl logs otel-collector --tail=50
  # Error: "connection refused"

  # Step 2: Port connectivity
  kubectl exec -it nexabook-pod -- curl otel-collector:4317
  # Connection refused

  # Step 3: Service check
  kubectl get svc otel-collector
  # Port mapping check karo

  # Step 4: Collector config verify
  kubectl get configmap otel-config -o yaml
  # OTLP receiver port 4317 hona chahiye

  # Step 5: Network policy check
  kubectl get networkpolicy
  # Agar policy hai to OTel port allow karo

  # Step 6: Pod restart
  kubectl rollout restart deployment/nexabook

  # Step 7: Verify
  kubectl exec -it nexabook-pod -- curl otel-collector:4317
  # Response aayega
  curl http://localhost:16686  # Jaeger UI
  # Traces dikhne chahiye
  ```
- **Prevention:** Network policies properly configure karo, OTel collector health monitoring
- **Learning:** Tracing = distributed system ka GPS. Agar collector accessible nahi hai to traces nahi aayenge.
