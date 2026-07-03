---
sidebar_position: 14
title: "PHASE 11: Observability + SRE + AIOps"
description: "*Est. Time: 3-4 weeks*"
---

# PHASE 11: Observability + SRE + AIOps
*Est. Time: 3-4 weeks*

### Kya seekhna hai
- **Prometheus** (metrics, PromQL, alerting)
- **Grafana** (dashboards, visualization)
- **OpenTelemetry** (metrics + logs + traces — 2026 ka primary standard)
- ELK / Loki (logging)
- SRE principles: SLO/SLA, error budgets
- AIOps: anomaly detection basics
- Chaos Engineering basics (Chaos Mesh, Litmus)

### Free Resources
| Resource | Link |
|---|---|
| **"Prometheus & Grafana Full Course"** — TechWorld with Nana | https://www.youtube.com/@TechWorldwithNana |
| **Official Prometheus Docs** | https://prometheus.io/docs |
| **Official Grafana Docs + free Grafana Cloud tier** | https://grafana.com/docs |
| **OpenTelemetry Official Docs** | https://opentelemetry.io/docs |
| **Google SRE Book (100% free online)** | https://sre.google/books/ |

### Hands-on Checklist
- [ ] Prometheus + Grafana stack deploy karo
- [ ] Custom metrics export karo (Python app se)
- [ ] Distributed tracing setup karo (OTel)
- [ ] Alert rule with threshold + firing test

### Incident Practice
- Missing telemetry → exporter/config fix
- Alert not firing → query/threshold correct karo
- Production outage → logs+traces correlate karke RCA karo

### Meri Recommendation
Google SRE Book zaroor parho — free aur authoritative. OpenTelemetry priority do — cost + latency visibility k liye.

---

*Back to [MERGED-ROADMAP.md](/docs/roadmap)*
