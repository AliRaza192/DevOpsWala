---
sidebar_position: 9
title: "Phase 7: Incident Log"
description: "Real-world incident scenarios for Phase 7"
---

# INCIDENT LOG — Phase: Container Orchestration (Kubernetes + Helm)

---

## Incident #1: CrashLoopBackOff
- **Date:** (Practice Scenario)
- **What Broke:** Pod baar baar crash ho raha hai
- **Root Cause:** Wrong CMD in Dockerfile ya missing dependency
- **Fix:**
  ```bash
  # Step 1: Previous container logs dekho
  kubectl logs nexabook-pod --previous
  # Error: Cannot find module 'index.js'
  
  # Step 2: Describe se events dekho
  kubectl describe pod nexabook-pod
  # Last State: Terminated, Reason: Error, Exit Code: 1
  
  # Step 3: Interactive mode mein test karo
  kubectl run debug --image=nexabook:latest --rm -it -- bash
  # Inside: command manually run karo jo CMD mein hai
  
  # Step 4: Dockerfile fix karo
  # Galat: CMD ["node", "dist/index.js"]
  # Sahi: CMD ["node", "server.js"]
  
  # Step 5: Image rebuild aur deploy
  docker build -t nexabook:fixed .
  kubectl set image deployment/nexabook nexabook=nexabook:fixed
  
  # Step 6: Rollout status check
  kubectl rollout status deployment/nexabook
  ```
- **Prevention:** Dockerfile locally test karo, healthcheck lagao, resource limits set karo
- **Learning:** CrashLoopBackOff = app crash ho raha hai. `--previous` logs se actual error milta hai

---

## Incident #2: Service Unreachable
- **Date:** (Practice Scenario)
- **What Broke:** Frontend backend ko reach nahi kar paa raha
- **Root Cause:** Service selector label match nahi ho raha
- **Fix:**
  ```bash
  # Step 1: Endpoints check karo
  kubectl get endpoints nexabook-backend
  # Empty! Koi endpoints nahi
  
  # Step 2: Service selector check karo
  kubectl describe service nexabook-backend
  # Selector: app=nexabook-backend
  
  # Step 3: Deployment labels check karo
  kubectl get pods --show-labels
  # Labels: app=nexabook (WRONG! Service expects nexabook-backend)
  
  # Step 4: Labels fix karo
  kubectl patch deployment nexabook-backend -p '{"spec":{"template":{"metadata":{"labels":{"app":"nexabook-backend"}}}}}'
  
  # Step 5: Ya service selector fix karo
  kubectl patch service nexabook-backend -p '{"spec":{"selector":{"app":"nexabook"}}}'
  
  # Step 6: Verify
  kubectl get endpoints nexabook-backend
  # Ab endpoints dikhenge
  
  # Step 7: Test connectivity
  kubectl run test --image=busybox --rm -it -- wget -qO- http://nexabook-backend
  ```
- **Prevention:** Labels consistent rakho, `kubectl get endpoints` se verify karo
- **Learning:** Service -> Pod mapping = selector + labels. Match hona zaroori hai

---

## Incident #3: HPA Not Scaling
- **Date:** (Practice Scenario)
- **What Broke:** CPU 90% hai lekin pod nahi badh rahe
- **Root Cause:** Metrics Server install nahi hai
- **Fix:**
  ```bash
  # Step 1: HPA status check
  kubectl get hpa
  # TARGETS: <unknown> (metrics server nahi hai)
  
  # Step 2: Metrics Server install
  kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
  
  # Step 3: Wait karo (1-2 minutes)
  kubectl get hpa
  # TARGETS: 45%/70% (ab metrics dikhenge)
  
  # Step 4: Load test karo
  kubectl run load-test --image=busybox --rm -it -- /bin/sh -c "while true; do wget -qO- http://nexabook-service; done"
  
  # Step 5: Scaling observe karo
  watch kubectl get hpa
  # CPU badhega -> pods badhenge
  
  # Step 6: Metrics verify karo
  kubectl top pods
  kubectl top nodes
  ```
- **Prevention:** Metrics Server pehle setup karo, HPA se pehle resource requests set karo
- **Learning:** HPA = metrics-based scaling. Bina metrics server ke HPA kaam nahi karta

---

## Incident #4: Pod Pending — Insufficient Resources
- **Date:** (Practice Scenario)
- **What Broke:** Pod Pending mein hai, schedule nahi ho raha
- **Root Cause:** Node pe sufficient resources nahi hain
- **Fix:**
  ```bash
  # Step 1: Pod describe karo
  kubectl describe pod nexabook-pod
  # Events: FailedScheduling, 0/3 nodes are available: 3 Insufficient cpu
  
  # Step 2: Node resources check
  kubectl top nodes
  # CPU: 90% used (not enough for new pod)
  
  # Step 3: Resource requests kam karo
  kubectl patch deployment nexabook -p '{"spec":{"template":{"spec":{"containers":[{"name":"nexabook","resources":{"requests":{"cpu":"100m","memory":"64Mi"}}}]}}}}'
  
  # Step 4: Ya node add karo
  # AWS: aws ec2 run-instances --instance-type t3.medium
  # Azure: az vm create --size Standard_B2s
  
  # Step 5: Node taint check karo
  kubectl describe nodes | grep -A 5 Taints
  # Agar taint hai to toleration add karo
  
  # Step 6: Verify
  kubectl get pods
  # Running state mein aana chahiye
  ```
- **Prevention:** Resource requests properly set karo, node autoscaling enable karo
- **Learning:** Pending = scheduling issue. `kubectl describe pod` se reason milta hai

---

## Incident #5: ImagePullBackOff
- **Date:** (Practice Scenario)
- **What Broke:** Pod image pull nahi kar paa raha
- **Root Cause:** Wrong image name, tag, ya private registry credentials missing
- **Fix:**
  ```bash
  # Step 1: Pod describe karo
  kubectl describe pod nexabook-pod
  # Events: Failed to pull image "nexabook:latest": rpc error: code = NotFound
  
  # Step 2: Image name/tag verify karo
  # Galat: nexabook:lates (typo)
  # Sahi: nexabook:latest
  
  # Step 3: Private registry credentials check
  kubectl get secret nexabook-regcred --output=yaml
  # Agar nahi hai to banao:
  kubectl create secret docker-registry nexabook-regcred \
    --docker-server=ghcr.io \
    --docker-username=ali \
    --docker-password=<token>
  
  # Step 4: Deployment mein imagePullSecrets add karo
  kubectl patch deployment nexabook -p '{"spec":{"template":{"spec":{"imagePullSecrets":[{"name":"nexabook-regcred"}]}}}}'
  
  # Step 5: Public image se test karo
  kubectl set image deployment/nexabook nexabook=nginx:latest
  
  # Step 6: Verify
  kubectl get pods
  # Running state mein aana chahiye
  ```
- **Prevention:** Image name/tag properly lock karo, registry credentials properly configure karo
- **Learning:** ImagePullBackOff = image nahi mil rahi. Name, tag, credentials check karo
