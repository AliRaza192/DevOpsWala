---
sidebar_position: 20
title: "Phase 18: Incident Log"
description: "Real-world incident scenarios for Phase 18"
---

# INCIDENT LOG — Phase: Ultra-Pro Expert Track

---

## Incident #1: Cascading Failure
- **Date:** (Practice Scenario)
- **What Broke:** One service failure brought down entire system
- **Root Cause:** No circuit breakers
- **Fix:**
  ```python
  from circuitbreaker import circuit
  
  @circuit(failure_threshold=5, recovery_timeout=60)
  def call_service():
      return requests.get("http://service/api")
  ```
- **Prevention:** Circuit breakers, bulkheads, timeouts
- **Learning:** Design for failure

---

## Incident #2: Cost Overrun
- **Date:** (Practice Scenario)
- **What Broke:** Monthly bill 3x expected
- **Root Cause:** No cost alerts, zombie resources
- **Fix:**
  ```bash
  aws ec2 describe-instances --filters Name=instance-state-name,Values=stopped
  aws ec2 describe-volumes --filters Name=status,Values=available
  ```
- **Prevention:** FinOps practices, budget alerts
- **Learning:** Regular cost reviews

---

## Incident #3: Security Breach Attempt
- **Date:** (Practice Scenario)
- **What Broke:** Unauthorized access attempt detected
- **Root Cause:** Broad IAM permissions
- **Fix:**
  ```json
  {
    "Effect": "Deny",
    "Action": "*",
    "Resource": "*",
    "Condition": {"Bool": {"aws:SecureTransport": "false"}}
  }
  ```
- **Prevention:** Zero-trust, least privilege, MFA
- **Learning:** Security is everyone's job

---

## Incident #4: Multi-Region Failover Failed
- **Date:** (Practice Scenario)
- **What Broke:** Secondary region didn't take over
- **Root Cause:** DNS not configured for failover
- **Fix:**
  ```bash
  # Configure Route53 health checks
  # Set up failover routing
  # Test failover regularly
  ```
- **Prevention:** Regular DR drills
- **Learning:** Test failover before you need it

---

## Incident #5: Platform Engineering Resistance
- **Date:** (Practice Scenario)
- **What Broke:** Developers not using internal platform
- **Root Cause:** Poor developer experience
- **Fix:**
  ```yaml
  # Improve documentation
  # Add self-service capabilities
  # Get developer feedback
  ```
- **Prevention:** User research, iterate
- **Learning:** Platform is a product
