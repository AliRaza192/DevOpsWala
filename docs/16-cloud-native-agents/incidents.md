---
sidebar_position: 18
title: "Phase 16: Incident Log"
description: "Real-world incident scenarios for Phase 16"
---

# INCIDENT LOG — Phase: Merge & Integration

---

## Incident #1: Agent OOM Killed
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

  # Step 3: LLM response caching
  # Same query dubara call mat karo

  # Step 4: Monitor
  kubectl top pod banking-agent -n agents
  ```
- **Prevention:** Monitor memory usage, caching
- **Learning:** LLM calls need memory. Cache aggressively.

---

## Incident #2: Queue Backlog
- **Date:** (Practice Scenario)
- **What Broke:** BullMQ queue has 1000+ pending jobs.
- **Root Cause:** Worker processing too slow.
- **Fix:**
  ```bash
  # Step 1: Scale workers
  kubectl scale deployment agent-worker --replicas=5

  # Step 2: Check queue depth
  redis-cli LLEN bull:agent-tasks:waiting

  # Step 3: Priority queues
  # Critical tasks ko pehle process karo

  # Step 4: Auto-scaling
  apiVersion: autoscaling/v2
  kind: HorizontalPodAutoscaler
  spec:
    minReplicas: 2
    maxReplicas: 20
  ```
- **Prevention:** Auto-scaling for workers
- **Learning:** Monitor queue depth.

---

## Incident #3: Cost Spike Due to Retry Loop
- **Date:** (Practice Scenario)
- **What Broke:** Daily cost $500 (expected $50).
- **Root Cause:** Infinite retry loop.
- **Fix:**
  ```python
  # Step 1: Max retries
  opts={"attempts": 3, "backoff": {"type": "exponential", "delay": 1000}}

  # Step 2: Circuit breaker
  class CircuitBreaker:
      def __init__(self, failure_threshold=5):
          self.failure_count = 0
          self.failure_threshold = failure_threshold

      def call(self, func, *args, **kwargs):
          if self.failure_count >= self.failure_threshold:
              raise Exception("Circuit breaker open")
          try:
              result = func(*args, **kwargs)
              self.failure_count = 0
              return result
          except Exception:
              self.failure_count += 1
              raise

  # Step 3: Cost alerts
  if daily_cost > budget * 0.8:
      send_alert("Cost approaching limit!")
  ```
- **Prevention:** Retry limits, circuit breaker, cost alerts
- **Learning:** Exponential backoff + circuit breaker = safe.

---

## Incident #4: CI/CD Pipeline Slow
- **Date:** (Practice Scenario)
- **What Broke:** Pipeline takes 30 minutes.
- **Root Cause:** No caching, sequential jobs.
- **Fix:**
  ```yaml
  # Step 1: Parallel jobs
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
  ```
- **Prevention:** Caching, parallelization
- **Learning:** Parallel execution saves time.

---

## Incident #5: Container Image Pull Backoff
- **Date:** (Practice Scenario)
- **What Broke:** Pod stuck in ImagePullBackOff.
- **Root Cause:** Wrong image tag or registry auth.
- **Fix:**
  ```bash
  # Step 1: Check events
  kubectl describe pod <pod-name> -n agents

  # Step 2: Registry auth
  kubectl create secret docker-registry regcred \
    --docker-server=ghcr.io \
    --docker-username=yourusername \
    --docker-password=${{ secrets.GITHUB_TOKEN }} \
    -n agents

  # Step 3: Update deployment
  kubectl patch serviceaccount default \
    -p '{"imagePullSecrets": [{"name": "regcred"}]}' \
    -n agents
  ```
- **Prevention:** Use proper image tags, verify registry auth
- **Learning:** Never use `:latest` in production.
