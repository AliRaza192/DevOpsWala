---
sidebar_position: 11
title: "Phase 9: Incident Log"
description: "Real-world incident scenarios for Phase 9"
---

# INCIDENT LOG — Phase: GitOps & ArgoCD

---

## Incident #1: ArgoCD Sync Failed — "Unauthorized"
- **Date:** (Practice Scenario)
- **What Broke:** ArgoCD app "OutOfSync" hai, sync nahi ho raha. Error: "Unauthorized"
- **Root Cause:** Git repo mein deploy key nahi hai ya password galat hai
- **Fix:**
  ```bash
  # Step 1: App status dekho
  argocd app get nexabook
  # "OutOfSync" + "Last Sync: Error" dikhega

  # Step 2: Error detail dekho
  argocd app get nexabook --refresh
  # "time=\"...\" level=error msg=\"rpc error: code = Unknown desc = Unauthorized\""

  # Step 3: Repo list verify karo
  argocd repo list
  # Agar repo nahi dikhta to add karo
  argocd repo add https://github.com/your/repo.git --username xxx --password xxx

  # Step 4: Ya deploy key use karo (sahi approach)
  # GitHub -> Settings -> Deploy keys -> Add key (read-only)
  # ArgoCD -> Settings -> Repositories -> SSH key paste karo

  # Step 5: Manifest validate karo
  kubectl apply -f k8s/deployment.yaml --dry-run=client

  # Step 6: Manual sync
  argocd app sync nexabook

  # Step 7: Health check
  argocd app get nexabook -o json | jq '.status.health'
  ```
- **Prevention:** Deploy keys use karo (read-only), manifest validation CI/CD mein add karo
- **Learning:** ArgoCD Git se pull karta hai. Access nahi = sync nahi.

---

## Incident #2: Drift Detected — Manual Change Reverted
- **Date:** (Practice Scenario)
- **What Broke:** Manual change kiya cluster pe (`kubectl edit`), ArgoCD revert kar raha hai
- **Root Cause:** GitOps mein manual changes = drift. ArgoCD self-heal se revert karta hai.
- **Fix:**
  ```bash
  # Step 1: ArgoCD mein drift detect hoga
  argocd app get nexabook
  # Status: "OutOfSync"

  # Step 2: Kya change hua dekho
  argocd app diff nexabook
  # Manual change dikhega (e.g., replicas 3 -> 5)

  # Step 3: Option 1 — Git mein change karo (sahi approach)
  # k8s/deployment.yaml mein change karo
  git commit -am "chore: update replicas to 5"
  git push
  # ArgoCD auto-sync karega

  # Step 4: Option 2 — Self-heal se revert (if enabled)
  # ArgoCD automatically Git state restore karega
  # Manual change automatically undo hoga

  # Step 5: Option 3 — Manual sync (force)
  argocd app sync nexabook --force

  # Step 6: Disable self-heal agar manual changes allowed hain
  argocd app set nexabook --sync-policy none
  # Warning: Ye GitOps principle todta hai
  ```
- **Prevention:** Hamesha Git se deploy karo, manual changes avoid karo, self-heal enable rakho
- **Learning:** GitOps = Git is truth. Manual changes = drift. Self-heal automatically fix karta hai.

---

## Incident #3: Canary Analysis Failed — Auto Rollback
- **Date:** (Practice Scenario)
- **What Broke:** Canary deployment rollback ho gaya automatically. Error rate 10% tha.
- **Root Cause:** Error rate threshold (5%) se zyada tha. AnalysisTemplate ne rollback trigger kiya.
- **Fix:**
  ```bash
  # Step 1: Rollout status dekho
  kubectl argo rollouts status nexabook
  # "Rollback" status dikhega

  # Step 2: Analysis run dekho
  kubectl get analysisrun
  # "Failed" status — "Metric result [0.90] is below success condition [0.95]"

  # Step 3: Prometheus metrics check karo
  # Galat: 5xx error rate 10% tha (threshold 5% tha)
  curl -s 'http://prometheus:9090/api/v1/query?query=sum(rate(http_requests_total{status=~"5.*"}[5m]))' | jq

  # Step 4: Code fix karo
  # Bug fix karo, test karo locally
  npm test  # ya pytest

  # Step 5: Dobara deploy karo
  kubectl argo rollouts set image nexabook nexabook=nexabook:v3

  # Step 6: Monitor karo
  kubectl argo rollouts get rollout nexabook --watch
  # Canary 10% -> 30% -> 50% -> 100% dekho

  # Step 7: Verify
  kubectl argo rollouts status nexabook
  # "Successfully rolled out" dikhega
  ```
- **Prevention:** Canary analysis pehle locally test karo, metrics threshold carefully set karo
- **Learning:** Canary analysis = automatic quality gate. Metrics bad to rollback automatic.

---

## Incident #4: ArgoCD App Stuck in Progressing
- **Date:** (Practice Scenario)
- **What Broke:** ArgoCD app "Progressing" mein hai, kabhi "Synced" nahi hota. Pods CrashLoopBackOff.
- **Root Cause:** Pod crash ho raha hai. Image tag galat hai ya application error hai.
- **Fix:**
  ```bash
  # Step 1: App status dekho
  argocd app get nexabook
  # Status: "Progressing"

  # Step 2: Pod status dekho
  kubectl get pods -n nexabook
  # CrashLoopBackOff dikhega

  # Step 3: Pod logs dekho
  kubectl logs <pod-name> -n nexabook
  # Error: "docker: Error response from daemon: manifest for nexabook:v99 not found"

  # Step 4: ArgoCD refresh karo
  argocd app get nexabook --refresh

  # Step 5: Git mein fix karo
  # K8s/deployment.yaml mein correct image tag lagao
  # sed -i "s|image: .*|image: nexabook:v2|" k8s/deployment.yaml
  git commit -am "fix: correct image tag to v2"
  git push

  # Step 6: ArgoCD sync karega
  argocd app sync nexabook

  # Step 7: Health check
  kubectl get pods -n nexabook
  # Running state mein aana chahiye
  ```
- **Prevention:** Healthcheck properly configure karo, image tags properly lock karo, CI/CD mein image tag validation add karo
- **Learning:** ArgoCD "Progressing" = deployment ho raha hai lekin health check pending hai. Pod crash = app crash.

---

## Incident #5: ArgoCD Can't Connect to Remote Cluster
- **Date:** (Practice Scenario)
- **What Broke:** ArgoCD remote cluster se connect nahi ho paa raha. "Unknown" status.
- **Root Cause:** Cluster credentials expire ho gayi ya network issue hai.
- **Fix:**
  ```bash
  # Step 1: Cluster status dekho
  argocd cluster list
  # Cluster "Unknown" dikhega

  # Step 2: Cluster info verify karo
  argocd cluster get production
  # Error: "connection refused" ya "certificate has expired"

  # Step 3: Network connectivity test
  curl -k https://production-cluster.example.com:6443/version
  # Agar connection refused = firewall ya network issue

  # Step 4: Cluster credentials refresh karo
  argocd cluster rm production
  argocd cluster add production-context

  # Step 5: Ya kubeconfig update karo
  kubectl config use-context production-context
  kubectl cluster-info

  # Step 6: ArgoCD service account permissions check
  kubectl get clusterrolebinding | grep argocd
  # Agar nahi hai to create karo
  kubectl create clusterrolebinding argocd-admin \
      --clusterrole=admin \
      --serviceaccount=argocd:argocd-server

  # Step 7: Re-add cluster
  argocd cluster add production-context
  argocd cluster list
  # "Healthy" status aana chahiye
  ```
- **Prevention:** Cluster credentials properly configure karo, network access verify karo, RBAC properly set karo
- **Learning:** ArgoCD cluster connectivity = GitOps foundation. Connect nahi = deploy nahi.
