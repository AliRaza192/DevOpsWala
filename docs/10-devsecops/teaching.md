---
sidebar_position: 11
title: "PHASE 10: DevSecOps"
description: "**Tumhara level:** Tum CI/CD seekh chuke ho (Phase 6). Ab security add karo pipeline mein — DevSecOps. Shift-left securi"
---

# PHASE 10: DevSecOps — TEACHING

> **Tumhara level:** Tum CI/CD seekh chuke ho (Phase 6). Ab security add karo pipeline mein — DevSecOps. Shift-left security = har step mein security check. Ye tumhare Islamic Banking FTE ke liye directly applicable hai — jahan compliance aur security critical hai.

---

## Section 1: DevSecOps Kya Hai? — Shift-Left Security

:::tip CONCEPT: Security = Everyone's Job (Not Just Security Team)

**Traditional:** Security team end mein check karti hai — slow, expensive,finding vulnerabilities deploy ke baad.
**DevSecOps:** Security har step mein hai — early detection = cheap fix.

:::

```
Traditional:   Code -> Build -> Test -> Deploy -> Security Scan (LAST!)
DevSecOps:     Code -> SAST -> Build -> Image Scan -> Policy Check -> Deploy -> DAST -> Runtime
               │       │       │          │              │            │       │       │
               │       │       │          │              │            │       │       └─ Runtime protection
               │       │       │          │              │            │       └─ OWASP ZAP
               │       │       │          │              │            └─ Kyverno policies
               │       │       │          │              └─ Pod Security Standards
               │       │       │          └─ Trivy scan
               │       │       └─ Build
               │       └─ SonarQube/Gitleaks
               └─ Pre-commit hooks
```

**DevSecOps Lifecycle:**
1. **Plan** — Threat modeling, security requirements
2. **Code** — Pre-commit hooks, secret scanning
3. **Build** — SAST, dependency scanning, SBOM
4. **Test** — DAST, penetration testing
5. **Release** — Image signing, policy enforcement
6. **Deploy** — Kyverno/Gatekeeper admission control
7. **Operate** — Runtime security, WAF, monitoring
8. **Monitor** — SIEM, incident response

**Real-world connection:** Tumhare Islamic Banking SaaS mein:
- Har PR pe automatic security scan (Gitleaks + Trivy)
- Vulnerable dependencies block hoti hain (CI/CD gate)
- Container images signed hoti hain (Cosign)
- Kyverno policies ensure karti hain ke sirf compliant pods chalein
- Audit trail maintained hota hai (compliance ke liye)
- SOC2/ISO27001 compliance automatically track hota hai

:::caution CHECKPOINT:
1. Dev aur DevSecOps mein kya fark hai? Security kab add karni chahiye?
2. Shift-left security ka kya matlab hai? Early detection ka benefit kya hai?
3. Tumhare Islamic Banking SaaS mein kaunsi security checks zaroori hain?

:::

---

## Section 2: Secret Scanning — Gitleaks + TruffleHog

:::tip CONCEPT: Secrets = API Keys, Passwords, Tokens — Git Mein Kabhi Nahi

Git mein accidentally secrets commit ho jaati hain. Ye bahut dangerous hai — even after deletion, Git history mein rehti hain.

:::

### Install Gitleaks

```bash
# Method 1: Binary download
wget https://github.com/gitleaks/gitleaks/releases/download/v8.18.2/gitleaks_8.18.2_linux_x64.tar.gz
tar -xzf gitleaks_8.18.2_linux_x64.tar.gz
sudo mv gitleaks /usr/local/bin/

# Method 2: Go install
go install github.com/gitleaks/gitleaks/v8@latest
```

### Usage

```bash
# Purana Git history scan karo
gitleaks detect --source . --verbose

# Sirf staged files scan karo
gitleaks detect --staged --verbose

# JSON report generate karo
gitleaks detect --source . --report-format json --report-path gitleaks-report.json

# Specific commit scan
gitleaks detect --source . --log-opts="--since=2024-01-01"

# Verbose output
gitleaks detect --source . -v
```

### Pre-Commit Hook Setup

```bash
# File: .git/hooks/pre-commit
#!/bin/bash
echo "Running secret scan..."

# Staged files scan
gitleaks detect --staged --verbose --no-banner

if [ $? -ne 0 ]; then
    echo "ERROR: Secrets detected! Commit blocked."
    echo "Fix: Remove secrets from staged files."
    exit 1
fi

echo "No secrets found. Proceeding with commit."
```

```bash
# Make executable
chmod +x .git/hooks/pre-commit
```

### Gitleaks Configuration

```toml
# File: .gitleaks.toml (project root mein rakho)
title = "Gitleaks config"

[allowlist]
description = "Global allowlist"
regex = '''(test|example|mock|dummy)'''
paths = [
    '''test/''',
    '''mock/''',
    '''__pycache__/'''
]

# Specific rule allowlist
[[rules]]
id = "aws-access-key"
description = "AWS Access Key"
regex = '''(AKIA[0-9A-Z]{16})'''
[rules.allowlist]
paths = [
    '''test/fixtures/'''
]
```

### GitHub Actions Integration

```yaml
# File: .github/workflows/secret-scan.yml
name: Secret Scanning

on: [push, pull_request]

jobs:
  gitleaks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Full history scan
      
      - name: Run Gitleaks
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          GITLEAKS_LICENSE: ${{ secrets.GITLEAKS_LICENSE }}  # If commercial
```

### TruffleHog (Alternative)

```bash
# Install
docker run -it -v "$PWD:/pwd" trufflesecurity/trufflehog:latest filesystem /pwd

# GitHub scan
trufflehog github --repo https://github.com/your/repo
```

:::note HANDS-ON: Secret Scanning Practice

:::

```bash
# Test file banao with fake secrets
cat > test-secrets.txt << 'EOF'
AKIAIOSFODNN7EXAMPLE
password = "mysecretpassword123"
api_key: "sk-1234567890abcdef"
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
DATABASE_URL=postgresql://user:password123@localhost:5432/mydb
EOF

# Scan karo
gitleaks detect --source test-secrets.txt --verbose

# Result: "Found 5 leaks"
# Clean karo
rm test-secrets.txt
git rm --cached test-secrets.txt 2>/dev/null
```

:::caution CHECKPOINT:
1. Gitleaks aur TruffleHog mein kya fark hai?
2. `--staged` flag kyun use karte hain pre-commit hook mein?
3. Agar Git history mein secret hai to kaise remove karoge?

:::

---

## Section 3: Container Image Scanning — Trivy Deep Dive

:::tip CONCEPT: Trivy = Image + Filesystem + Git Repo Scanner

Trivy sab kuch scan karta hai — OS packages, application dependencies, IaC misconfigurations, secrets.

:::

### Install Trivy

```bash
# Ubuntu/Debian
sudo apt-get install wget apt-transport-https gnupg lsb-release
wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -
echo "deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" | sudo tee /etc/apt/sources.list.d/trivy.list
sudo apt-get update
sudo apt-get install trivy

# Binary
wget https://github.com/aquasecurity/trivy/releases/download/v0.52.0/trivy_0.52.0_Linux-64bit.tar.gz
tar -xzf trivy_0.52.0_Linux-64bit.tar.gz
sudo mv trivy /usr/local/bin/
```

### Scan Commands

```bash
# Full image scan
trivy image nginx:latest

# Only HIGH + CRITICAL
trivy image --severity HIGH,CRITICAL nginx:latest

# JSON output
trivy image --format json --output results.json nginx:latest

# Fail CI on CRITICAL
trivy image --exit-code 1 --severity CRITICAL nginx:latest

# Scan specific OS packages only
trivy image --scanners vuln nginx:latest

# Scan config misconfigurations
trivy image --scanners config nginx:latest

# Compare two images
trivy image nginx:1.24 > old-scan.txt
trivy image nginx:1.25 > new-scan.txt
diff old-scan.txt new-scan.txt
```

:::note HANDS-ON: Image Scan Practice

:::

```bash
# Vulnerable image scan — dekho kitne CVEs hain
trivy image python:3.8

# Minimal image scan — dekho kitna kam hai
trivy image distroless/static

# Custom image build aur scan
docker build -t myapp:v1 .
trivy image myapp:v1

# Filesystem scan (IaC misconfigs)
trivy config ./k8s/

# Git repo scan
trivy repo https://github.com/your/repo
```

### GitHub Actions Integration

```yaml
# File: .github/workflows/image-scan.yml
name: Image Security Scan

on:
  push:
    branches: [main]

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Build image
        run: docker build -t ghcr.io/${{ github.repository }}:${{ github.sha }} .
      
      # Table output (human readable)
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'ghcr.io/${{ github.repository }}:${{ github.sha }}'
          format: 'table'
          exit-code: '1'
          severity: 'CRITICAL,HIGH'
      
      # SARIF output (GitHub Security tab)
      - name: Run Trivy scanner (SARIF)
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'ghcr.io/${{ github.repository }}:${{ github.sha }}'
          format: 'sarif'
          output: 'trivy-results.sarif'
      
      - name: Upload scan results
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: 'trivy-results.sarif'
```

:::caution CHECKPOINT:
1. `--exit-code 1` ka kya matlab hai? CI/CD mein kyun use karte hain?
2. SARIF format kya hai? GitHub Security tab mein kaise dikhta hai?
3. Agar scan mein critical vulnerability aaye to kya karna chahiye?

:::

---

## Section 4: SBOM — Software Bill of Materials

:::tip CONCEPT: SBOM = Tumhare App Ka Ingredient List

SBOM batata hai tumhare app mein kaunsa library kaunsa version hai. Supply chain attack ke liye zaroori hai. Government compliance mein bhi zaroori hai.

:::

### Syft — SBOM Generator

```bash
# Install Syft
curl -sSfL https://raw.githubusercontent.com/anchore/syft/main/install.sh | sh -s -- -b /usr/local/bin

# Image SBOM generate karo
syft nginx:latest -o spdx-json > sbom-spdx.json
syft nginx:latest -o cyclonedx-json > sbom-cyclonedx.json

# Filesystem SBOM
syft dir:./myapp -o spdx-json > sbom.json

# SBOM dekho
syft nginx:latest -o table  # Human readable
```

### Grype — SBOM Scanner

```bash
# Install Grype
curl -sSfL https://raw.githubusercontent.com/anchore/grype/main/install.sh | sh -s -- -b /usr/local/bin

# SBOM scan karo
grype sbom:sbom-spdx.json

# Image directly scan
grype nginx:latest

# Fail on critical
grype nginx:latest --fail-on critical

# JSON output
grype nginx:latest -o json > grype-results.json
```

### GitHub Actions Integration

```yaml
# File: .github/workflows/sbom.yml
name: SBOM Generation

on: [push, pull_request]

jobs:
  sbom:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Build image
        run: docker build -t ghcr.io/${{ github.repository }}:${{ github.sha }} .
      
      # SBOM generate karo
      - name: Generate SBOM (SPDX)
        uses: anchore/sbom-action@v0
        with:
          image: ghcr.io/${{ github.repository }}:${{ github.sha }}
          format: spdx-json
          output-file: sbom.spdx.json
      
      # SBOM scan karo
      - name: Scan SBOM for vulnerabilities
        uses: anchore/scan-action@v3
        with:
          sbom: sbom.spdx.json
          fail-build: true
          severity-cutoff: high
      
      # Upload SBOM as artifact
      - name: Upload SBOM
        uses: actions/upload-artifact@v4
        with:
          name: sbom
          path: sbom.spdx.json
      
      # Upload to GitHub Security
      - name: Upload SBOM to GitHub
        uses: anchore/sbom-action@v0
        with:
          image: ghcr.io/${{ github.repository }}:${{ github.sha }}
          format: spdx-json
          upload-to-sarif: true
```

### SBOM in Compliance

```bash
# SOC2 compliance ke liye SBOM zaroori hai
# Har release ke liye SBOM generate karo
# Git mein commit karo
syft nexabook:v1.0 -o spdx-json > sbom-v1.0.json
git add sbom-v1.0.json
git commit -m "chore: SBOM for v1.0"

# Audit ke liye SBOM verify karo
grype sbom:sbom-v1.0.json --fail-on critical
```

:::caution CHECKPOINT:
1. SPDX aur CycloneDX format mein kya fark hai?
2. SBOM kyun zaroori hai? Supply chain attack kya hota hai?
3. Compliance (SOC2) mein SBOM kaise help karta hai?

:::

---

## Section 5: Policy-as-Code — Kyverno + OPA/Gatekeeper

:::tip CONCEPT: Policy = Rules for Your Cluster

Policy-as-Code = Kubernetes policies Git mein likho, version control karo, review karo.

:::

### Kyverno — Kubernetes-Native Policies

```bash
# Install Kyverno
kubectl create -f https://github.com/kyverno/kyverno/releases/download/v1.12.0/install.yaml

# Policies apply karo
kubectl apply -f require-resource-limits.yaml
kubectl apply -f block-unsigned-images.yaml

# Policies dekho
kubectl get clusterpolicies
kubectl get policies -A
```

### Policy 1: Resource Limits Required

```yaml
# File: require-resource-limits.yaml
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: require-resource-limits
spec:
  validationFailureAction: enforce  # block karega agar rule na mile
  background: false
  rules:
    - name: check-resource-limits
      match:
        any:
          - resources:
              kinds:
                - Pod
      validate:
        message: "Resource limits are required for all containers."
        pattern:
          spec:
            containers:
              - resources:
                  limits:
                    memory: "?*"
                    cpu: "?*"
```

### Policy 2: Block Latest Tag

```yaml
# File: block-latest-tag.yaml
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: block-latest-tag
spec:
  validationFailureAction: enforce
  rules:
    - name: disallow-latest
      match:
        any:
          - resources:
              kinds:
                - Pod
      validate:
        message: "Using 'latest' tag is not allowed."
        pattern:
          spec:
            containers:
              - image: "!*:latest"
```

### Policy 3: Require Labels

```yaml
# File: require-labels.yaml
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: require-labels
spec:
  validationFailureAction: enforce
  rules:
    - name: check-labels
      match:
        any:
          - resources:
              kinds:
                - Deployment
                - StatefulSet
      validate:
        message: "Labels 'app', 'version', and 'owner' are required."
        pattern:
          metadata:
            labels:
              app: "?*"
              version: "?*"
              owner: "?*"
```

### Policy 4: Image Signature Verification (Cosign)

```yaml
# File: require-signed-images.yaml
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: require-cosign-signature
spec:
  validationFailureAction: enforce
  rules:
    - name: verify-image-signature
      match:
        any:
          - resources:
              kinds:
                - Pod
      verifyImages:
        - imageReferences:
            - "ghcr.io/yourorg/*"
          attestors:
            - entries:
                - keys:
                    publicKeys: |-
                      -----BEGIN PUBLIC KEY-----
                      MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE...
                      -----END PUBLIC KEY-----
```

### OPA/Gatekeeper (Alternative)

```bash
# Install Gatekeeper
kubectl apply -f https://raw.githubusercontent.com/open-policy-agent/gatekeeper/v3.15.0/deploy/gatekeeper.yaml

# Constraint Template banao
cat > constraint-template.yaml << 'EOF'
apiVersion: templates.gatekeeper.sh/v1
kind: ConstraintTemplate
metadata:
  name: k8srequiredlabels
spec:
  crd:
    spec:
      names:
        kind: K8sRequiredLabels
      validation:
        openAPIV3Schema:
          type: object
          properties:
            labels:
              type: array
              items:
                type: string
  targets:
    - target: admission.k8s.gatekeeper.sh
      rego: |
        package k8srequiredlabels
        violation[{"msg": msg}] {
          provided := {label | input.review.object.metadata.labels[label]}
          required := {label | label := input.parameters.labels[_]}
          missing := required - provided
          count(missing) > 0
          msg := sprintf("Missing required labels: %v", [missing])
        }
EOF
kubectl apply -f constraint-template.yaml

# Constraint apply karo
cat > constraint.yaml << 'EOF'
apiVersion: constraints.gatekeeper.sh/v1beta1
kind: K8sRequiredLabels
metadata:
  name: require-app-label
spec:
  match:
    kinds:
      - apiGroups: [""]
        kinds: ["Pod"]
  parameters:
    labels: ["app", "owner"]
EOF
kubectl apply -f constraint.yaml
```

:::caution CHECKPOINT:
1. Kyverno aur OPA/Gatekeeper mein kya fark hai?
2. `validationFailureAction: enforce` vs `audit` mein kya fark hai?
3. Policy violation ho to kya hota hai? Pod reject hota hai ya warning milti hai?

:::

---

## Section 6: SAST/DAST — Code aur Runtime Scanning

:::tip CONCEPT: SAST = Code Scan Without Running (Static)

SonarQube tumhara code scan karta hai — bugs, vulnerabilities, code smells.

:::

```bash
# SonarQube Docker se run
docker run -d --name sonarqube -p 9000:9000 sonarqube:latest

# Default credentials: admin/admin
# Access: http://localhost:9000

# SonarQube Scanner install
# Linux
wget https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-5.0.1-linux.zip
unzip sonar-scanner-cli-5.0.1-linux.zip
export PATH=$PATH:./sonar-scanner-5.0.1-linux/bin

# Scan
sonar-scanner \
  -Dsonar.projectKey=nexabook \
  -Dsonar.sources=. \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.token=sqp_xxxxxxxxxxxx

# Python project
sonar-scanner \
  -Dsonar.projectKey=nexabook-api \
  -Dsonar.sources=./src \
  -Dsonar.tests=./tests \
  -Dsonar.python.coverage.reportPaths=coverage.xml \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.token=sqp_xxxxxxxxxxxx
```

### GitHub Actions Integration (SAST)

```yaml
# File: .github/workflows/sast.yml
name: SAST Scan

on: [push, pull_request]

jobs:
  sonarqube:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: SonarQube Scan
        uses: sonarsource/sonarqube-scan-action@master
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
          SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
        with:
          args: >
            -Dsonar.projectKey=nexabook
            -Dsonar.sources=.
            -Dsonar.qualitygate.wait=true
```

:::tip CONCEPT: DAST = Runtime Scan (Dynamic)

OWASP ZAP running application scan karta hai — actual HTTP requests bhejta hai.

:::

```bash
# Docker se run
# Baseline scan (quick, passive)
docker run -t owasp/zap2docker-stable zap-baseline.py \
    -t http://localhost:8080 \
    -r baseline-report.html

# Full scan (thorough, active)
docker run -t owasp/zap2docker-stable zap-full-scan.py \
    -t http://localhost:8080 \
    -r full-report.html

# API scan (OpenAPI spec se)
docker run -t owasp/zap2docker-stable zap-api-scan.py \
    -t http://localhost:8080/openapi.json \
    -f openapi \
    -r api-report.html
```

### GitHub Actions Integration (DAST)

```yaml
# File: .github/workflows/dast.yml
name: DAST Scan

on:
  workflow_run:
    workflows: ["Deploy to Staging"]
    types: [completed]

jobs:
  zap-scan:
    runs-on: ubuntu-latest
    steps:
      - name: ZAP Baseline Scan
        uses: zaproxy/action-baseline@v0.12.0
        with:
          target: ${{ secrets.STAGING_URL }}
          rules_file_name: '.zap/rules.tsv'
          cmd_options: '-a'
      
      - name: ZAP Full Scan
        uses: zaproxy/action-full-scan@v0.10.0
        with:
          target: ${{ secrets.STAGING_URL }}
```

:::caution CHECKPOINT:
1. SAST aur DAST mein kya fark hai? Kab kaunsa use karoge?
2. SonarQube Quality Gate kya hai?
3. ZAP baseline scan aur full scan mein kya fark hai?

:::

---

## Section 7: Supply Chain Security — Cosign + SLSA

:::tip CONCEPT: Supply Chain Attack = Tumhara Dependency Tumhe Attack Kare

SolarWinds, Log4Shell, xz-utils — ye sab supply chain attacks hain. Isliye:
- Images sign karo (Cosign)
- SBOM maintain karo
- Provenance track karo (SLSA)

:::

### Cosign — Image Signing

```bash
# Install Cosign
go install github.com/sigstore/cosign/v2/cmd/cosign@latest

# Key pair banao
cosign generate-key-pair
# cosign.private (private key — secret!)
# cosign.pub (public key — Git mein safe)

# Image sign karo
docker push ghcr.io/yourorg/nexabook:v1.0
cosign sign --key cosign.private ghcr.io/yourorg/nexabook:v1.0

# Verify karo
cosign verify --key cosign.pub ghcr.io/yourorg/nexabook:v1.0

# Keyless signing (Fulcio + Rekor — recommended)
cosign sign ghcr.io/yourorg/nexabook:v1.0
cosign verify ghcr.io/yourorg/nexabook:v1.0
```

### SLSA — Supply Chain Levels

```
SLSA Level 0: No guarantees
SLSA Level 1: Provenance (build metadata)
SLSA Level 2: Provenance + hosted build service
SLSA Level 3: Hardened builds + non-falsifiable provenance
SLSA Level 4: Hermetic builds + two-party review
```

```yaml
# GitHub Actions SLSA provenance
# File: .github/workflows/slsa.yml
name: Build with SLSA Provenance

on:
  push:
    tags: ['v*']

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Build image
        run: |
          docker build -t ghcr.io/${{ github.repository }}:${{ github.ref_name }} .
          docker push ghcr.io/${{ github.repository }}:${{ github.ref_name }}
      
      # SLSA provenance generate
      - name: Generate SLSA provenance
        uses: slsa-framework/slsa-github-generator/.github/workflows/generator_container_slsa3.yml@v2.0.0
        with:
          image: ghcr.io/${{ github.repository }}
          digest: ${{ steps.build.outputs.digest }}
          registry-username: ${{ github.actor }}
        env:
          REGISTRY_PASSWORD: ${{ secrets.GITHUB_TOKEN }}
```

:::note HANDS-ON: Sign and Verify

:::

```bash
# Step 1: Image build aur push
docker build -t ghcr.io/yourorg/nexabook:v1.0 .
docker push ghcr.io/yourorg/nexabook:v1.0

# Step 2: Keyless sign (Sigstore)
cosign sign ghcr.io/yourorg/nexabook:v1.0

# Step 3: Verify
cosign verify ghcr.io/yourorg/nexabook:v1.0

# Step 4: Kyverno policy — signed images only
kubectl apply -f require-signed-images.yaml

# Step 5: Test — unsigned image block hoga
kubectl run test --image=nginx
# Error: admission webhook denied the request

# Step 6: Signed image allow hogi
kubectl run test --image=ghcr.io/yourorg/nexabook:v1.0
# Pod created successfully
```

:::caution CHECKPOINT:
1. Cosign keyless signing kaise kaam karta hai?
2. SLSA Level 3 kya provide karta hai?
3. Supply chain attack se kaise bachoge?

:::

---

## Section 8: Secrets Management — HashiCorp Vault

:::tip CONCEPT: Vault = Centralized Secrets Store

Git mein secrets mat rakho. Vault mein rakho — dynamically generate hota hai, rotate hota hai, audit hota hai.

:::

### Vault Setup (Dev Mode)

```bash
# Docker se run
docker run -d --name vault -p 8200:8200 \
  -e VAULT_DEV_ROOT_TOKEN_ID=myroot \
  -e VAULT_DEV_LISTEN_ADDRESS=0.0.0.0:8200 \
  hashicorp/vault

# Access: http://localhost:8200
# Token: myroot
```

### Store Secrets

```bash
# KV secrets engine
vault kv put secret/nexabook/db password="supersecret" username="admin"

# Read secrets
vault kv get secret/nexabook/db
vault kv get -field=password secret/nexabook/db

# Dynamic database secrets
vault secrets enable database
vault write database/config/nexabook \
    plugin_name=postgresql-database-plugin \
    connection_url="postgresql://{{username}}:{{password}}@localhost:5432/nexabook" \
    allowed_roles="nexabook-role" \
    username="admin" \
    password="supersecret"

vault write database/roles/nexabook-role \
    db_name=nexabook \
    default_ttl="1h" \
    max_ttl="24h"
```

### Kubernetes Integration

```bash
# Enable Kubernetes auth
vault auth enable kubernetes
vault write auth/kubernetes/config \
    kubernetes_host="https://kubernetes.default.svc"

# Policy banao
vault policy write nexabook - <<EOF
path "secret/data/nexabook/*" {
  capabilities = ["read"]
}
EOF

# Role banao
vault write auth/kubernetes/role/nexabook \
    bound_service_account_names=nexabook \
    bound_service_account_namespaces=nexabook \
    policies=nexabook \
    ttl=1h
```

```yaml
# Pod mein Vault Agent sidecar
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nexabook
spec:
  template:
    metadata:
      annotations:
        vault.hashicorp.com/agent-inject: "true"
        vault.hashicorp.com/agent-inject-secret-db: "secret/nexabook/db"
        vault.hashicorp.com/agent-inject-template-db: |
          {{- with secret "secret/nexabook/db" -}}
          DATABASE_URL=postgresql://{{ .Data.data.username }}:{{ .Data.data.password }}@db:5432/nexabook
          {{- end -}}
        vault.hashicorp.com/role: "nexabook"
    spec:
      serviceAccountName: nexabook
      containers:
        - name: nexabook
          image: ghcr.io/yourorg/nexabook:v1.0
```

### GitHub Actions Integration

```yaml
# File: .github/workflows/secrets.yml
name: Fetch Secrets from Vault

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Import Secrets
        uses: hashicorp/vault-action@v3.0.0
        with:
          url: ${{ secrets.VAULT_ADDR }}
          token: ${{ secrets.VAULT_TOKEN }}
          secrets: |
            secret/data/nexabook/api KEY | API_KEY ;
            secret/data/nexabook/db PASSWORD | DB_PASSWORD
      
      - name: Use secrets
        run: |
          echo "API_KEY: ${{ env.API_KEY }}"
          # Deploy with secrets
```

:::caution CHECKPOINT:
1. Vault aur Kubernetes Secrets mein kya fark hai?
2. Dynamic secrets kya hain? Static secrets se kaise different hain?
3. Vault Agent sidecar kaise kaam karta hai?

:::

---

## Section 9: Compliance & Security Pipeline — Putting It All Together

:::tip CONCEPT: Complete DevSecOps Pipeline

:::

```yaml
# File: .github/workflows/devsecops.yml
name: DevSecOps Pipeline

on: [push, pull_request]

jobs:
  # Stage 1: Code Security
  secret-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: Gitleaks
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  sast:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: SonarQube
        uses: sonarsource/sonarqube-scan-action@master
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}

  # Stage 2: Build + Image Security
  build-scan:
    runs-on: ubuntu-latest
    needs: [secret-scan, sast]
    steps:
      - uses: actions/checkout@v4
      
      - name: Build image
        run: docker build -t ghcr.io/${{ github.repository }}:${{ github.sha }} .
      
      - name: Trivy scan
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'ghcr.io/${{ github.repository }}:${{ github.sha }}'
          exit-code: '1'
          severity: 'CRITICAL,HIGH'
      
      - name: Generate SBOM
        uses: anchore/sbom-action@v0
        with:
          image: ghcr.io/${{ github.repository }}:${{ github.sha }}
          format: spdx-json
          output-file: sbom.json
      
      - name: Sign image
        run: cosign sign --key env://COSIGN_PRIVATE_KEY ghcr.io/${{ github.repository }}:${{ github.sha }}
        env:
          COSIGN_PRIVATE_KEY: ${{ secrets.COSIGN_PRIVATE_KEY }}

  # Stage 3: Deploy (if all pass)
  deploy:
    runs-on: ubuntu-latest
    needs: [build-scan]
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy
        run: |
          # Kyverno policies enforce signed images
          kubectl apply -f k8s/
```

### Compliance Frameworks

```
SOC2:
- Access control (RBAC)
- Audit logging (Vault audit)
- Change management (Git history)
- Incident response (alerting)
- Data protection (encryption at rest)

ISO27001:
- Risk assessment
- Security policies
- Access control
- Cryptographic controls
- Operations security
- Incident management

PCI DSS (Islamic Banking):
- Network segmentation
- Access control
- Encryption
- Monitoring
- Vulnerability management
```

### Security Observability

```yaml
# Security events = Falco
# Falco detects runtime threats
kubectl apply -f https://raw.githubusercontent.com/falcosecurity/chaos-falco/master/deploy/falco.yaml

# Falco rules
- rule: Unexpected outbound connection
  desc: Detect unexpected outbound network connections
  condition: >
    outbound and
    container and
    not (container.image.repository in (trusted_repositories))
  output: >
    Unexpected outbound connection
    (command=%proc.cmdline connection=%fd.name container=%container.name)
  priority: WARNING
```

:::note HANDS-ON: Complete DevSecOps Pipeline

:::

```bash
# Step 1: Repository setup
mkdir -p .github/workflows .gitleaks .sast
git init

# Step 2: Pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
gitleaks detect --staged --verbose
if [ $? -ne 0 ]; then
    echo "ERROR: Secrets detected!"
    exit 1
fi
EOF
chmod +x .git/hooks/pre-commit

# Step 3: Create workflow files
# (copy from above sections)

# Step 4: Push and verify
git add .
git commit -m "feat: DevSecOps pipeline"
git push

# Step 5: Check GitHub Security tab
# - Gitleaks results
# - Trivy scan results
# - SonarQube quality gate
```

:::caution CHECKPOINT:
1. DevSecOps pipeline ke kaunse stages hain?
2. SOC2 compliance ke liye kaunsi security controls zaroori hain?
3. Falco kya hai? Runtime security mein kaise help karta hai?

:::

---

## Summary: Phase 10 Key Takeaways

| Concept | Tumne Kya Seekha |
|---------|-----------------|
| Secret Scanning | Gitleaks, pre-commit hooks, Git history scan |
| Image Scanning | Trivy, CI/CD integration, SARIF output |
| SBOM | Syft, Grype, SPDX/CycloneDX formats |
| Policy-as-Code | Kyverno + OPA/Gatekeeper |
| SAST/DAST | SonarQube + OWASP ZAP |
| Supply Chain | Cosign signing, SLSA provenance |
| Secrets Mgmt | HashiCorp Vault, dynamic secrets |
| Compliance | SOC2, ISO27001, PCI DSS basics |

---

## MINI-TASKS

### Task 1: Secret Scanning (15 min)
Gitleaks setup karo:
- Pre-commit hook banao
- Test file with fake secrets scan karo
- Verify karo ke commit block hota hai

### Task 2: Image Scanning (15 min)
Trivy se scan karo:
- Custom Docker image build karo
- Trivy scan karo
- CI/CD mein add karo

### Task 3: SBOM (10 min)
Syft se SBOM generate karo:
- NexaBook image ka SBOM
- Grype se verify karo
- Artifact ke taur pe upload karo

### Task 4: Kyverno Policy (15 min)
3 policies banao:
- Resource limits required
- Latest tag blocked
- Labels required
- Test karo — policy violation karo aur dekho ke block hota hai

### Task 5: Complete Pipeline (20 min)
DevSecOps pipeline banao:
- Secret scan + SAST + Image scan + SBOM
- GitHub Actions workflow
- Verify karo ke sab stages kaam kar rahe hain

---

## INCIDENT.md: Practice Scenarios

### Incident #1: Secret Leaked in Git History
- **Date:** (Practice Scenario)
- **What Broke:** API key Git mein commit ho gayi. GitHub notification aaya.
- **Root Cause:** .env file accidentally commit ho gaya. Developer ne .gitignore nahi kiya tha.
- **Fix:**
  ```bash
  # Step 1: Immediate response — API key rotate karo
  # AWS console -> IAM -> Access keys -> Deactivate old key
  # Create new key, update all services

  # Step 2: Git history se remove
  # Install git-filter-repo
  pip install git-filter-repo

  # Remove .env from all history
  git filter-repo --path .env --invert-paths

  # Force push
  git push origin --force --all

  # Step 3: Verify removal
  git log --all --oneline | head -20
  git log --all -p -- .env
  # Should return empty

  # Step 4: Add protection
  echo ".env" >> .gitignore
  echo "*.env" >> .gitignore
  echo "*secrets*" >> .gitignore

  # Step 5: Add pre-commit hook
  cat > .git/hooks/pre-commit << 'EOF'
  #!/bin/bash
  gitleaks detect --staged --verbose
  if [ $? -ne 0 ]; then
      echo "ERROR: Secrets detected! Commit blocked."
      exit 1
  fi
  EOF
  chmod +x .git/hooks/pre-commit

  # Step 6: Force push protected branches
  # GitHub -> Branch protection rules -> Require PR reviews
  ```
- **Prevention:** .gitignore + pre-commit hooks + git-secrets + branch protection rules
- **Learning:** Git history permanent hai. Sirf `git rm` se delete nahi hota. `filter-repo` use karo.

### Incident #2: Critical Vulnerability in Production Image
- **Date:** (Practice Scenario)
- **What Broke:** Trivy scan mein 47 CVEs mile. 5 Critical. Production mein vulnerable image hai.
- **Root Cause:** Base image outdated hai. `python:3.8` use ho raha hai jo deprecated hai.
- **Fix:**
  ```bash
  # Step 1: Vulnerability scan karo
  trivy image --severity CRITICAL python:3.8
  # CVE-2024-XXXX: Remote Code Execution

  # Step 2: Base image update karo
  # Dockerfile mein:
  # OLD: FROM python:3.8
  # NEW: FROM python:3.12-slim

  # Step 3: Dependencies update karo
  pip install --upgrade pip
  pip-audit  # Check for vulnerable packages
  pip install --upgrade -r requirements.txt

  # Step 4: Rebuild
  docker build -t ghcr.io/yourorg/nexabook:v2 .

  # Step 5: Rescan
  trivy image ghcr.io/yourorg/nexabook:v2
  # Critical CVEs should be gone

  # Step 6: Deploy
  kubectl set image deployment/nexabook nexabook=ghcr.io/yourorg/nexabook:v2

  # Step 7: Add to CI/CD pipeline
  # .github/workflows/ci.yml:
  # - name: Trivy scan
  #   uses: aquasecurity/trivy-action@master
  #   with:
  #     exit-code: '1'
  #     severity: 'CRITICAL'
  ```
- **Prevention:** Base image regularly update karo, Trivy scan CI/CD mein mandatory karo, Dependabot enable karo
- **Learning:** Vulnerable base image = sab kuch vulnerable. Slim images use karo, regularly update karo.

### Incident #3: Pod Rejected by Kyverno Policy
- **Date:** (Practice Scenario)
- **What Broke:** Deployment fail ho rahi hai. Pod create nahi ho raha. Kyverno policy block kar rahi hai.
- **Root Cause:** Kyverno policy "require-resource-limits" enabled hai. Developer ne resource limits nahi diye.
- **Fix:**
  ```bash
  # Step 1: Error dekho
  kubectl get events -n nexabook
  # "admission webhook denied the request: Resource limits are required"

  # Step 2: Policy check karo
  kubectl get clusterpolicies
  # require-resource-limits: enforce

  # Step 3: Policy violation details dekho
  kubectl get policyreport -A
  # Summary of violations

  # Step 4: Fix — resource limits add karo
  # deployment.yaml mein containers mein add karo:
  resources:
    limits:
      memory: "256Mi"
      cpu: "500m"
    requests:
      memory: "128Mi"
      cpu: "250m"

  # Step 5: Apply
  kubectl apply -f deployment.yaml

  # Step 6: Verify
  kubectl get pods -n nexabook
  # Pod create ho jayega

  # Step 7: Audit mode test
  # Agar policy audit mode mein hai to warning milegi, block nahi
  kubectl patch clusterpolicy require-resource-limits \
    -p '{"spec":{"validationFailureAction":"audit"}}'
  ```
- **Prevention:** Developer ko policies ke baare mein batao, resource limits template mein add karo, staging mein pehle test karo
- **Learning:** Policy-as-Code = rules enforced automatically. Violation = deployment blocked.

### Incident #4: Unsigned Image Blocked
- **Date:** (Practice Scenario)
- **What Broke:** Image push ho raha hai lekin pod create nahi ho raha. Kyverno policy "require-cosign-signature" block kar rahi hai.
- **Root Cause:** Image sign nahi ki gayi. Cosign signature missing hai.
- **Fix:**
  ```bash
  # Step 1: Error check
  kubectl describe pod nexabook -n nexabook
  # "admission webhook denied the request: image verification failed"

  # Step 2: Image verify karo
  cosign verify ghcr.io/yourorg/nexabook:v1.0
  # Error: no matching signatures

  # Step 3: Image sign karo
  cosign sign ghcr.io/yourorg/nexabook:v1.0

  # Step 4: Verify
  cosign verify ghcr.io/yourorg/nexabook:v1.0
  # Signature verified!

  # Step 5: Pod recreate
  kubectl delete pod nexabook -n nexabook
  # Deployment will recreate

  # Step 6: CI/CD mein sign add karo
  # .github/workflows/ci.yml:
  # - name: Sign image
  #   run: cosign sign ghcr.io/${{ github.repository }}:${{ github.sha }}
  ```
- **Prevention:** CI/CD mein image signing mandatory karo, Cosign key securely store karo (Vault ya GitHub Secrets)
- **Learning:** Unsigned image = untrusted. Production mein sirf signed images chalni chahiye.

### Incident #5: Compliance Audit Failed — No SBOM
- **Date:** (Practice Scenario)
- **What Broke:** SOC2 audit mein SBOM nahi mila. Compliance check fail.
- **Root Cause:** Pipeline mein SBOM generation add nahi tha.
- **Fix:**
  ```bash
  # Step 1: Current image ka SBOM generate karo
  syft ghcr.io/yourorg/nexabook:v1.0 -o spdx-json > sbom-v1.0.json

  # Step 2: SBOM scan karo
  grype sbom:sbom-v1.0.json --fail-on critical
  # No critical vulnerabilities found

  # Step 3: Git mein commit karo
  git add sbom-v1.0.json
  git commit -m "chore: SBOM for v1.0 (compliance)"
  git push

  # Step 4: Pipeline mein add karo
  # .github/workflows/ci.yml:
  # - name: Generate SBOM
  #   uses: anchore/sbom-action@v0
  #   with:
  #     image: ghcr.io/${{ github.repository }}:${{ github.sha }}
  #     format: spdx-json
  #     output-file: sbom.json

  # - name: Upload SBOM
  #   uses: actions/upload-artifact@v4
  #   with:
  #     name: sbom-${{ github.sha }}
  #     path: sbom.json

  # Step 5: Har release ke liye SBOM tag karo
  syft ghcr.io/yourorg/nexabook:v1.1 -o spdx-json > sbom-v1.1.json
  git tag -a v1.1-sbom -m "SBOM for v1.1"
  git push origin v1.1-sbom
  ```
- **Prevention:** CI/CD mein SBOM generation mandatory karo, har release ke liye SBOM archive karo, compliance dashboard setup karo
- **Learning:** SBOM = ingredient list. Compliance bodies (SOC2, ISO27001) require karti hain. Supply chain attack se bachata hai.
