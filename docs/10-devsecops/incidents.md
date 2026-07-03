---
sidebar_position: 12
title: "Phase 10: Incident Log"
description: "Real-world incident scenarios for Phase 10"
---

# INCIDENT LOG — Phase: DevSecOps

---

## Incident #1: Secret Leaked in Git History
- **Date:** (Practice Scenario)
- **What Broke:** API key Git mein commit ho gayi. GitHub notification aaya.
- **Root Cause:** .env file accidentally commit ho gaya. Developer ne .gitignore nahi kiya tha.
- **Fix:**
  ```bash
  # Step 1: Immediate response — API key rotate karo
  # AWS console -> IAM -> Access keys -> Deactivate old key
  # Create new key, update all services

  # Step 2: Git history se remove
  pip install git-filter-repo
  git filter-repo --path .env --invert-paths
  git push origin --force --all

  # Step 3: Verify removal
  git log --all -p -- .env
  # Should return empty

  # Step 4: Add protection
  echo ".env" >> .gitignore
  echo "*.env" >> .gitignore

  # Step 5: Pre-commit hook
  cat > .git/hooks/pre-commit << 'EOF'
  #!/bin/bash
  gitleaks detect --staged --verbose
  if [ $? -ne 0 ]; then
      echo "ERROR: Secrets detected! Commit blocked."
      exit 1
  fi
  EOF
  chmod +x .git/hooks/pre-commit
  ```
- **Prevention:** .gitignore + pre-commit hooks + branch protection rules
- **Learning:** Git history permanent hai. `filter-repo` use karo.

---

## Incident #2: Critical Vulnerability in Production Image
- **Date:** (Practice Scenario)
- **What Broke:** Trivy scan mein 47 CVEs mile. 5 Critical. Production mein vulnerable image hai.
- **Root Cause:** Base image outdated hai. `python:3.8` use ho raha hai jo deprecated hai.
- **Fix:**
  ```bash
  # Step 1: Vulnerability scan
  trivy image --severity CRITICAL python:3.8

  # Step 2: Base image update
  # Dockerfile: FROM python:3.8 -> FROM python:3.12-slim

  # Step 3: Dependencies update
  pip install --upgrade pip
  pip-audit
  pip install --upgrade -r requirements.txt

  # Step 4: Rebuild
  docker build -t ghcr.io/yourorg/nexabook:v2 .

  # Step 5: Rescan
  trivy image ghcr.io/yourorg/nexabook:v2

  # Step 6: Deploy
  kubectl set image deployment/nexabook nexabook=ghcr.io/yourorg/nexabook:v2
  ```
- **Prevention:** Base image update, Trivy scan CI/CD mandatory, Dependabot enable
- **Learning:** Vulnerable base image = sab kuch vulnerable.

---

## Incident #3: Pod Rejected by Kyverno Policy
- **Date:** (Practice Scenario)
- **What Broke:** Deployment fail ho rahi hai. Kyverno policy block kar rahi hai.
- **Root Cause:** "require-resource-limits" policy enabled hai. Developer ne limits nahi diye.
- **Fix:**
  ```bash
  # Step 1: Error check
  kubectl get events -n nexabook

  # Step 2: Policy check
  kubectl get clusterpolicies

  # Step 3: Fix — resource limits add karo
  resources:
    limits:
      memory: "256Mi"
      cpu: "500m"
    requests:
      memory: "128Mi"
      cpu: "250m"

  # Step 4: Apply
  kubectl apply -f deployment.yaml
  ```
- **Prevention:** Developer ko policies batao, resource limits template mein add karo
- **Learning:** Policy-as-Code = rules enforced automatically.

---

## Incident #4: Unsigned Image Blocked
- **Date:** (Practice Scenario)
- **What Broke:** Pod create nahi ho raha. Kyverno "require-cosign-signature" block kar rahi hai.
- **Root Cause:** Image sign nahi ki gayi.
- **Fix:**
  ```bash
  # Step 1: Error check
  kubectl describe pod nexabook -n nexabook

  # Step 2: Image sign karo
  cosign sign ghcr.io/yourorg/nexabook:v1.0

  # Step 3: Verify
  cosign verify ghcr.io/yourorg/nexabook:v1.0

  # Step 4: Pod recreate
  kubectl delete pod nexabook -n nexabook
  ```
- **Prevention:** CI/CD mein image signing mandatory, Cosign key secure
- **Learning:** Unsigned image = untrusted.

---

## Incident #5: Compliance Audit Failed — No SBOM
- **Date:** (Practice Scenario)
- **What Broke:** SOC2 audit mein SBOM nahi mila. Compliance check fail.
- **Root Cause:** Pipeline mein SBOM generation add nahi tha.
- **Fix:**
  ```bash
  # Step 1: Current image ka SBOM generate
  syft ghcr.io/yourorg/nexabook:v1.0 -o spdx-json > sbom-v1.0.json

  # Step 2: SBOM scan
  grype sbom:sbom-v1.0.json --fail-on critical

  # Step 3: Git mein commit
  git add sbom-v1.0.json
  git commit -m "chore: SBOM for v1.0"
  git push

  # Step 4: Pipeline mein add
  # .github/workflows/ci.yml mein SBOM step add karo
  ```
- **Prevention:** CI/CD mein SBOM mandatory, har release ke liye SBOM archive
- **Learning:** SBOM = ingredient list. Compliance bodies require karti hain.
