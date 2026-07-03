---
sidebar_position: 13
title: "PHASE 10: DevSecOps"
description: "*Est. Time: 2-3 weeks*"
---

# PHASE 10: DevSecOps
*Est. Time: 2-3 weeks*

### Kya seekhna hai
- Secret scanning (Gitleaks, TruffleHog)
- Image scanning (**Trivy**)
- SBOM generation (**Syft/Grype**)
- Policy-as-Code (**Kyverno**/OPA)
- Pipeline security gates
- SAST/DAST (SonarQube, OWASP ZAP)
- Supply chain security (Cosign for signing)

### Free Resources
| Resource | Link |
|---|---|
| **Trivy Official Docs** | https://trivy.dev |
| **"DevSecOps Full Course"** — freeCodeCamp.org | https://www.youtube.com/@freecodecamp |
| **Kyverno Official Docs** | https://kyverno.io |
| **OWASP Free Resources** | https://owasp.org |

### Hands-on Checklist
- [ ] Trivy scan integrated in CI pipeline, fail on high-severity
- [ ] SBOM generated with Syft
- [ ] Kyverno policy blocking unsigned images

### Meri Recommendation
Trivy ko apni CI/CD mein integrate karna concrete portfolio project ban sakta hai.

---

*Back to [MERGED-ROADMAP.md](/docs/roadmap)*
