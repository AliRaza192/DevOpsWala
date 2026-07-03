---
sidebar_position: 10
title: "PHASE 9: GitOps + Platform Engineering"
description: "**Tumhara level:** Tumne CI/CD seekha (GitHub Actions). Ab GitOps seekho — Git as single source of truth for infrastruct"
---

# PHASE 9: GitOps + Platform Engineering — TEACHING

> **Tumhara level:** Tumne CI/CD seekha (GitHub Actions). Ab GitOps seekho — Git as single source of truth for infrastructure AND application deployment. ArgoCD tumhara primary tool hoga. Ye tumhare multi-tenant Islamic Banking SaaS ke liye directly applicable hai.

---

## Section 1: GitOps Kya Hai? — The Mental Model

:::tip CONCEPT: GitOps = Git = Truth

**Traditional CI/CD (Push-based):**
:::

```
Code Push -> Build -> Test -> Deploy (pipeline pushes to cluster)
```

**GitOps (Pull-based):**
```
Git Push -> ArgoCD detects -> Pulls changes -> Syncs to cluster
```

**Core Principles:**
1. **Git = Single Source of Truth** — Sab kuch Git mein hai (code + infrastructure + config)
2. **Declarative** — Desired state describe karo, not how to achieve it
3. **Automated Delivery** — Git change ho to automatically deploy ho
4. **Continuous Reconciliation** — ArgoCD continuously ensure karta hai ke cluster state = Git state

**Push vs Pull based:**
- Push-based: Pipeline cluster ko push karta hai (GitHub Actions -> kubectl apply)
- Pull-based: Agent cluster pe baithta hai aur Git se pull karta hai (ArgoCD)
- Pull-based is better: Access control, audit trail, drift detection, rollback

**Real-world connection:** Tumhare Islamic Banking SaaS mein:
- Har bank ka apna Git repo hoga (tenant config)
- ArgoCD automatically sync karega
- Koi manual deployment nahi
- Audit trail Git history mein
- Drift automatically detect aur fix hota hai

:::caution CHECKPOINT:
1. Traditional CI/CD aur GitOps mein kya fark hai? Push-based vs Pull-based
2. GitOps sirf deployment ke liye hai ya infrastructure ke liye bhi?
3. Agar Git repo pe kisi ne galat commit kar diya to ArgoCD kya karega?

:::

---

## Section 2: ArgoCD — The GitOps Engine

:::tip CONCEPT: ArgoCD = Kubernetes Ke Liye Git Sync

ArgoCD Git repo ko Kubernetes cluster se sync karta hai. Git mein change karo to cluster mein automatically apply hota hai.

:::

### Install ArgoCD

```bash
# Namespace banao
kubectl create namespace argocd

# ArgoCD install
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait karo pods ready ho jayen
kubectl wait --for=condition=Ready pods --all -n argocd --timeout=300s

# Password dekho
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d

# Port forward
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Access: https://localhost:8080
# Username: admin
# Password: (jo upar mila)
```

### ArgoCD CLI Commands

```bash
# CLI install
curl -sSL -o argocd https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
chmod +x argocd
sudo mv argocd /usr/local/bin/argocd

# Login
argocd login localhost:8080 --username admin --password <password>

# App create
argocd app create nginx \
    --repo https://github.com/yourusername/yourrepo.git \
    --path k8s \
    --dest-server https://kubernetes.default.svc \
    --dest-namespace default \
    --sync-policy automated \
    --auto-prune \
    --self-heal

# Status dekho
argocd app get nginx
argocd app list

# Sync manually
argocd app sync nginx

# History dekho
argocd app history nginx

# Rollback
argocd app rollback nginx 1

# Delete
argocd app delete nginx

# Refresh
argocd app get nginx --refresh
```

:::note HANDS-ON: First ArgoCD App

:::

```yaml
# File: nginx-deployment.yaml (Git mein rakho)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx
spec:
  replicas: 2
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
        - name: nginx
          image: nginx:1.25
          ports:
            - containerPort: 80

---
apiVersion: v1
kind: Service
metadata:
  name: nginx-service
spec:
  selector:
    app: nginx
  ports:
    - port: 80
      targetPort: 80
  type: LoadBalancer
```

```bash
# Git mein commit karo
git add nginx-deployment.yaml
git commit -m "Add nginx deployment"
git push

# ArgoCD app create karo
argocd app create nginx \
    --repo https://github.com/yourusername/yourrepo.git \
    --path . \
    --dest-server https://kubernetes.default.svc \
    --dest-namespace default \
    --sync-policy automated \
    --auto-prune \
    --self-heal

# Verify
argocd app get nginx
kubectl get pods
```

:::caution CHECKPOINT:
1. ArgoCD auto-sync aur manual sync mein kya fark hai? Kab kaunsa use karoge?
2. `--self-heal` ka kya matlab hai? Agar manually koi change kare to kya hoga?
3. `--auto-prune` kya karta hai?

:::

---

:::note HANDS-ON: ArgoCD Install Karke NexaBook ko Git Se Sync Karo

Ye exercise tumhe dikhayegi ke ArgoCD kaise install hota hai aur ek Git repo se Kubernetes cluster ko kaise sync karte hain.

:::

```bash
# Step 1: Kubernetes cluster chahiye (minikube ya kind)
minikube start --profile=nexabook

# Step 2: Namespace banao
kubectl create namespace argocd

# Step 3: ArgoCD install karo
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Step 4: Wait karo pods ready ho jayen
kubectl wait --for=condition=Ready pods --all -n argocd --timeout=300s
kubectl get pods -n argocd
# OUTPUT: All pods Running/Ready

# Step 5: Initial admin password nikalo
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d; echo
# OUTPUT: xyz123

# Step 6: Port forward karo (terminal 1)
kubectl port-forward svc/argocd-server -n argocd 8080:443
# Ab https://localhost:8080 pe ArgoCD UI dikhega

# Step 7: CLI install karo
curl -sSL -o argocd https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
chmod +x argocd
sudo mv argocd /usr/local/bin/argocd

# Step 8: CLI login karo (terminal 2)
argocd login localhost:8080 --username admin --password <password> --insecure

# Step 9: Git repo banao
mkdir nexabook-gitops && cd nexabook-gitops
git init

# Step 10: NexaBook deployment manifest banao
cat > nexabook-deployment.yaml << 'EOF'
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nexabook
spec:
  replicas: 2
  selector:
    matchLabels:
      app: nexabook
  template:
    metadata:
      labels:
        app: nexabook
    spec:
      containers:
        - name: nexabook
          image: nginx:1.25
          ports:
            - containerPort: 80
EOF

# Step 11: Git mein commit karo
git add .
git commit -m "Initial NexaBook deployment"
git remote add origin https://github.com/yourusername/nexabook-gitops.git
git push -u origin main

# Step 12: ArgoCD app create karo
argocd app create nexabook \
    --repo https://github.com/yourusername/nexabook-gitops.git \
    --path . \
    --dest-server https://kubernetes.default.svc \
    --dest-namespace default \
    --sync-policy automated \
    --auto-prune \
    --self-heal

# Step 13: Verify karo
argocd app get nexabook
# OUTPUT: Status: Synced, Health: Healthy
kubectl get pods -l app=nexabook
# OUTPUT: 2 pods Running
```

:::caution CHECKPOINT:
1. ArgoCD install karne ke baad pehla kya karna chahiye? Password change karna ya RBAC setup karna?
2. `--sync-policy automated` enable karne se pehle kya verify karna chahiye?
3. ArgoCD namespace alag kyun hota hai? Kya wo default namespace mein install kar sakte ho?

:::

---

:::note HANDS-ON: Git Commit → Push → Auto-Sync Flow Practically Dekho

Ye exercise tumhe dikhayegi ke Git mein change karne pe ArgoCD automatically sync karta hai — timing aur flow practically verify karo.

:::

```bash
# Step 1: Pehle se ArgoCD app hona chahiye (upar se)
argocd app get nexabook
# OUTPUT: Status: Synced

# Step 2: Terminal 1 mein ArgoCD watch karo
argocd app get nexabook --watch

# Step 3: Terminal 2 mein Git mein change karo
sed -i 's/replicas: 2/replicas: 3/' nexabook-deployment.yaml

# Step 4: Verify karo ke change dikhta hai
cat nexabook-deployment.yaml | grep replicas
# OUTPUT: replicas: 3

# Step 5: Git commit aur push karo
git add nexabook-deployment.yaml
git commit -m "chore: scale nexabook to 3 replicas"
git push

# Step 6: Terminal 1 mein dekho — ArgoCD detect karega (within 30 seconds)

# Step 7: Cluster mein verify karo
kubectl get pods -l app=nexabook
# OUTPUT: 3 pods Running (pehle 2 the)

# Step 8: ArgoCD history dekho
argocd app history nexabook
# ID   REVISION  ...
# 1    abc123    ... (initial)
# 2    def456    ... (scaled to 3)

# Step 9: Timing test karo
time argocd app get nexabook --refresh

# Step 10: Git mein aur changes karo (image tag update)
sed -i 's/nginx:1.25/nginx:1.26/' nexabook-deployment.yaml
git add . && git commit -m "chore: update nginx to 1.26" && git push

# Step 11: ArgoCD rolling update observe karo
kubectl rollout status deployment/nexabook
# OUTPUT: Successfully rolled out
```

**Real-world connection:** NexaBook ka frontend team jab code push karta hai, GitHub Actions Docker image banata hai, manifest update karta hai, aur ArgoCD auto-sync kar deta hai — koi manual deployment nahi hota.

:::caution CHECKPOINT:
1. ArgoCD kitni der mein Git change detect karta hai? Ye interval configurable hai?
2. Agar Git push aur ArgoCD sync ke beech 10 commits ho jayen to kya hoga?
3. Auto-sync disable karne ke baad kaise sync karoge?

:::

---

## Section 3: ArgoCD Projects & Multi-Tenancy

:::tip CONCEPT: Project = Logical Grouping

:::

```yaml
# File: argocd-project.yaml
apiVersion: argoproj.io/v1alpha1
kind: AppProject
metadata:
  name: nexabook
  namespace: argocd
spec:
  description: "NexaBook Application Project"
  
  # Allowed sources
  sourceRepos:
    - 'https://github.com/yourusername/nexabook.git'
    - 'https://github.com/yourusername/nexabook-infra.git'
  
  # Allowed destinations
  destinations:
    - server: https://kubernetes.default.svc
      namespace: 'nexabook-*'
    - server: https://kubernetes.default.svc
      namespace: 'staging-*'
  
  # Deny deployments to kube-system
  clusterResourceWhitelist:
    - group: ''
      kind: Namespace
  
  namespaceResourceBlacklist:
    - group: ''
      kind: ResourceQuota
    - group: ''
      kind: LimitRange
  
  # RBAC
  roles:
    - name: developer
      description: "Developer access"
      policies:
        - p, proj:nexabook:developer, applications, get, nexabook/*, allow
        - p, proj:nexabook:developer, applications, sync, nexabook/*, allow
      groups:
        - developers
```

:::tip CONCEPT: App of Apps Pattern

:::

```yaml
# File: argocd-app-of-apps.yaml
# Ye ek Application hai jo doosre Applications banata hai
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: nexabook-apps
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/yourusername/nexabook.git
    targetRevision: main
    path: argocd-apps  # Is folder mein aur Applications hain
  destination:
    server: https://kubernetes.default.svc
    namespace: argocd
  syncPolicy:
    automated:
      prune: true
      selfHeal: true

# argocd-apps/ folder structure:
# argocd-apps/
# +-- api.yaml          (Application resource)
# +-- frontend.yaml     (Application resource)
# +-- database.yaml     (Application resource)
# +-- monitoring.yaml   (Application resource)
```

```yaml
# File: argocd-apps/api.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: nexabook-api
  namespace: argocd
spec:
  project: nexabook
  source:
    repoURL: https://github.com/yourusername/nexabook.git
    targetRevision: main
    path: k8s/api
  destination:
    server: https://kubernetes.default.svc
    namespace: nexabook
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

:::tip CONCEPT: Notifications — Alert When Things Happen

:::

```yaml
# File: argocd-notifications.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-notifications-cm
  namespace: argocd
data:
  # Slack notification
  trigger.on-sync-succeeded: |
    - when: app.status.operationState.phase in ['Succeeded']
      send: [slack-success]
  trigger.on-sync-failed: |
    - when: app.status.operationState.phase in ['Error', 'Failed']
      send: [slack-failure]
  
  template.slack-success: |
    message: |
      Application {{.app.metadata.name}} sync succeeded!
      Revision: {{.app.status.sync.revision}}
  template.slack-failure: |
    message: |
      Application {{.app.metadata.name}} sync FAILED!
      Error: {{.app.status.operationState.message}}
  
  service.slack: |
    token: $slack-token
    signingSecret: $slack-signing-secret
```

:::caution CHECKPOINT:
1. ArgoCD Project kya hai? Kab zaroori hai?
2. App of Apps pattern kyun use karte hain?
3. Notifications kaise configure karoge?

### HANDS-ON: App-of-Apps Pattern — Multi-Tenant Banking Deploy

Ye exercise tumhe sikhayegi ke ArgoCD App of Apps pattern se kaise ek parent app banate hain jo multiple child apps (har bank ke liye ek) ko automatically deploy karta hai.

:::

```bash
# File: app_of_apps.sh

# Step 1: Git repo structure banao
mkdir -p nexabook-gitops/{apps,tenants}
cd nexabook-gitops

# Step 2: Per-tenant ArgoCD App banao — har bank ke liye
cat > tenants/bank-alif.yaml << 'EOF'
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: nexabook-bank-alif
  namespace: argocd
  finalizers:
    - resources-finalizer.argocd.argoproj.io
spec:
  project: nexabook-tenants
  source:
    repoURL: https://github.com/yourusername/nexabook.git
    targetRevision: main
    path: k8s/tenants/bank-alif
  destination:
    server: https://kubernetes.default.svc
    namespace: bank-alif
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
EOF

cat > tenants/bank-ba.yaml << 'EOF'
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: nexabook-bank-ba
  namespace: argocd
  finalizers:
    - resources-finalizer.argocd.argoproj.io
spec:
  project: nexabook-tenants
  source:
    repoURL: https://github.com/yourusername/nexabook.git
    targetRevision: main
    path: k8s/tenants/bank-ba
  destination:
    server: https://kubernetes.default.svc
    namespace: bank-ba
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
EOF

# Step 3: Parent App-of-Apps banao — ye sab children manage karega
cat > apps/nexabook-parent.yaml << 'EOF'
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: nexabook-tenants
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/yourusername/nexabook-gitops.git
    targetRevision: main
    path: tenants
  destination:
    server: https://kubernetes.default.svc
    namespace: argocd
  syncPolicy:
    automated:
      prune: true
EOF

# Step 4: Git push karo
git add . && git commit -m "Add multi-tenant app-of-apps" && git push

# Step 5: Parent app deploy karo
argocd app create nexabook-tenants \
    --repo https://github.com/yourusername/nexabook-gitops.git \
    --path apps \
    --dest-server https://kubernetes.default.svc \
    --dest-namespace argocd \
    --sync-policy automated

# Step 6: Verify — saare banks automatically deploy ho gaye
echo "=== All Tenant Apps ==="
argocd app list | grep nexabook
# Expected: 3 rows (parent + bank-alif + bank-ba)

# Step 7: Naya bank add karo — sirf Git file add karo
cat > tenants/bank-sim.yaml << 'EOF'
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: nexabook-bank-sim
  namespace: argocd
spec:
  project: nexabook-tenants
  source:
    repoURL: https://github.com/yourusername/nexabook.git
    targetRevision: main
    path: k8s/tenants/bank-sim
  destination:
    server: https://kubernetes.default.svc
    namespace: bank-sim
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
EOF
git add . && git commit -m "Add bank-sim tenant" && git push

# Step 8: ArgoCD automatically naya bank deploy karega
sleep 30
echo "=== After Adding Bank-Sim ==="
argocd app list | grep nexabook
# Expected: 4 rows now
```

**Expected Output:**
```
=== All Tenant Apps ===
NAME                    STATUS     HEALTH
nexabook-tenants        Synced     Healthy
nexabook-bank-alif      Synced     Healthy
nexabook-bank-ba        Synced     Healthy

=== After Adding Bank-Sim ===
NAME                    STATUS     HEALTH
nexabook-tenants        Synced     Healthy
nexabook-bank-alif      Synced     Healthy
nexabook-bank-ba        Synced     Healthy
nexabook-bank-sim       Synced     Healthy
```

:::caution CHECKPOINT:
1. Har tenant ka apna namespace kyun hai — shared namespace mein kya problem aati?
2. Agar ek bank ka deployment fail ho jaye to doosre banks pe kya effect hoga?
3. App of Apps mein resource quota kaise set karoge — har bank ka limits alag hoga?

:::

---

## Section 4: Progressive Delivery — Safe Deployments

:::tip CONCEPT: Canary = 10% Traffic Se Start Karo

Argo Rollouts use karke progressive delivery kar sakte ho.

:::

```yaml
# File: rollout.yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: nexabook
spec:
  replicas: 5
  selector:
    matchLabels:
      app: nexabook
  template:
    metadata:
      labels:
        app: nexabook
    spec:
      containers:
        - name: nexabook
          image: nexabook:v2
          ports:
            - containerPort: 3000
  
  strategy:
    canary:
      steps:
        - setWeight: 10       # 10% traffic
        - pause: {duration: 5m}  # 5 minute wait
        - setWeight: 30       # 30% traffic
        - pause: {duration: 5m}
        - setWeight: 50       # 50% traffic
        - pause: {duration: 5m}
        - setWeight: 100      # 100% traffic
      
      # Analysis — metrics check
      analysis:
        templates:
          - templateName: success-rate
        startingStep: 1
        args:
          - name: service-name
            value: nexabook

---
apiVersion: argoproj.io/v1alpha1
kind: AnalysisTemplate
metadata:
  name: success-rate
spec:
  args:
    - name: service-name
  metrics:
    - name: success-rate
      interval: 5m
      count: 5
      successCondition: result[0] >= 0.95
      provider:
        prometheus:
          address: http://prometheus:9090
          query: |
            sum(rate(http_requests_total{service="{{args.service-name}}",status!~"5.*"}[5m]))
            /
            sum(rate(http_requests_total{service="{{args.service-name}}"}[5m]))
```

### Blue-Green Deployment

```yaml
# File: blue-green-rollout.yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: nexabook
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nexabook
  template:
    metadata:
      labels:
        app: nexabook
    spec:
      containers:
        - name: nexabook
          image: nexabook:v2
  
  strategy:
    blueGreen:
      activeService: nexabook-active
      previewService: nexabook-preview
      autoPromotionEnabled: false
      prePromotionAnalysis:
        templates:
          - templateName: success-rate
      scaleDownDelaySeconds: 300
```

```bash
# Argo Rollouts install
kubectl create namespace argo-rollouts
kubectl apply -n argo-rollouts -f https://github.com/argoproj/argo-rollouts/releases/latest/download/install.yaml

# Rollout status dekho
kubectl argo rollouts status nexabook

# Rollout history
kubectl argo rollouts history nexabook

# Rollback
kubectl argo rollouts undo nexabook
```

:::caution CHECKPOINT:
1. Canary aur Blue-Green mein kya fark hai? Kab kaunsa use karoge?
2. AnalysisTemplate kya hai? Metrics kaise check hote hain?

### HANDS-ON: Drift Detection aur Self-Heal Practically Dekho

Ye exercise tumhe dikhayegi ke jab koi manual change cluster pe kare (kubectl se) to ArgoCD kaise detect karta hai aur automatically fix karta hai.

:::

```bash
# File: drift_selfheal.sh

# Step 1: Pehle se deployed app hona chahiye
argocd app get nexabook
# Status: Synced, Healthy

# Step 2: Drift create karo — manual change karo kubectl se
echo "=== Creating Drift: Manual Scale ==="
kubectl scale deployment nexabook --replicas=5 -n production
echo "Manually set to 5 replicas"

# Step 3: Verify drift — deployment status dekho
echo -e "\n=== Deployment Status (Before ArgoCD Fix) ==="
kubectl get deployment nexabook -n production -o jsonpath='Replicas: {.spec.replicas} desired, {.status.availablelicas} available'
echo ""

# Step 4: ArgoCD sync status check karo
echo -e "\n=== ArgoCD Detects Drift ==="
argocd app get nexabook
# Status dikhega: OutOfSync (Git says 3, cluster has 5)

# Step 5: Self-heal enable hai to ArgoCD automatically fix karega
echo -e "\n=== Waiting for Self-Heal (Auto-Sync) ==="
argocd app get nexabook --watch &
WATCH_PID=$!
sleep 15
kill $WATCH_PID 2>/dev/null

# Step 6: Verify — wapas Git state pe aa gaya
echo -e "\n=== After Self-Heal ==="
kubectl get deployment nexabook -n production -o jsonpath='Replicas: {.spec.replicas}'
echo " (back to Git state)"

argocd app get nexabook | grep "Status"
# Status: Synced, Healthy

# Step 7: Manual override try karo — self-heal phir se fix karega
echo -e "\n=== Second Drift Attempt ==="
kubectl set image deployment nexabook agent=bad-image:v1 -n production
sleep 20
echo "After self-heal:"
kubectl get deployment nexabook -n production -o jsonpath='Image: {.spec.template.spec.containers[0].image}'
echo ""

# Step 8: Audit trail — ArgoCD history mein drift dikhega
echo -e "\n=== ArgoCD History (Drift Events) ==="
argocd app history nexabook --limit 5
```

**Expected Output:**
```
=== Creating Drift: Manual Scale ===
Manually set to 5 replicas

=== ArgoCD Detects Drift ===
Name:               nexabook
Project:            default
Status:             OutOfSync    <-- DETECTED!
Health:             Healthy
Repo:               https://github.com/yourusername/nexabook.git
Target:             main
...

=== After Self-Heal ===
Replicas: 3 (back to Git state)
Status: Synced

=== Second Drift Attempt ===
After self-heal:
Image: agent:v1.2.3   <-- FIXED back to correct image

=== ArgoCD History (Drift Events) ===
ID    STATUS      REVISION    MESSAGE
4     Synced      abc1234     Auto-synced (self-heal)
3     OutOfSync   abc1234     Manual change detected
2     Synced      abc1234     Configured
1     Synced      abc1234     Application created
```

:::caution CHECKPOINT:
1. Self-heal enable karna hamesha safe hai? Kab disable karna chahiye?
2. Agar intentional manual change ho (emergency fix) to ArgoCD kaise pata lagayega ke ye drift hai ya intentional?
3. Drift detection interval kitna rakhna chahiye — real-time ya periodic?

:::

---

## Section 5: Secrets in GitOps — Encrypted Configuration

:::tip CONCEPT: Secrets Git Mein Nahi Milte — Ya Milte Hain?

Git mein plaintext secrets rakhna = security breach. Solutions:

:::

### Option 1: Sealed Secrets

```bash
# Sealed Secrets install
kubectl apply -f https://github.com/bitnami-labs/sealed-secrets/releases/latest/download/controller.yaml

# Secret encrypt karo
echo -n 'postgresql://user:pass@host/db' | kubectl create secret generic nexabook-db \
    --dry-run=client --from-literal=url=- -o yaml | kubeseal -o yaml > sealed-secret.yaml
```

```yaml
# File: sealed-secret.yaml (Git mein safe hai)
apiVersion: bitnami.com/v1alpha1
kind: SealedSecret
metadata:
  name: nexabook-db
spec:
  encryptedData:
    url: AgBy3i4OJSWK+PiTySYZZA9rO...
```

### Option 2: External Secrets Operator

```yaml
# File: external-secret.yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: nexabook-db
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: aws-secrets-manager
    kind: SecretStore
  target:
    name: nexabook-db
  data:
    - secretKey: url
      remoteRef:
        key: nexabook/database-url
```

### Option 3: SOPS + KMS

```bash
# Mozilla SOPS use karo
sops --encrypt --kms arn:aws:kms:ap-south-1:123456789012:key/xxx secret.yaml > secret.enc.yaml
sops --decrypt secret.enc.yaml > secret.yaml
```

:::caution CHECKPOINT:
1. Sealed Secrets aur External Secrets Operator mein kya fark hai?
2. Production mein kaunsa solution use karoge?

### HANDS-ON: Sealed Secrets — Git mein Secrets Safe Rakho

Ye exercise tumhe sikhayegi ke Bitnami Sealed Secrets se kaise encrypted secrets Git mein store karte hain jo sirf cluster pe decrypt hote hain.

:::

```bash
# File: sealed_secrets_setup.sh

# Step 1: Sealed Secrets controller install karo
kubectl apply -f https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.24.0/controller.yaml

# Step 2: kubeseal install karo
wget https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.24.0/kubeseal-linux-amd64 -O kubeseal
chmod +x kubeseal && sudo mv kubeseal /usr/local/bin/

# Step 3: Public key dekho — ye controller generate karta hai
kubeseal --fetch-cert > pub-sealed-secrets.pem

# Step 4: Normal secret banao (Ye Git mein commit MAT karo!)
cat > secret.yaml << 'EOF'
apiVersion: v1
kind: Secret
metadata:
  name: nexabook-db-credentials
  namespace: production
type: Opaque
stringData:
  DB_HOST: postgres.production.svc.cluster.local
  DB_USER: nexabook_admin
  DB_PASSWORD: supersecret123
  DB_NAME: nexabook
EOF

# Step 5: Encrypt karo — ab Git mein safe hai
kubeseal --format yaml < secret.yaml > sealed-secret.yaml
cat sealed-secret.yaml
# Dikhayega: encrypted data jo sirf controller decrypt kar sakta hai

# Step 6: Git mein commit karo
git add sealed-secret.yaml
git commit -m "Add sealed DB credentials"
git push

# Step 7: Cluster pe apply karo — controller decrypt karega
kubectl apply -f sealed-secret.yaml

# Step 8: Verify — actual secret dikhega
echo "=== Encrypted (Git mein) ==="
grep -A2 "encryptedData" sealed-secret.yaml

echo -e "\n=== Decrypted (Cluster mein) ==="
kubectl get secret nexabook-db-credentials -n production -o jsonpath='{.data}' | python3 -m json.tool

# Step 9: Agar secret change karna ho
echo "Updating password..."
cat > new-secret.yaml << 'EOF'
apiVersion: v1
kind: Secret
metadata:
  name: nexabook-db-credentials
  namespace: production
type: Opaque
stringData:
  DB_HOST: postgres.production.svc.cluster.local
  DB_USER: nexabook_admin
  DB_PASSWORD: newpassword456
  DB_NAME: nexabook
EOF
kubeseal --format yaml < new-secret.yaml > sealed-secret.yaml
git add sealed-secret.yaml && git commit -m "Rotate DB password" && git push
kubectl apply -f sealed-secret.yaml
```

**Expected Output:**
```
=== Encrypted (Git mein) ===
encryptedData:
  DB_HOST: AgBy3i4OJSWK+PiTySYZZA9rO43cGDEq...
  DB_PASSWORD: AgBy3i4OJSWK+PiTySYZZA9rO43cGDEq...
  DB_NAME: AgBy3i4OJSWK+PiTySYZZA9rO43cGDEq...

=== Decrypted (Cluster mein) ===
{
    "DB_HOST": "postgres.production.svc.cluster.local",
    "DB_NAME": "nexabook",
    "DB_PASSWORD": "supersecret123",
    "DB_USER": "nexabook_admin"
}
```

:::caution CHECKPOINT:
1. Sealed Secrets ka private key kahan store hota hai? Agar lost ho jaye to kya hoga?
2. `kubeseal --scope cluster-wide` vs namespace-scoped — dono ka fark kya hai?
3. Secret rotation (password change) ka process kya hona chahiye — manually ya automated?

:::

---

## Section 6: Multi-Cluster ArgoCD — Enterprise Setup

:::tip CONCEPT: Central Management, Distributed Deployment

:::

```yaml
# Central ArgoCD cluster se remote clusters manage karo
# Remote cluster register karo
argocd cluster add staging-context
argocd cluster add production-context

# Remote cluster pe app deploy karo
argocd app create nexabook-staging \
    --repo https://github.com/yourusername/nexabook.git \
    --path k8s/overlays/staging \
    --dest-server https://staging-cluster.example.com \
    --dest-namespace nexabook

argocd app create nexabook-production \
    --repo https://github.com/yourusername/nexabook.git \
    --path k8s/overlays/production \
    --dest-server https://production-cluster.example.com \
    --dest-namespace nexabook
```

```yaml
# File: argocd-cluster.yaml
apiVersion: argoproj.io/v1alpha1
kind: Cluster
metadata:
  name: production
  labels:
    env: production
spec:
  server: https://production-cluster.example.com
  config:
    bearerToken: <token>
    tlsClientConfig:
      insecure: false
      caData: <base64-ca-cert>
```

:::note HANDS-ON: Multi-Cluster ArgoCD — Central Management

Ye exercise tumhe sikhayegi ke ek central ArgoCD se kaise multiple Kubernetes clusters manage karte hain — staging aur production dono ek jagah se.

:::

```bash
# File: multicluster_argocd.sh

# Step 1: Do clusters chahiye — staging aur production
# (minikube ya kind se 2 clusters banao)
kind create cluster --name staging
kind create cluster --name production

# Step 2: Central ArgoCD cluster pe register karo
# Staging cluster
argocd cluster add staging-context --name staging --project default

# Production cluster
argocd cluster add production-context --name production --project default

# Step 3: Verify clusters
echo "=== Registered Clusters ==="
argocd cluster list
# Expected: 3 rows (local, staging, production)

# Step 4: Har cluster ke liye app banao
# Staging app
argocd app create nexabook-staging \
    --repo https://github.com/yourusername/nexabook.git \
    --path k8s/staging \
    --dest-server https://kubernetes.default.svc \
    --dest-namespace staging \
    --sync-policy automated

# Production app
argocd app create nexabook-production \
    --repo https://github.com/yourusername/nexabook.git \
    --path k8s/production \
    --dest-server https://production-cluster:6443 \
    --dest-namespace production \
    --sync-policy automated \
    --auto-prune

# Step 5: Dashboard pe verify karo
echo "=== ArgoCD Apps Status ==="
argocd app list
# Expected: 2 apps with different destination clusters

# Step 6: Promote staging → production
echo "=== Promoting: staging config to production ==="
# Git mein staging changes ko production mein copy karo
cp k8s/staging/configmap.yaml k8s/production/configmap.yaml
git add . && git commit -m "Promote staging config to production" && git push

# Step 7: Verify — sirf production sync hoga, staging unchanged
echo "=== Sync Status ==="
argocd app get nexabook-staging --refresh
argocd app get nexabook-production --refresh
```

**Expected Output:**
```
=== Registered Clusters ===
NAME            SERVER                          STATUS   MESSAGE
local           https://kubernetes.default.svc  Online
staging         https://kubernetes.default.svc  Online
production      https://production-cluster:6443 Online

=== ArgoCD Apps Status ===
NAME                 CLUSTER        NAMESPACE    STATUS
nexabook-staging     local          staging      Synced
nexabook-production  production     production   Synced

=== Promoting: staging config to production ===
[main xyz789] Promote staging config to production

=== Sync Status ===
Application: nexabook-staging
  Sync: Synced
Application: nexabook-production
  Sync: Synced
```

:::caution CHECKPOINT:
1. Multi-cluster mein secret sharing kaise handle karoge — staging ke secrets production mein kaise pahunchenge?
2. Agar ek cluster down ho jaye to ArgoCD kya karega — dosre cluster pe deploy rukega?
3. Cluster promotion pipeline kaise design karoge — staging → QA → production flow kya hoga?

:::

---

## Section 7: Platform Engineering — The Future

:::tip CONCEPT: Platform Engineering = Developer Experience

Platform engineering team internal tools banati hai jo developers ko self-service deti hai.

**Key Concepts:**
- **Internal Developer Platform (IDP)** — Shared tools and services
- **Golden Path** — Pre-approved, best-practice way to do things
- **Self-Service** — Developers khud deploy kar sakein bina ops team ke

:::

### Backstage — Developer Portal

```yaml
# catalog-info.yaml (har service ke liye)
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: nexabook-api
  description: NexaBook REST API
  annotations:
    github.com/project-slug: yourusername/nexabook
    backstage.io/techdocs-ref: dir:.
  tags:
    - node
    - api
    - production
  links:
    - url: https://nexabook.com
      title: Website
    - url: https://grafana.nexabook.com
      title: Monitoring
spec:
  type: service
  lifecycle: production
  owner: team-nexabook
  system: nexabook
  providesApis: [nexabook-api]
```

### Golden Path Template

```yaml
# Developer ke liye template
# Template se naya service banao ek command mein
# Backstage scaffolder use karo

# Template: kubernetes-service/template.yaml
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: kubernetes-service
  title: Kubernetes Service
  description: Create a new Kubernetes service with CI/CD
spec:
  owner: platform-team
  parameters:
    - title: Service Details
      properties:
        name:
          title: Service Name
          type: string
        repo:
          title: GitHub Repository
          type: string
  steps:
    - id: fetch-template
      action: fetch:template
      input:
        url: ./skeleton
    - id: create-github-repo
      action: github:repo:create
    - id: create-argocd-app
      action: argocd:create-app
```

:::caution CHECKPOINT:
1. Platform Engineering aur DevOps mein kya fark hai?
2. Golden Path kya hai? Developers ko kya benefit deta hai?

### HANDS-ON: Backstage — Internal Developer Platform Setup

Ye exercise tumhe sikhayegi ke Backstage (Spotify ka open-source IDP) se kaise ek internal developer platform banate hain jahan se sab developers apne services deploy kar sakein.

:::

```bash
# File: backstage_setup.sh

# Step 1: Backstage create karo
npx @backstage/create-app@latest nexabook-platform
cd nexabook-platform

# Step 2: App configuration check karo
cat app-config.yaml
# Key configs:
#   app.baseUrl: http://localhost:3000
#   catalog: entities registered here
#   techdocs: documentation
#   scaffolder: templates

# Step 3: Start Backstage
yarn dev
# Opens at http://localhost:3000

# Step 4: Component register karo — NexaBook Agent
cat > catalog-info.yaml << 'EOF'
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: nexabook-agent
  description: NexaBook AI Banking Agent
  annotations:
    github.com/project-slug: yourusername/nexabook-agent
    argocd/app-name: nexabook-agent
  tags:
    - ai
    - banking
    - production
  links:
    - url: https://argocd.example.com/applications/nexabook-agent
      title: ArgoCD Dashboard
spec:
  type: service
  lifecycle: production
  owner: team-nexabook
  system: nexabook-platform
  providesApis:
    - nexabook-agent-api
  dependsOn:
    - resource:nexabook-db
EOF

# Step 5: Template register karo — Golden Path for new services
cat > scaffolder-template.yaml << 'EOF'
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: banking-agent-template
  title: New Banking Agent
  description: Create a new AI agent for banking operations
spec:
  owner: platform-team
  type: service
  parameters:
    - title: Agent Details
      properties:
        name:
          title: Agent Name
          type: string
        repo:
          title: Repository
          type: string
  steps:
    - id: fetch-template
      action: fetch:template
      input:
        url: ./template
    - id: create-repo
      action: github:repo:create
      input:
        repoName: ${{ parameters.name }}
    - id: register-catalog
      action: catalog:register
      input:
        catalogInfoPath: /catalog-info.yaml
EOF

# Step 6: Verify — Backstage dashboard pe dekho
echo "Backstage running at: http://localhost:3000"
echo "Registered components:"
curl -s http://localhost:3000/api/catalog/entities?filter=kind=component | python3 -m json.tool | head -20
```

**Expected Output:**
```
Backstage running at: http://localhost:3000
Registered components:
{
    "items": [
        {
            "metadata": {
                "name": "nexabook-agent",
                "namespace": "default"
            },
            "spec": {
                "type": "service",
                "lifecycle": "production",
                "owner": "team-nexabook"
            }
        }
    ]
}
```

:::caution CHECKPOINT:
1. Backstage mein Scaffolder kya hai — Golden Path kaise create karoge?
2. Catalog-Info.yaml mein `argocd/app-name` annotation kyun hai?
3. Agar ek developer naya service banana chahe to Backstage se kaise start karega?

:::

---

## Section 8: GitOps Workflow — Production Pattern

:::tip CONCEPT: Complete GitOps Workflow

:::

```
Developer -> Git Push -> GitHub Actions (build + test)
    -> Docker image push to registry
    -> Update K8s manifests in Git (image tag)
    -> ArgoCD detects Git change
    -> ArgoCD syncs to cluster
    -> ArgoCD monitors health
```

```yaml
# GitHub Actions workflow — build and update Git
name: Build and Update Manifests

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Build and push Docker image
        run: |
          docker build -t ghcr.io/${{ github.repository }}:${{ github.sha }} .
          docker push ghcr.io/${{ github.repository }}:${{ github.sha }}
      
      - name: Update K8s manifest
        run: |
          # Image tag update karo Git mein
          sed -i "s|image: .*|image: ghcr.io/${{ github.repository }}:${{ github.sha }}|" k8s/deployment.yaml
          
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add k8s/deployment.yaml
          git commit -m "chore: update image to ${{ github.sha }}"
          git push
      # ArgoCD automatically detect karega aur sync karega
```

:::caution CHECKPOINT:
1. Ye workflow kaise kaam karta hai? Git -> Build -> Git -> ArgoCD
2. Agar build fail ho jaye to ArgoCD kya karega?

### HANDS-ON: Git Revert se Production Rollback

Ye exercise tumhe sikhayegi ke jab galat deploy ho jaye to `git revert` se kaise rollback karte hain. ArgoCD automatically previous state pe sync ho jayega — koi manual intervention nahi.

:::

```bash
# File: git_rollback.sh

# Step 1: Current deployment state dekho
echo "=== Current State ==="
kubectl get deployment nexabook -n production -o jsonpath='{.spec.replicas}'
echo " replicas"

# Step 2: Git log dekho — pichle 3 commits
echo -e "\n=== Recent Commits ==="
git log --oneline -3
# Expected:
# abc1234 Scale to 5 replicas (HEAD)
# def5678 Add new compliance feature
# ghi9012 Update to 3 replicas

# Step 3: Galat commit karo — 10 replicas (too many)
echo -e "\n=== Bad Deploy: Setting 10 replicas ==="
sed -i 's/replicas: 3/replicas: 10/' k8s/production/deployment.yaml
git add . && git commit -m "Scale to 10 replicas" && git push

# Step 4: Wait for ArgoCD to sync
echo "Waiting for ArgoCD sync..."
sleep 10
echo "Replicas now:"
kubectl get deployment nexabook -n production -o jsonpath='{.spec.replicas}'
echo " replicas"

# Step 5: PROBLEM DETECTED — rollback karo using git revert
echo -e "\n=== Rolling Back: git revert ==="
LAST_COMMIT=$(git rev-parse HEAD)
echo "Reverting commit: $LAST_COMMIT"
git revert HEAD --no-edit
git push

# Step 6: Verify ArgoCD automatically rollback karega
echo -e "\n=== Waiting for ArgoCD to sync rollback ==="
sleep 10
echo "Replicas after rollback:"
kubectl get deployment nexabook -n production -o jsonpath='{.spec.replicas}'
echo " replicas"

# Step 7: Git log dekho — revert commit dikhega
echo -e "\n=== Git Log After Rollback ==="
git log --oneline -4
# Expected:
# jkl3456 Revert "Scale to 10 replicas" (HEAD)
# abc1234 Scale to 10 replicas
# def5678 Add new compliance feature
# ghi9012 Update to 3 replicas

# Step 8: ArgoCD history check karo
echo -e "\n=== ArgoCD Sync History ==="
argocd app history nexabook --limit 3
```

**Expected Output:**
```
=== Current State ===
3 replicas

=== Recent Commits ===
abc1234 Scale to 5 replicas
def5678 Add new compliance feature
ghi9012 Update to 3 replicas

=== Bad Deploy: Setting 10 replicas ===
Replicas now:
10 replicas

=== Rolling Back: git revert ===
Reverting commit: abc1234
[mc12345] Revert "Scale to 10 replicas"

=== Waiting for ArgoCD to sync rollback ===
Replicas after rollback:
3 replicas

=== Git Log After Rollback ===
jkl3456 Revert "Scale to 10 replicas"
abc1234 Scale to 10 replicas
def5678 Add new compliance feature
ghi9012 Update to 3 replicas

=== ArgoCD Sync History ===
ID    STATUS      MESSAGE
2     Synced      Revert "Scale to 10 replicas"
1     Synced      Scale to 10 replicas
```

:::caution CHECKPOINT:
1. `git revert` aur `git reset` mein kya fark hai? Production mein kab kaunsa use karoge?
2. Agar revert ke baad bhi issue ho to kya karoge — revert ka revert?
3. ArgoCD auto-sync rollback ke liye kitna wait karta hai — timeout configure karna chahiye?

:::

---

## Section 9: Flux CD — Alternative Awareness

:::tip CONCEPT: Flux = CNCF GitOps Tool

Flux ArgoCD ka alternative hai. Dono popular hain.

:::

```bash
# Flux install
curl -s https://fluxcd.io/install.sh | bash

# Bootstrap
flux bootstrap github \
    --owner=yourusername \
    --repository=fleet-infra \
    --branch=main \
    --path=clusters/production
```

```yaml
# Flux GitRepository
apiVersion: source.toolkit.fluxcd.io/v1
kind: GitRepository
metadata:
  name: nexabook
  namespace: flux-system
spec:
  interval: 1m
  url: https://github.com/yourusername/nexabook.git
  ref:
    branch: main

---
# Flux Kustomization
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: nexabook
  namespace: flux-system
spec:
  interval: 5m
  path: ./k8s
  prune: true
  sourceRef:
    kind: GitRepository
    name: nexabook
```

**ArgoCD vs Flux:**
- ArgoCD: UI-based, easier to start, more features
- Flux: CLI-based, more flexible, better for complex setups
- **Recommendation:** ArgoCD for most teams (easier onboarding)

:::note HANDS-ON: Flux CD — GitRepository + Kustomization Deploy

Ye exercise tumhe sikhayegi ke Flux CD se ek Git repo ko Kubernetes cluster se kaise sync karte hain. ArgoCD ka alternative practically use karenge.

:::

```bash
# File: flux_setup.sh

# Step 1: Flux install karo
curl -s https://fluxcd.io/install.sh | bash

# Step 2: Bootstrap — Flux khud apna Git repo banata hai
flux bootstrap github \
    --owner=yourusername \
    --repository=fleet-infra \
    --branch=main \
    --path=clusters/production

# Step 3: GitRepository source define karo
cat > gitrepo.yaml << 'EOF'
apiVersion: source.toolkit.fluxcd.io/v1
kind: GitRepository
metadata:
  name: nexabook
  namespace: flux-system
spec:
  interval: 1m
  url: https://github.com/yourusername/nexabook.git
  ref:
    branch: main
EOF
kubectl apply -f gitrepo.yaml

# Step 4: Kustomization — flux ko batao kahan se deploy karna hai
cat > kustomization.yaml << 'EOF'
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: nexabook
  namespace: flux-system
spec:
  interval: 5m
  path: ./k8s/production
  prune: true
  sourceRef:
    kind: GitRepository
    name: nexabook
EOF
kubectl apply -f kustomization.yaml

# Step 5: Flux status check karo
echo "=== Flux Sources ==="
flux get sources git

echo -e "\n=== Flux Kustomizations ==="
flux get kustomizations

echo -e "\n=== Flux Events (last 5) ==="
flux events --for=kustomization/nexabook 2>/dev/null | tail -5

# Step 6: Git mein change karo aur dekho flux sync karta hai
echo -e "\n=== Making a change in Git ==="
sed -i 's/replicas: 2/replicas: 3/' k8s/production/deployment.yaml
git add . && git commit -m "Scale to 3 replicas" && git push

# Step 7: Flux reconcile — manually trigger
echo -e "\n=== Manual Reconcile ==="
flux reconcile kustomization nexabook --with-source

# Step 8: Verify deployment updated
echo -e "\n=== Verify Deployment ==="
kubectl get deployment nexabook -n production -o wide
```

**Expected Output:**
```
=== Flux Sources ===
NAME      READY   STATUS            AGE
nexabook  True    Fetched revision   2m

=== Flux Kustomizations ===
NAME      READY   STATUS            AGE
nexabook  True    Applied revision   1m

=== Flux Events (last 5) ===
Normal   Artifact   nexabook   Fetched revision: main@sha1:abc123
Normal   Reconciling nexabook  kustomization reconciling

=== Making a change in Git ===
[main abc123] Scale to 3 replicas
 1 file changed, 1 insertion(+), 1 deletion(-)

=== Manual Reconcile ===
► applying dry-run
✔ kustomization/nexabook revised

=== Verify Deployment ===
NAME      READY   UP-TO-DATE   AVAILABLE   AGE
nexabook  3/3     3            3           5m
```

:::caution CHECKPOINT:
1. Flux aur ArgoCD dono GitOps tools hain — kab Flux choose karoge, kab ArgoCD?
2. Flux ka `prune: true` kya karta hai? Agar false ho to kya problem aayegi?
3. Flux bootstrap se kya hota hai — manually install se kya fark hai?

:::

---

## Summary: Phase 9 Key Takeaways

| Concept | Tumne Kya Seekha |
|---------|-----------------|
| GitOps | Git = single source of truth, pull-based deployment |
| ArgoCD | Auto-sync, self-heal, projects, notifications |
| Progressive Delivery | Canary, Blue-Green with Argo Rollouts |
| Secrets | Sealed Secrets, External Secrets, SOPS |
| Multi-Tenancy | App of Apps pattern, per-tenant apps |
| Platform Engineering | IDPs, Golden Paths, Backstage |
| Workflow | Build -> Update Git -> ArgoCD auto-sync |

---

## MINI-TASKS

### Task 1: ArgoCD Setup (20 min)
ArgoCD install karo with:
- Auto-sync enabled
- Self-heal enabled
- App create karo for NexaBook

### Task 2: Canary Deployment (15 min)
Canary rollout setup karo:
- 10% -> 30% -> 50% -> 100%
- Pause between steps
- Rollback test karo

### Task 3: Multi-Tenant (15 min)
2 tenants ke liye ArgoCD apps banao:
- bank-a
- bank-b
- Verify karo ke dono alag hain

### Task 4: App of Apps (15 min)
App of Apps pattern implement karo:
- Parent app create karo
- 3 child apps (api, frontend, monitoring)
- Verify karo ke sab sync ho rahe hain

---

## INCIDENT.md: Practice Scenarios

### Incident #1: ArgoCD Sync Failed
- **Date:** (Practice Scenario)
- **What Broke:** ArgoCD app "OutOfSync" hai, sync nahi ho raha
- **Root Cause:** Git repo mein permission nahi hai ya manifest galat hai
- **Fix:**
  ```bash
  # Step 1: App status dekho
  argocd app get nexabook
  # "OutOfSync" + error message dikhega
  
  # Step 2: Sync status detail dekho
  argocd app get nexabook --refresh
  # Last sync error: " Unauthorized"
  
  # Step 3: Repo access verify karo
  argocd repo list
  # Agar repo nahi dikhta to add karo
  argocd repo add https://github.com/your/repo.git --username xxx --password xxx
  
  # Step 4: Ya deploy key use karo
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

### Incident #2: Drift Detected
- **Date:** (Practice Scenario)
- **What Broke:** Manual change kiya cluster pe, ArgoCD revert kar raha hai
- **Root Cause:** `kubectl edit` se deployment change kiya
- **Fix:**
  ```bash
  # Step 1: ArgoCD mein drift detect hoga
  argocd app get nexabook
  # Status: "OutOfSync"
  
  # Step 2: Kya change hua dekho
  argocd app diff nexabook
  # Manual change dikhega
  
  # Step 3: Option 1 — Git mein change karo (sahi approach)
  # k8s/deployment.yaml mein change karo
  git commit -am "chore: update replicas"
  git push
  # ArgoCD auto-sync karega
  
  # Step 4: Option 2 — Self-heal se revert (if enabled)
  # ArgoCD automatically Git state restore karega
  
  # Step 5: Option 3 — Manual sync (force)
  argocd app sync nexabook --force
  
  # Step 6: Disable self-heal agar manual changes allowed hain
  argocd app set nexabook --sync-policy none
  ```
- **Prevention:** Hamesha Git se deploy karo, manual changes avoid karo, self-heal enable rakho
- **Learning:** GitOps = Git is truth. Manual changes = drift. Self-heal automatically fix karta hai.

### Incident #3: Canary Analysis Failed
- **Date:** (Practice Scenario)
- **What Broke:** Canary deployment rollback ho gaya automatically
- **Root Cause:** Error rate 5% se zyada tha
- **Fix:**
  ```bash
  # Step 1: Rollout status dekho
  kubectl argo rollouts status nexabook
  # "Rollback" status dikhega
  
  # Step 2: Analysis run dekho
  kubectl get analysisrun
  # "Failed" status
  
  # Step 3: Prometheus metrics check karo
  # Galat: 5xx error rate 10% tha (threshold 5% tha)
  
  # Step 4: Code fix karo
  # Bug fix karo, test karo
  
  # Step 5: Dobara deploy karo
  kubectl argo rollouts set image nexabook nexabook=nexabook:v3
  
  # Step 6: Monitor karo
  kubectl argo rollouts get rollout nexabook --watch
  ```
- **Prevention:** Canary analysis pehle locally test karo, metrics threshold carefully set karo
- **Learning:** Canary analysis = automatic quality gate. Metrics bad to rollback automatic.

### Incident #4: ArgoCD App Stuck in Progressing
- **Date:** (Practice Scenario)
- **What Broke:** ArgoCD app "Progressing" mein hai, kabhi "Synced" nahi hota
- **Root Cause:** Pod CrashLoopBackOff hai
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
  # Error message dikhega
  
  # Step 4: ArgoCD refresh karo
  argocd app get nexabook --refresh
  
  # Step 5: Git mein fix karo
  # K8s/deployment.yaml mein fix karo (correct image, correct CMD)
  git commit -am "fix: correct image tag"
  git push
  
  # Step 6: ArgoCD sync karega
  argocd app sync nexabook
  
  # Step 7: Health check
  kubectl get pods -n nexabook
  # Running state mein aana chahiye
  ```
- **Prevention:** Healthcheck properly configure karo, image tags properly lock karo
- **Learning:** ArgoCD "Progressing" = deployment ho raha hai lekin health check pending hai

### Incident #5: ArgoCD Can't Connect to Cluster
- **Date:** (Practice Scenario)
- **What Broke:** ArgoCD remote cluster se connect nahi ho paa raha
- **Root Cause:** Cluster credentials ya network issue
- **Fix:**
  ```bash
  # Step 1: Cluster status dekho
  argocd cluster list
  # Cluster "Unknown" dikhega
  
  # Step 2: Cluster info verify karo
  argocd cluster get production
  # Error: "connection refused"
  
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
  ```
- **Prevention:** Cluster credentials properly configure karo, network access verify karo
- **Learning:** ArgoCD cluster connectivity = GitOps foundation. Connect nahi = deploy nahi
