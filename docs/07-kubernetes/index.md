---
sidebar_position: 10
title: "PHASE 7: Container Orchestration — Kubernetes + Helm"
description: "*Est. Time: 5-6 weeks (sabse important aur sabse mushkil phase)*"
---

# PHASE 7: Container Orchestration — Kubernetes + Helm
*Est. Time: 5-6 weeks (sabse important aur sabse mushkil phase)*

### Kya seekhna hai
- K8s architecture (control plane, nodes, etcd, API server)
- Core objects: Pods, Deployments, ReplicaSets, Services
- ConfigMaps, Secrets, Namespaces
- Scaling: HPA (Horizontal Pod Autoscaler)
- Helm (charts, values, releases)
- Networking: Services, Ingress
- Security: RBAC, Network Policies
- Managed K8s: **EKS** (AWS), **AKS** (Azure), **GKE** (GCP)
- Pod Disruption Budgets (PDB)
- Storage: PV, PVC, StorageClasses

### Free Resources
| Resource | Link |
|---|---|
| **"Kubernetes Tutorial for Beginners"** — TechWorld with Nana (4hrs) | https://www.youtube.com/@TechWorldwithNana |
| **"Kubernetes Crash Course"** — freeCodeCamp.org | https://www.youtube.com/@freecodecamp |
| **KodeKloud — Free Kubernetes Labs + CKA prep** | https://www.youtube.com/@KodeKloud |
| **Official Kubernetes Docs** | https://kubernetes.io/docs/tutorials/ |
| **Killercoda — free interactive K8s scenarios** | https://killercoda.com |
| **LFS158x — edX (FREE audit)** | https://www.edx.org/learn/kubernetes/the-linux-foundation-introduction-to-kubernetes |

### Free/Cheap Certification Prep
- **CKA — KodeKloud's free course covers full syllabus**
- **LFS158x — edX (FREE audit)**

### Hands-on Checklist
- [ ] Local cluster (kind/minikube) + kubectl basics
- [ ] 3-tier app deploy karo (Frontend + Backend + DB)
- [ ] ConfigMap/Secret injection
- [ ] Helm chart package + deploy
- [ ] RBAC role/binding + Network Policy
- [ ] HPA setup with load testing

### Incident Practice
- `CrashLoopBackOff` debug karo
- Service unreachable ho to selector/port fix karo
- Misconfigured env causes failure → correct values
- Access denied / blocked traffic → RBAC/network policy adjust karo

### Meri Recommendation
Career turning-point phase. Islamic Banking FTE ko local cluster pe deploy karo, phir EKS/AKS le jao.

---

*Back to [MERGED-ROADMAP.md](/docs/roadmap)*
