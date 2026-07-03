---
sidebar_position: 8
title: "PHASE 7: Container Orchestration — Kubernetes + Helm"
description: "**Tumhara level:** Docker samajh aa gaya. Ab Kubernetes seekho — ye tumhara career turning-point hai. K8s samajhna mushk"
---

# PHASE 7: Container Orchestration — Kubernetes + Helm — TEACHING

> **Tumhara level:** Docker samajh aa gaya. Ab Kubernetes seekho — ye tumhara career turning-point hai. K8s samajhna mushkil hai lekin zaroori hai. Har DevOps/Cloud/SRE role mein K8s aata hai. Tumhare Islamic Banking FTE aur NexaBook dono ke liye K8s = production-grade deployment.

---

## Section 1: Kubernetes Kya Hai? — The Mental Model

:::tip CONCEPT: K8s = Docker Ka Manager

Jab tumhare paas 1 container hai, Docker kaafi hai. Jab 100 containers hain, tumhe K8s chahiye.

:::

```
Docker:      1 container -> 1 command
Kubernetes:  100 containers -> automatically manage
```

**K8s kya karta hai:**
- Containers ko automatically start/stop karta hai
- Load balance karta hai
- Auto-scale karta hai (demand badhi to containers badhao)
- Failed containers ko restart karta hai
- Rolling updates karta hai (zero downtime)
- Configuration management karta hai

**Real-world connection:** Tumhare Islamic Banking FTE ko K8s pe deploy karo to:
- 3 replicas (instances) chalengi — agar 1 fail ho, 2 aur hain
- Auto-scaling — peak time pe 5 replicas, night pe 2
- Zero downtime deployment — update ke waqt service band nahi hogi
- Secrets management — database passwords safe hain

:::note HANDS-ON: Local Cluster Setup

:::

```bash
# Minikube install (simplest)
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
minikube start

# Or Kind (better for CI/CD, lightweight)
go install sigs.k8s.io/kind@latest
kind create cluster --name nexabook
kind get clusters

# kubectl install
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install kubectl /usr/local/bin/kubectl

# Verify
kubectl cluster-info
kubectl get nodes
kubectl get namespaces
```

:::caution CHECKPOINT:
1. Docker Swarm aur Kubernetes mein kya fark hai? (Hint: ecosystem, features, industry adoption)
2. Agar tumhara pod crash ho jaaye to K8s kya karega?
3. Managed K8s (EKS/AKS) aur self-hosted K8s mein kya fark hai?

:::

---

## Section 2: K8s Architecture — The Components

:::tip CONCEPT: K8s = 2 Parts (Control Plane + Worker Nodes)

:::

```
Control Plane (Master Node)
+-- API Server -- Tumhara entry point (kubectl se baat karta hai)
+-- Scheduler -- Decide karta hai kaunsa pod kis node pe jaayega
+-- Controller Manager -- Ensure karta hai desired state = actual state
+-- etcd -- Database (sab kuch store hota hai yahan)

Worker Node (Tumhare apps chalte hain)
+-- kubelet -- Node pe agent, control plane se baat karta hai
+-- kube-proxy -- Network rules manage karta hai
+-- Container Runtime -- Docker/containerd (containers chalata hai)
```

**Desired State vs Actual State:**
```yaml
# Tumne bola: "Mere paas 3 replicas chahiye" (Desired State)
apiVersion: apps/v1
kind: Deployment
spec:
  replicas: 3    # Desired State

# K8s ensure karta hai: "Hamesha 3 pods chal rahe hain" (Actual State)
# Agar 1 pod crash ho, K8s naya start karega
```

**Managed K8s Options:**
- **EKS (AWS)** — Amazon manages control plane, tum nodes manage karo
- **AKS (Azure)** — Microsoft manages control plane, free control plane
- **GKE (GCP)** — Google manages control plane, best auto-scaling
- **Self-hosted** — Tum sab manage karo (mushkil, production mein rarely)

---

## Section 3: Core Objects — The Building Blocks

:::tip CONCEPT: Pod = Smallest Deployable Unit

Pod = 1 ya more containers jo ek saath run hote hain. Usually 1 container per pod.

:::

```yaml
# File: pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: nexabook-pod
  labels:
    app: nexabook
spec:
  containers:
    - name: nexabook
      image: nexabook:latest
      ports:
        - containerPort: 3000
      resources:
        limits:
          memory: "256Mi"
          cpu: "500m"
        requests:
          memory: "128Mi"
          cpu: "250m"
```

```bash
# Pod chalao
kubectl apply -f pod.yaml

# Status dekho
kubectl get pods
kubectl get pods -o wide  # Detailed (node, IP dikhega)
kubectl describe pod nexabook-pod

# Logs dekho
kubectl logs nexabook-pod
kubectl logs -f nexabook-pod  # Live
kubectl logs nexabook-pod --previous  # Previous container logs

# Shell mein jao
kubectl exec -it nexabook-pod -- bash

# Delete
kubectl delete pod nexabook-pod
```

:::note HANDS-ON: Pod Scheduling aur Node Affinity

K8s decide karta hai ke pod kis node pe jaayega. Tum bhi control kar sakte ho — node selector, affinity, ya taints/tolerations se.

:::

```yaml
# File: pod-with-node-selector.yaml
# NexaBook ko sirf "production" labelled nodes pe bhejo
apiVersion: v1
kind: Pod
metadata:
  name: nexabook-prod
  labels:
    app: nexabook
    env: production
spec:
  nodeSelector:
    env: production
  containers:
    - name: nexabook
      image: nexabook:latest
      ports:
        - containerPort: 3000
```

```bash
# Step 1: Nodes pe labels lagao
kubectl label nodes node-1 env=production
kubectl label nodes node-2 env=staging

# Step 2: Nodes verify karo
kubectl get nodes --show-labels | grep env

# Step 3: Pod apply karo
kubectl apply -f pod-with-node-selector.yaml

# Step 4: Verify karo ke pod kis node pe hai
kubectl get pod nexabook-prod -o wide
# OUTPUT: nexabook-prod  1/1  Running  node-1  <ip>  ...

# Step 5: Agar galat node pe chala gaya to delete aur recreate
kubectl delete pod nexabook-prod
```

```yaml
# File: pod-with-node-affinity.yaml
# Advanced scheduling — pod ko "disktype=ssd" wale nodes pe bhejo
apiVersion: v1
kind: Pod
metadata:
  name: nexabook-fast
  labels:
    app: nexabook
spec:
  affinity:
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
          - matchExpressions:
              - key: disktype
                operator: In
                values:
                  - ssd
    podAffinity:
      preferredDuringSchedulingIgnoredDuringExecution:
        - weight: 100
          podAffinityTerm:
            labelSelector:
              matchExpressions:
                - key: app
                  operator: In
                  values:
                    - postgres
            topologyKey: kubernetes.io/hostname
  containers:
    - name: nexabook
      image: nexabook:latest
      resources:
        requests:
          memory: "128Mi"
          cpu: "250m"
        limits:
          memory: "256Mi"
          cpu: "500m"
```

```bash
# Node pe label lagao
kubectl label nodes node-1 disktype=ssd

# Pod apply aur verify
kubectl apply -f pod-with-node-affinity.yaml
kubectl get pod nexabook-fast -o wide

# Taints check karo (jo pods ko reject karte hain)
kubectl describe nodes | grep -A 3 Taints
```

**Real-world connection:** NexaBook ke high-traffic pods ko SSD nodes pe schedule karo, aur database pods ko unhi nodes pe rakho jahan fast network ho — is se latency kam hoti hai.

:::caution CHECKPOINT:
1. `nodeSelector` aur `nodeAffinity` mein kya fark hai? Kab kaunsa use karoge?
2. Agar kisi node pe taint hai to pod wahan kaise jaayega? (Hint: tolerations)
3. `podAffinity` kya karta hai? NexaBook ke backend ko database ke paas kyun rakhna chahiye?

:::

---

:::tip CONCEPT: Deployment = Pod Ka Manager

Deployment ensure karta hai ke desired number of pods chal rahe hain. Rolling updates deta hai.

:::

```yaml
# File: deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nexabook
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nexabook
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1        # 1 extra pod banega update ke dauran
      maxUnavailable: 0  # 0 pods band honge (zero downtime)
  template:
    metadata:
      labels:
        app: nexabook
        version: v1
    spec:
      containers:
        - name: nexabook
          image: nexabook:v1
          ports:
            - containerPort: 3000
          env:
            - name: NODE_ENV
              value: "production"
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: nexabook-secrets
                  key: database-url
          resources:
            limits:
              memory: "256Mi"
              cpu: "500m"
            requests:
              memory: "128Mi"
              cpu: "250m"
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /ready
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
          startupProbe:
            httpGet:
              path: /health
              port: 3000
            failureThreshold: 30
            periodSeconds: 10
```

```bash
# Deployment chalao
kubectl apply -f deployment.yaml

# Status dekho
kubectl get deployments
kubectl get rs  # ReplicaSets
kubectl get pods

# Scaling
kubectl scale deployment nexabook --replicas=5

# Update (rolling update)
kubectl set image deployment/nexabook nexabook=nexabook:v2

# Rollout status
kubectl rollout status deployment/nexabook

# Rollback
kubectl rollout undo deployment/nexabook
kubectl rollout history deployment/nexabook

# Rollback to specific revision
kubectl rollout undo deployment/nexabook --to-revision=2
```

:::note HANDS-ON: Rolling Update aur Rollback Practically Karo

Ye exercise tumhe dikhayegi ke production mein deployment kaise hota hai — zero downtime ke sath. Islamic Banking FTE ka v1 → v2 upgrade karo.

:::

```bash
# Step 1: NexaBook ka v1 deployment chalao
kubectl create deployment nexabook --image=nginx:1.20 --replicas=3 --dry-run=client -o yaml | kubectl apply -f -

# Step 2: Service banao
kubectl expose deployment nexabook --port=80 --target-port=80 --type=ClusterIP

# Step 3: Verify — sab pods Running hain
kubectl get pods -l app=nexabook -o wide
# OUTPUT: 3 pods Running on different nodes

# Step 4: Ek terminal mein rollout status monitor karo
kubectl rollout status deployment/nexabook

# Step 5: Dusre terminal mein v2 deploy karo (rolling update)
kubectl set image deployment/nexabook nginx=nginx:1.21

# Step 6: Update ke dauran observe karo
kubectl get pods -w
# OUTPUT: OLD pod terminating, NEW pod creating
# ZERO downtime — koi pod band nahi hua

# Step 7: History dekho
kubectl rollout history deployment/nexabook
# REVISION  CHANGE-CAUSE
# 1         <none>
# 2         <none>

# Step 8: Rollback karo (agar v2 mein bug ho)
kubectl rollout undo deployment/nexabook

# Step 9: Verify — wapas v1 pe aaye
kubectl get pods -l app=nexabook -o wide
kubectl rollout history deployment/nexabook

# Step 10: Specific revision pe rollback
kubectl rollout undo deployment/nexabook --to-revision=1
```

**Real-world connection:** Islamic Banking FTE mein jab compliance rules update hote hain, tum zero-downtime rolling update use karoge. Agar naya rule galat hai to instant rollback — koi transaction miss nahi hogi.

:::caution CHECKPOINT:
1. Rolling update mein `maxSurge` aur `maxUnavailable` kya karte hain? Agar `maxUnavailable: 0` ho to kya hoga?
2. `kubectl rollout undo` v1 pe wapas jaata hai ya previous revision pe?
3. Production mein rolling update ke dauran kaise ensure karoge ke naya version sahi kaam kar raha hai? (Hint: readinessProbe)

:::

---

:::tip CONCEPT: Service = Pod Ka Address

Pod IP change hota hai. Service ek fixed address deti hai.

:::

```yaml
# File: service.yaml
apiVersion: v1
kind: Service
metadata:
  name: nexabook-service
spec:
  selector:
    app: nexabook
  ports:
    - protocol: TCP
      port: 80        # Service port
      targetPort: 3000  # Pod port
  type: ClusterIP  # Internal only
```

**Service Types:**
- **ClusterIP** — Internal (default). Sirf cluster andar accessible.
- **NodePort** — External (port 30000-32767). Har node pe accessible.
- **LoadBalancer** — Cloud pe external load balancer create karta hai.

```bash
# Service dekho
kubectl get services
kubectl describe service nexabook-service

# Pod ke IP dekho
kubectl get pods -o wide

# Test (cluster ke andar)
kubectl run test --image=busybox --rm -it -- wget -qO- http://nexabook-service
```

:::caution CHECKPOINT:
1. Pod aur Deployment mein kya fark hai? Agar sirf Pod use karoge to kya problem aa sakti hai?
2. Service ke 3 types (ClusterIP, NodePort, LoadBalancer) mein kab kaunsa use karoge?
3. `livenessProbe` aur `readinessProbe` mein kya fark hai? `startupProbe` kab zaroori hai?

:::

---

## Section 4: ConfigMaps, Secrets & Namespaces — Configuration Management

:::tip CONCEPT: ConfigMaps = Non-Sensitive Config

:::

```yaml
# File: configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: nexabook-config
  namespace: nexabook
data:
  NODE_ENV: "production"
  LOG_LEVEL: "info"
  config.json: |
    {
      "apiUrl": "https://api.nexabook.com",
      "features": {
        "darkMode": true
      }
    }
```

```yaml
# Deployment mein use karo
spec:
  containers:
    - name: nexabook
      envFrom:
        - configMapRef:
            name: nexabook-config
      volumeMounts:
        - name: config-volume
          mountPath: /app/config
  volumes:
    - name: config-volume
      configMap:
        name: nexabook-config
```

:::tip CONCEPT: Secrets = Sensitive Data (Encrypted)

:::

```yaml
# File: secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: nexabook-secrets
  namespace: nexabook
type: Opaque
data:
  database-url: cG9zdGdyZXNxbDovL3VzZXI6cGFzc0Bob3N0OjU0MzIvbmV4YWJvb2s=  # base64 encoded
  api-key: c2VjcmV0LWFwaS1rZXk=
```

```bash
# Base64 encode
echo -n "postgresql://user:pass@host:5432/nexabook" | base64

# Decode
echo "cG9zdGdyZXNxbDov..." | base64 -d
```

```yaml
# Deployment mein use karo
spec:
  containers:
    - name: nexabook
      env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: nexabook-secrets
              key: database-url
```

:::tip CONCEPT: Namespaces = Logical Isolation

:::

```yaml
# Namespace banao
apiVersion: v1
kind: Namespace
metadata:
  name: nexabook
  labels:
    env: production
```

```bash
# Namespace switch
kubectl config set-context --current --namespace=nexabook

# Resources list by namespace
kubectl get pods -n nexabook
kubectl get all --all-namespaces

# Resource quota
kubectl apply -f - <<EOF
apiVersion: v1
kind: ResourceQuota
metadata:
  name: nexabook-quota
  namespace: nexabook
spec:
  hard:
    requests.cpu: "4"
    requests.memory: 8Gi
    limits.cpu: "8"
    limits.memory: 16Gi
    pods: "20"
EOF
```

**NEVER:**
```yaml
# GALAT — secrets plain text mein mat likho
env:
  - name: DATABASE_URL
    value: "postgresql://user:pass@host/db"  # BAD
```

:::note HANDS-ON: ConfigMap aur Secret ko Deployment mein Mount Karo

Ye exercise tumhe dikhayegi ke config files ko container mein kaise inject karte hain aur verify karte hain ke sahi mount ho gayi hain. Islamic Banking FTE ka compliance config setup karo.

:::

```bash
# Step 1: Namespace banao (agar nahi hai)
kubectl create namespace nexabook --dry-run=client -o yaml | kubectl apply -f -

# Step 2: ConfigMap banao (compliance rules)
kubectl create configmap nexabook-config \
  --from-literal=NODE_ENV=production \
  --from-literal=LOG_LEVEL=info \
  --from-literal=COMPLIANCE_MODE=strict \
  -n nexabook

# Step 3: Secret banao (database credentials)
kubectl create secret generic nexabook-secrets \
  --from-literal=DATABASE_URL=postgresql://admin:StrongPass123@postgres:5432/islamic_banking \
  --from-literal=API_KEY=sk-islamic-banking-prod-2026 \
  -n nexabook

# Step 4: Verify
kubectl get configmap nexabook-config -n nexabook -o yaml
kubectl get secret nexabook-secrets -n nexabook -o yaml
```

```yaml
# File: nexabook-deployment-with-config.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nexabook
  namespace: nexabook
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
          image: nginx:latest
          ports:
            - containerPort: 80
          envFrom:
            - configMapRef:
                name: nexabook-config
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: nexabook-secrets
                  key: DATABASE_URL
            - name: API_KEY
              valueFrom:
                secretKeyRef:
                  name: nexabook-secrets
                  key: API_KEY
          volumeMounts:
            - name: config-volume
              mountPath: /app/config
              readOnly: true
          resources:
            limits:
              memory: "256Mi"
              cpu: "500m"
            requests:
              memory: "128Mi"
              cpu: "250m"
      volumes:
        - name: config-volume
          configMap:
            name: nexabook-config
```

```bash
# Step 5: Deployment apply karo
kubectl apply -f nexabook-deployment-with-config.yaml -n nexabook

# Step 6: Pod mein jao aur verify karo
kubectl get pods -n nexabook
kubectl exec -it $(kubectl get pods -n nexabook -l app=nexabook -o jsonpath='{.items[0].metadata.name}') -n nexabook -- bash

# Step 7: Andar jaake check karo
# Environment variables verify
env | grep NODE_ENV
# OUTPUT: NODE_ENV=production

env | grep DATABASE_URL
# OUTPUT: DATABASE_URL=postgresql://admin:StrongPass123@postgres:5432/islamic_banking

# Volume mount verify
ls -la /app/config/
# OUTPUT: NODE_ENV  LOG_LEVEL  COMPLIANCE_MODE (files dikhenge)

cat /app/config/NODE_ENV
# OUTPUT: production

# Step 8: Bahar aao aur secret decode karo
kubectl get secret nexabook-secrets -n nexabook -o jsonpath='{.data.DATABASE_URL}' | base64 -d
# OUTPUT: postgresql://admin:StrongPass123@postgres:5432/islamic_banking
```

**Real-world connection:** Islamic Banking FTE mein compliance rules (ConfigMap) aur database credentials (Secret) alag-alag rakhna hota hai. ConfigMap update karne pe pod restart nahi hota — sirf secret update pe hota hai.

:::caution CHECKPOINT:
1. ConfigMap aur Secret ka mount kaise different hai `env` se? Kab mount use karoge aur kab `env`?
2. Secret ko decode karna kitna secure hai? Production mein aur kya karte hain? (Hint: external secrets operator)
3. ConfigMap update karne pe pod automatically restart hota hai ya nahi? Kaise pata chalega?

:::

---

## Section 5: Ingress, Storage & StatefulSets — Production Essentials

:::tip CONCEPT: Ingress = Reverse Proxy (Like Nginx)

:::

```yaml
# File: ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: nexabook-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
    - hosts:
        - nexabook.com
        - api.nexabook.com
      secretName: nexabook-tls
  rules:
    - host: nexabook.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: nexabook-frontend
                port:
                  number: 80
    - host: api.nexabook.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: nexabook-backend
                port:
                  number: 80
```

```bash
# Ingress install (minikube)
minikube addons enable ingress

# Ingress dekho
kubectl get ingress
kubectl describe ingress nexabook-ingress
```

:::tip CONCEPT: Persistent Volumes = Data Storage

:::

```yaml
# PersistentVolume (cluster-wide storage)
apiVersion: v1
kind: PersistentVolume
metadata:
  name: nexabook-pv
spec:
  capacity:
    storage: 10Gi
  accessModes:
    - ReadWriteOnce
  hostPath:
    path: /mnt/data

---
# PersistentVolumeClaim (pod request for storage)
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: nexabook-pvc
  namespace: nexabook
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi

---
# StatefulSet (for databases — stable network identity)
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
spec:
  serviceName: postgres
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
        - name: postgres
          image: postgres:16
          ports:
            - containerPort: 5432
          env:
            - name: POSTGRES_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: nexabook-secrets
                  key: database-url
          volumeMounts:
            - name: postgres-data
              mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:
    - metadata:
        name: postgres-data
      spec:
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 10Gi
```

```bash
# PVC check karo
kubectl get pvc
kubectl describe pvc nexabook-pvc

# StatefulSet check karo
kubectl get statefulset
kubectl get pods  # postgres-0 dikhega (stable name)
```

**Deployment vs StatefulSet:**
- Deployment: Pods ka naam random hota hai (nexabook-xyz123)
- StatefulSet: Pods ka naam fixed hota hai (postgres-0, postgres-1)
- StatefulSet: Stable network identity, ordered deployment, stable storage
- Use StatefulSet for: Databases, message queues, anything needing stable identity

:::tip CONCEPT: DaemonSets & Jobs

:::

```yaml
# DaemonSet — har node pe 1 pod chale
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: log-collector
  namespace: kube-system
spec:
  selector:
    matchLabels:
      app: log-collector
  template:
    metadata:
      labels:
        app: log-collector
    spec:
      containers:
        - name: fluentd
          image: fluentd:latest

---
# Job — ek baar kaam kare aur band ho
apiVersion: batch/v1
kind: Job
metadata:
  name: db-migration
spec:
  template:
    spec:
      containers:
        - name: migrate
          image: nexabook:latest
          command: ["npm", "run", "migrate"]
      restartPolicy: Never
  backoffLimit: 3

---
# CronJob — scheduled kaam
apiVersion: batch/v1
kind: CronJob
metadata:
  name: backup-cron
spec:
  schedule: "0 2 * * *"  # Har raat 2 baje
  jobTemplate:
    spec:
      template:
        spec:
          containers:
            - name: backup
              image: nexabook-backup:latest
              command: ["npm", "run", "backup"]
          restartPolicy: OnFailure
```

:::caution CHECKPOINT:
1. Deployment aur StatefulSet mein kya fark hai? Kab StatefulSet use karoge?
2. PV aur PVC mein kya fark hai? StorageClass kya hai?
3. DaemonSet aur Deployment mein kya fark hai?

:::

---

## Section 6: Helm — Package Manager for K8s

:::tip CONCEPT: Helm = K8s App Store

Helm se tum complex K8s applications ko package kar sakte ho. Ek command mein poori app deploy.

:::

```bash
# Helm install
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Chart create
helm create nexabook-chart

# Chart structure
nexabook-chart/
+-- Chart.yaml        # Metadata
+-- values.yaml       # Default values
+-- templates/
|   +-- deployment.yaml
|   +-- service.yaml
|   +-- ingress.yaml
|   +-- configmap.yaml
|   +-- _helpers.tpl
```

```yaml
# File: values.yaml (customize karo)
replicaCount: 3

image:
  repository: nexabook
  tag: "latest"
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 80

ingress:
  enabled: true
  hosts:
    - host: nexabook.com
      paths:
        - path: /
          pathType: Prefix

resources:
  limits:
    memory: 256Mi
    cpu: 500m
  requests:
    memory: 128Mi
    cpu: 250m
```

```bash
# Install
helm install nexabook ./nexabook-chart

# Install with custom values
helm install nexabook ./nexabook-chart --set replicaCount=5

# Install with values file
helm install nexabook ./nexabook-chart -f custom-values.yaml

# Upgrade
helm upgrade nexabook ./nexabook-chart --set image.tag=v2

# Rollback
helm rollback nexabook 1

# List releases
helm list

# Uninstall
helm uninstall nexabook

# Dry run (test without applying)
helm install nexabook ./nexabook-chart --dry-run --debug
```

:::note HANDS-ON: Islamic Banking FTE Helm Chart

:::

```bash
# Chart create
helm create islamic-banking

# Values customize
cat > islamic-banking/values.yaml << 'EOF'
replicaCount: 3

image:
  repository: islamic-banking-api
  tag: "v1.0"

database:
  host: "postgres"
  port: 5432
  name: "islamic_banking"

resources:
  limits:
    memory: 512Mi
    cpu: "1"
  requests:
    memory: 256Mi
    cpu: 500m
EOF

# Install
helm install islamic-banking ./islamic-banking
```

:::note HANDS-ON: Helm Install, Upgrade aur Rollback Practically Karo

Ye exercise tumhe dikhayegi ke Helm se production deployment kaise hota hai — install, upgrade with new version, aur rollback agar kuch gadbad ho.

:::

```bash
# Step 1: Chart create karo
helm create nexabook-chart

# Step 2: values.yaml customize karo — NexaBook ke liye
cat > nexabook-chart/values.yaml << 'EOF'
replicaCount: 3

image:
  repository: nexabook
  tag: "v1.0"
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 80

ingress:
  enabled: false

resources:
  limits:
    memory: 256Mi
    cpu: 500m
  requests:
    memory: 128Mi
    cpu: 250m
EOF

# Step 3: Install karo
helm install nexabook ./nexabook-chart
# OUTPUT: STATUS: deployed

# Step 4: Verify karo
helm list
# NAME      NAMESPACE  REVISION  STATUS     CHART
# nexabook  default    1         deployed   nexabook-chart-0.1.0

kubectl get pods -l app.kubernetes.io/name=nexabook
# OUTPUT: 3 pods Running

# Step 5: Upgrade karo — v2 deploy karo
helm upgrade nexabook ./nexabook-chart --set image.tag=v2

# Step 6: Rollout status check
kubectl rollout status deployment/nexabook
# OUTPUT: deployment "nexabook" successfully rolled out

# Step 7: History dekho
helm history nexabook
# REVISION  UPDATED                   STATUS     CHART
# 1         ...                       superseded nexabook-chart-0.1.0
# 2         ...                       deployed   nexabook-chart-0.1.0

# Step 8: Rollback karo (v2 mein bug mila)
helm rollback nexabook 1

# Step 9: Verify — v1 wapas aa gaya
helm history nexabook
kubectl get pods -l app.kubernetes.io/name=nexabook

# Step 10: Agar chart test karna ho bina install ke
helm template nexabook ./nexabook-chart | kubectl apply -f -
# Ya dry run
helm install nexabook ./nexabook-chart --dry-run --debug

# Step 11: Uninstall jab kaam khatam ho
helm uninstall nexabook
```

**Real-world connection:** Islamic Banking FTE ka compliance engine jab update hota hai, Helm upgrade se zero-downtime hota hai. Agar naya compliance rule galat hai to `helm rollback 1` se instant wapas — koi transaction process nahi hota galat rules ke sath.

:::caution CHECKPOINT:
1. `helm upgrade` aur `helm rollback` mein kya fark hai? Kab kaunsa use karoge?
2. Helm chart version aur app version mein kya fark hai? `Chart.yaml` mein kya likhte hain?
3. Production mein Helm chart ko kaise version control karte hain? (Hint: Chart.yaml versioning)

:::

---

## Section 7: Autoscaling — Automatic Scaling

:::tip CONCEPT: HPA = Auto Scale Based on Demand

:::

```yaml
# File: hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: nexabook-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: nexabook
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
        - type: Pods
          value: 2
          periodSeconds: 60
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
        - type: Percent
          value: 10
          periodSeconds: 60
```

```bash
# HPA dekho
kubectl get hpa

# Metrics Server install (HPA ke liye zaroori)
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Load test karo (aur dekho scaling)
kubectl run load-test --image=busybox --rm -it -- /bin/sh -c "while true; do wget -qO- http://nexabook-service; done"

# Manual scaling (testing ke liye)
kubectl scale deployment nexabook --replicas=10
```

:::note HANDS-ON: HPA Setup aur Load Test Practically Karo

Ye exercise tumhe dikhayegi ke auto-scaling kaise kaam karta hai — load badhao aur dekho pods automatically badhte hain. NexaBook ka peak traffic simulation karo.

:::

```bash
# Step 1: NexaBook deployment chalao (pehle se hona chahiye)
kubectl get deployment nexabook
# Agar nahi hai to banao:
kubectl create deployment nexabook --image=nginx:latest --replicas=2

# Step 2: Metrics Server install (HPA ke liye zaroori)
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Step 3: Wait 1-2 minutes (metrics server ko time lagta hai)
kubectl get pods -n kube-system | grep metrics-server
# OUTPUT: metrics-server-xxx Running

# Step 4: HPA create karo
kubectl autoscale deployment nexabook --min=2 --max=10 --cpu-percent=70

# Step 5: HPA status check
kubectl get hpa
# NAME      REFERENCE          TARGETS   MINPODS   MAXPODS   REPLICAS
# nexabook  Deployment/nexabook 0%/70%    2         10        2

# Step 6: Load test karo — CPU pressure create karo
kubectl run load-generator --image=busybox --rm -it -- /bin/sh -c "while true; do wget -qO- http://nexabook-service; done"
# Ye terminal mein chalega — Ctrl+C se band karo jab scaling dekh lo

# Step 7: Dusre terminal mein scaling observe karo
kubectl get hpa -w
# OUTPUT: CPU% badhega -> REPLICAS badhenge
# TARGETS: 75%/70% -> 2 -> 4 -> 6 -> 8

# Step 8: Pods check karo
kubectl get pods -l app=nexabook -w
# OUTPUT: Nayi pods ban rahi hain

# Step 9: Jab load band karo, scaling down dekho
# Ctrl+C load-generator mein
kubectl get hpa -w
# OUTPUT: CPU% kam hoga -> REPLICAS kam honge
# stabilizationWindowSeconds: 300 (5 minute wait)

# Step 10: Manual scaling bhi test karo
kubectl scale deployment nexabook --replicas=5
kubectl get hpa
```

**Real-world connection:** NexaBook mein jab Islamic banking transaction peak time pe hoti hai (month-end), HPA automatically pods badha deta hai. Raat ko traffic kam ho to pods kam ho jaate hain — cost save hoti hai.

:::caution CHECKPOINT:
1. HPA `--cpu-percent=70` ka matlab kya hai? 70% CPU use hone pe kya hota hai?
2. Scaling down mein itna time kyun lagta hai? (Hint: stabilizationWindowSeconds)
3. Production mein HPA ke sath PDB kyun zaroori hai?

:::

---

:::tip CONCEPT: Pod Disruption Budget (PDB)

:::

```yaml
# PDB — ensure minimum pods always available
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: nexabook-pdb
spec:
  minAvailable: 2  # Kam se kam 2 pods hamesha available
  selector:
    matchLabels:
      app: nexabook
```

```bash
# PDB check
kubectl get pdb
kubectl describe pdb nexabook-pdb
```

:::caution CHECKPOINT:
1. HPA minimum 2 replicas kyun rakhta hai? (Hint: availability)
2. PDB kya hai? Agar node drain ho to PDB kya karega?

:::

---

## Section 8: RBAC & Network Policies — Security

:::tip CONCEPT: RBAC = Who Can Do What

:::

```yaml
# Role — namespace-level permissions
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: nexabook
  name: nexabook-developer
rules:
  - apiGroups: [""]
    resources: ["pods", "services", "configmaps"]
    verbs: ["get", "list", "watch"]
  - apiGroups: ["apps"]
    resources: ["deployments"]
    verbs: ["get", "list", "watch", "update", "patch"]

---
# RoleBinding — user ko role assign karo
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: nexabook-developer-binding
  namespace: nexabook
subjects:
  - kind: User
    name: ali
    apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: Role
  name: nexabook-developer
  apiGroup: rbac.authorization.k8s.io

---
# ClusterRole — cluster-wide permissions
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: node-reader
rules:
  - apiGroups: [""]
    resources: ["nodes"]
    verbs: ["get", "list", "watch"]
```

:::tip CONCEPT: Network Policies = Firewall for Pods

:::

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: nexabook-network-policy
  namespace: nexabook
spec:
  podSelector:
    matchLabels:
      app: nexabook
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: frontend
      ports:
        - protocol: TCP
          port: 3000
  egress:
    - to:
        - podSelector:
            matchLabels:
              app: database
      ports:
        - protocol: TCP
          port: 5432
```

```bash
# RBAC test
kubectl auth can-i get pods -n nexabook --as=ali
kubectl auth can-i delete deployments -n nexabook --as=ali

# Network Policy check
kubectl get networkpolicy -n nexabook
```

:::caution CHECKPOINT:
1. Role aur ClusterRole mein kya fark hai?
2. Network Policy ka default behavior kya hai? (All allow ya all deny?)

:::

---

## Section 9: Debugging & Troubleshooting — Daily Routine

:::tip CONCEPT: Debugging = Tumhari Daily Routine

:::

```bash
# Pod status dekho
kubectl get pods
# STATUS: CrashLoopBackOff, Error, Pending, ImagePullBackOff

# Detailed info
kubectl describe pod nexabook-pod

# Logs dekho
kubectl logs nexabook-pod
kubectl logs nexabook-pod --previous  # Previous container ke logs

# Events dekho
kubectl get events --sort-by=.metadata.creationTimestamp

# Shell mein jao
kubectl exec -it nexabook-pod -- bash

# Resource usage
kubectl top nodes
kubectl top pods
```

**Common Issues:**
1. **CrashLoopBackOff** — App crash ho raha hai. `kubectl logs --previous` dekho.
2. **ImagePullBackOff** — Image nahi mil rahi. Image name/tag check karo.
3. **Pending** — Resources nahi hain. `kubectl describe pod` se events dekho.
4. **Service Unreachable** — Selector/port match nahi ho raha. `kubectl get endpoints` check karo.
5. **OOMKilled** — Memory limit exceed. Resources badhao.

```bash
# Advanced debugging
kubectl get pods -o json | jq '.items[] | select(.status.phase!="Running") | .metadata.name'

# Node issues
kubectl describe node <node-name>
kubectl get node <node-name> -o yaml

# DNS resolution test
kubectl run dns-test --image=busybox --rm -it -- nslookup nexabook-service

# Network connectivity test
kubectl run net-test --image=busybox --rm -it -- wget -qO- http://nexabook-service
```

:::note HANDS-ON: Resource Limits Set Karo aur OOMKill Reproduce Karo

Ye exercise tumhe dikhayegi ke resource limits kyun zaroori hain aur kya hota hai jab limit cross ho jaaye. Production mein ye sabse common issue hai.

:::

```bash
# Step 1: Memory-limited pod banao
kubectl apply -f - << 'EOF'
apiVersion: v1
kind: Pod
metadata:
  name: memory-test
  labels:
    app: memory-test
spec:
  containers:
    - name: stress
      image: polinux/stress
      command: ["stress"]
      args: ["--vm", "1", "--vm-bytes", "50M", "--vm-hang", "1"]
      resources:
        limits:
          memory: "100Mi"
        requests:
          memory: "50Mi"
EOF

# Step 2: Pod status check — pehle Running dikhega
kubectl get pod memory-test -w
# Wait 10-15 seconds

# Step 3: OOMKill status verify
kubectl get pod memory-test
# OUTPUT: STATUS: OOMKilled (exit code 137)

# Step 4: Describe karo — events mein dikhega
kubectl describe pod memory-test
# Events:
#   Warning  OOMKilling  Pod exceeded memory limit

# Step 5: Previous container logs dekho
kubectl logs memory-test --previous

# Step 6: Ab memory limit badhao aur dobara try karo
kubectl apply -f - << 'EOF'
apiVersion: v1
kind: Pod
metadata:
  name: memory-test-v2
  labels:
    app: memory-test
spec:
  containers:
    - name: stress
      image: polinux/stress
      command: ["stress"]
      args: ["--vm", "1", "--vm-bytes", "50M", "--vm-hang", "1"]
      resources:
        limits:
          memory: "200Mi"
        requests:
          memory: "100Mi"
EOF

# Step 7: Verify — ab Running rahega
kubectl get pod memory-test-v2 -w
# OUTPUT: Running (OOMKill nahi hoga)

# Step 8: Resource usage dekho
kubectl top pod memory-test-v2
# OUTPUT: MEMORY BYTES   CPU CORES
#         52Mi / 200Mi   0.01 / 0.25
```

```bash
# CPU limits test karo
kubectl apply -f - << 'EOF'
apiVersion: v1
kind: Pod
metadata:
  name: cpu-test
spec:
  containers:
    - name: stress
      image: polinux/stress
      command: ["stress"]
      args: ["--cpu", "2"]
      resources:
        limits:
          cpu: "500m"
        requests:
          cpu: "250m"
EOF

# CPU throttle check
kubectl top pod cpu-test
kubectl describe pod cpu-test | grep -A 3 "Limits"
# OUTPUT: Limits: cpu: 500m, memory: 128Mi
```

**Real-world connection:** Islamic Banking FTE mein agar koi transaction batch processing bohot zyada memory le le to OOMKill ho sakta hai. Resource limits set karna = ek service ko dosre ko crash karne se rokna.

:::caution CHECKPOINT:
1. OOMKilled pod automatically restart hota hai ya nahi? Kya hota hai jab 3 baar OOMKill ho?
2. `requests` aur `limits` mein kya fark hai? Agar sirf `limits` do to kya hoga?
3. CPU limit cross karne pe pod crash hota hai ya throttle hota hai?

:::

---

## Summary: Phase 7 Key Takeaways

| Concept | Tumne Kya Seekha |
|---------|-----------------|
| Architecture | Control Plane + Worker Nodes |
| Core Objects | Pod, Deployment, Service, ReplicaSet |
| Config | ConfigMaps, Secrets, Namespaces |
| Storage | PV, PVC, StatefulSet |
| Ingress | External traffic routing, TLS |
| Helm | Package management, values, rollback |
| HPA | Auto-scaling based on metrics |
| RBAC | Access control (Role, ClusterRole) |
| Network Policies | Pod-level firewall |
| Debugging | `kubectl describe`, `logs`, `events`, `top` |

---

## MINI-TASKS

### Task 1: Deploy 3-Tier App (25 min)
Kubernetes pe deploy karo:
- Frontend (Deployment + Service + Ingress)
- Backend (Deployment + Service + ConfigMap)
- Database (StatefulSet + Secret + PVC)

### Task 2: Helm Chart (15 min)
NexaBook ka Helm chart banao with:
- Configurable replicas
- ConfigMap injection
- Ingress setup
- Resource limits
- Values override

### Task 3: HPA Setup (10 min)
HPA configure karo:
- Min 2, Max 10 replicas
- CPU 70% pe scale up
- Load test se verify karo

### Task 4: Security (15 min)
RBAC + Network Policy setup karo:
- Developer role (read-only access)
- Network policy (frontend -> backend -> database)
- Verify with `kubectl auth can-i`

---

## INCIDENT.md: Practice Scenarios

### Incident #1: CrashLoopBackOff
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

### Incident #2: Service Unreachable
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

### Incident #3: HPA Not Scaling
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

### Incident #4: Pod Pending — Insufficient Resources
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

### Incident #5: ImagePullBackOff
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
