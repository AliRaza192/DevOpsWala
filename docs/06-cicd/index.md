---
sidebar_position: 9
title: "PHASE 6: CI/CD — GitHub Actions + Azure DevOps"
description: "*Est. Time: 3-4 weeks*"
---

# PHASE 6: CI/CD — GitHub Actions + Azure DevOps
*Est. Time: 3-4 weeks*

### Kya seekhna hai
- CI/CD principles, pipeline stages (build → test → scan → deploy)
- **GitHub Actions** (primary — free, global standard)
- **Azure DevOps Pipelines** (Gulf market k liye zaroori)
- Jenkins (legacy/awareness)
- Automated testing in pipelines, deployment strategies (rolling, blue-green, canary)

### Free Resources
| Resource | Link |
|---|---|
| **"GitHub Actions Full Course"** — freeCodeCamp.org | https://www.youtube.com/@freecodecamp |
| **"CI/CD Pipeline Tutorial"** — TechWorld with Nana | https://www.youtube.com/@TechWorldwithNana |
| **GitHub Actions Official Docs** | https://docs.github.com/en/actions |
| **Microsoft Learn — Azure DevOps Pipelines** | https://learn.microsoft.com/en-us/training/paths/build-applications-with-azure-devops/ |

### Hands-on Checklist
- [ ] Build→Test→Scan→Deploy pipeline in GitHub Actions
- [ ] Secret management via GitHub Secrets/Azure Key Vault
- [ ] Auto-deploy to staging on merge
- [ ] Trivy se container scan karo CI/CD mein

### Incident Practice
- Pipeline fail ho jaye → logs debug karke fix karo
- Registry auth/permission issue fix karo
- Secret scanning/image scanning fail ho to patch karo

### Meri Recommendation
GitHub Actions primary banao (free, global standard). Azure DevOps sirf awareness level pe seekho jab tak Gulf-specific job target na ho.

---

*Back to [MERGED-ROADMAP.md](/docs/roadmap)*
