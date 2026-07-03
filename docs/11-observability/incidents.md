---
sidebar_position: 13
title: "Phase 11: Incident Log"
description: "Real-world incident scenarios for Phase 11"
---

# INCIDENT LOG — Phase: Observability + SRE + AIOps

---

## Incident #1: No Metrics Being Scraped
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

  # Step 6: Prometheus refresh
  curl http://localhost:9090/targets
  # node-exporter "UP" hona chahiye

  # Step 7: Grafana refresh
  # Dashboard reload karo, data aana chahiye
  ```
- **Prevention:** Network rules document karo, Prometheus health monitoring
- **Learning:** Prometheus = pull-based. Agar target accessible nahi hai to metrics nahi aayenge.

---

## Incident #2: Alert Not Firing
- **Date:** (Practice Scenario)
- **What Broke:** Error rate 10% hai lekin alert nahi aaya. 30 minutes ho gaye.
- **Root Cause:** Alert rule mein `for: 30m` set hai.
- **Fix:**
  ```bash
  # Step 1: Alert rules check
  curl http://localhost:9090/api/v1/rules | jq '.data.groups[].rules[] | select(.state=="pending")'

  # Step 2: Duration check
  curl http://localhost:9090/api/v1/rules | jq '.data.groups[].rules[].duration'
  # duration: 1800 (30 minutes)

  # Step 3: Temporarily reduce duration
  # alerts.yml: for: 30m -> for: 1m
  curl -X POST http://localhost:9090/-/reload

  # Step 4: Alert fire hoga
  curl http://localhost:9090/api/v1/alerts | jq '.data.alerts[].labels.alertname'

  # Step 5: Permanent fix
  # alerts.yml mein for: 5m set karo
  ```
- **Prevention:** Alert rules regularly test karo, `amtool` use karo
- **Learning:** `for:` duration = delay before firing. Short = noise, long = slow response.

---

## Incident #3: Production Outage — No Logs
- **Date:** (Practice Scenario)
- **What Broke:** Service down hai lekin logs nahi mil rahe.
- **Root Cause:** Logging level DEBUG set hai. Production mein INFO chahiye.
- **Fix:**
  ```bash
  # Step 1: Current log level check
  kubectl get configmap nexabook-config -o yaml

  # Step 2: Quick fix
  kubectl set env deployment/nexabook LOG_LEVEL=INFO

  # Step 3: ConfigMap update
  kubectl patch configmap nexabook-config -p '{"data":{"LOG_LEVEL":"INFO"}}'

  # Step 4: Pod restart
  kubectl rollout restart deployment/nexabook

  # Step 5: Verify
  kubectl logs -l app=nexabook --tail=50
  ```
- **Prevention:** Environment-based log levels
- **Learning:** Debug logs production mein flooding karte hain.

---

## Incident #4: Prometheus OOM Killed
- **Date:** (Practice Scenario)
- **What Broke:** Prometheus crash ho raha hai. Pod OOM killed.
- **Root Cause:** Too many metrics, low memory.
- **Fix:**
  ```bash
  # Step 1: Memory usage check
  kubectl top pod prometheus-0

  # Step 2: Resource limit increase
  resources:
    limits:
      memory: "8Gi"

  # Step 3: Scrape interval increase
  scrape_interval: 30s

  # Step 4: Recording rules add
  groups:
    - name: recording-rules
      rules:
        - record: job:http_requests:rate5m
          expr: rate(http_requests_total[5m])
  ```
- **Prevention:** Recording rules, right memory limits
- **Learning:** Prometheus memory proportional hai time series ke.

---

## Incident #5: Distributed Tracing Not Working
- **Date:** (Practice Scenario)
- **What Broke:** Jaeger mein traces nahi aa rahe.
- **Root Cause:** OTel collector port 4317 block hai.
- **Fix:**
  ```bash
  # Step 1: Collector status
  kubectl logs otel-collector --tail=50

  # Step 2: Port connectivity
  kubectl exec -it nexabook-pod -- curl otel-collector:4317

  # Step 3: Service check
  kubectl get svc otel-collector

  # Step 4: Network policy check
  kubectl get networkpolicy

  # Step 5: Pod restart
  kubectl rollout restart deployment/nexabook
  ```
- **Prevention:** Network policies properly configure karo
- **Learning:** Tracing = distributed system ka GPS.
