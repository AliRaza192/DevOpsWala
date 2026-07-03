---
sidebar_position: 7
title: "PHASE 6: CI/CD — GitHub Actions + Azure DevOps"
description: "**Tumhara level:** Tum code likh rahe ho lekin manually deploy kar rahe ho. Is phase mein tum automation seekhoge — code"
---

# PHASE 6: CI/CD — GitHub Actions + Azure DevOps — TEACHING

> **Tumhara level:** Tum code likh rahe ho lekin manually deploy kar rahe ho. Is phase mein tum automation seekhoge — code push karo to automatically test, scan, build, aur deploy ho. Ye DevOps ki asli power hai. Tumhare Islamic Banking FTE aur NexaBook dono ke liye CI/CD = production readiness.

---

## Section 1: CI/CD Kya Hai? — The Big Picture

:::tip CONCEPT: CI = Continuous Integration, CD = Continuous Delivery/Deployment

**CI (Continuous Integration):**
- Tum code push karo -> automatically test ho
- Har commit pe quality check
- Bugs jaldi pakde jaate hain
- Merge conflicts jaldi solve hote hain

**CD (Continuous Delivery/Deploy):**
- Test pass ho -> automatically deploy ho
- Manual approval (Delivery) ya fully automatic (Deployment)

:::

```
Code Push -> Build -> Test -> Scan -> Deploy -> Monitor
   |         |       |       |        |        |
   |         |       |       |        |        +-- CloudWatch/Datadog
   |         |       |       |        +-- EC2/EKS/Lambda
   |         |       |       +-- Trivy/Snyk
   |         |       +-- pytest/jest
   |         +-- npm/maven/gradle
   +-- Git Push
```

**Real-world connection:** Tumhare NexaBook mein `git push origin main` karo to automatically:
1. Tests run ho
2. Docker image build ho
3. Image scan ho security ke liye
4. Staging pe deploy ho
5. Production pe approve ke baad deploy ho

:::caution CHECKPOINT:
1. CI aur CD mein kya fark hai? Agar sirf CI karo to kya hoga?
2. Continuous Delivery aur Continuous Deployment mein kya fark hai?
3. Tumhare Islamic Banking FTE ke liye kaunsa deployment strategy best hai aur kyun?

:::

---

## Section 2: GitHub Actions Deep Dive — The Global Standard

:::tip CONCEPT: GitHub Actions = Tumhara CI/CD Robot

GitHub Actions free hai (2000 min/month), powerful hai, aur almost sab kuch kar sakta hai.

:::

### Basic Workflow Structure

```yaml
# File: .github/workflows/ci.yml
name: CI Pipeline

# Kab chalega?
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

# Kya karega?
jobs:
  # Job 1: Test
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Run linter
        run: npm run lint

  # Job 2: Build
  build:
    needs: test  # Test pass hone ke baad
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Build Docker image
        run: docker build -t nexabook:${{ github.sha }} .
      
      - name: Save image
        run: docker save nexabook:${{ github.sha }} > image.tar
      
      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with:
          name: docker-image
          path: image.tar

  # Job 3: Security Scan
  scan:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'nexabook:${{ github.sha }}'
          format: 'table'
          exit-code: '1'
          severity: 'CRITICAL,HIGH'

  # Job 4: Deploy to Staging
  deploy-staging:
    needs: scan
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: staging
    steps:
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ap-south-1
      
      - name: Deploy to ECS
        run: |
          aws ecr get-login-password | docker login --username AWS --password-stdin ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.ap-south-1.amazonaws.com
          docker tag nexabook:${{ github.sha }} ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.ap-south-1.amazonaws.com/nexabook:${{ github.sha }}
          docker push ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.ap-south-1.amazonaws.com/nexabook:${{ github.sha }}
          aws ecs update-service --cluster nexabook --service nexabook-staging --force-new-deployment
```

:::tip CONCEPT: Triggers — Kab Chalega Pipeline

:::

```yaml
on:
  # Push pe
  push:
    branches: [main, develop]
    paths: ['src/**', 'tests/**']  # Sirf specific files change pe
    paths-ignore: ['README.md', 'docs/**']  # Ye files ignore
  
  # Pull Request pe
  pull_request:
    branches: [main]
  
  # Schedule pe (cron)
  schedule:
    - cron: '0 2 * * 1'  # Har Monday 2 AM
  
  # Manual trigger
  workflow_dispatch:
    inputs:
      environment:
        description: 'Deploy to environment'
        required: true
        default: 'staging'
        type: choice
        options:
          - staging
          - production
  
  # Doosre workflow ke baad
  workflow_run:
    workflows: ["CI Pipeline"]
    types: [completed]
    branches: [main]
  
  # Webhook events
  repository_dispatch:
    types: [deploy-command]
```

:::tip CONCEPT: Secrets Management — Passwords Kabhi Code Mein Mat Likho

:::

```bash
# GitHub Secrets mein add karo (Settings -> Secrets -> Actions)
# Ye values encrypt rehti hain aur logs mein nahi dikhti

# Workflow mein use karo
${{ secrets.AWS_ACCESS_KEY_ID }}
${{ secrets.AWS_SECRET_ACCESS_KEY }}
${{ secrets.DATABASE_URL }}
```

**NEVER:**
```yaml
# GALAT — secrets code mein mat likho!
env:
  DATABASE_URL: postgresql://user:password@host/db  # BAD
```

**ALWAYS:**
```yaml
# SAHI — GitHub Secrets se lo
env:
  DATABASE_URL: ${{ secrets.DATABASE_URL }}  # GOOD
```

```bash
# Secret leak ho jaye to:
# 1. Turant rotate karo (naya password banao)
# 2. GitHub Settings -> Secrets -> Delete old secret
# 3. Audit log dekho (Settings -> Security log)
# 4. `::add-mask::` use karo logs mein sensitive values ke liye
echo "::add-mask::${MY_SECRET}"
```

:::tip CONCEPT: Matrix Builds — Multiple Platforms Test Karo

:::

```yaml
jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node-version: [18, 20, 22]
      fail-fast: false  # Ek fail hone pe baaki na ruko
    
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
      - run: npm ci
      - run: npm test
```

:::tip CONCEPT: Caching — Pipeline Fast Karo

:::

```yaml
steps:
  - uses: actions/setup-node@v4
    with:
      node-version: '20'
      cache: 'npm'  # Automatic npm cache
  
  # Ya manually
  - uses: actions/cache@v4
    with:
      path: ~/.npm
      key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
      restore-keys: |
        ${{ runner.os }}-node-

  # Docker layer caching
  - uses: docker/build-push-action@v5
    with:
      context: .
      push: true
      cache-from: type=gha
      cache-to: type=gha,mode=max
```

:::caution CHECKPOINT:
1. `on: push` aur `on: pull_request` mein kya fark hai? Kab kaunsa use karoge?
2. `needs: test` ka kya matlab hai? Agar ye na lagao to kya hoga?
3. Matrix builds kyun use karte hain? Kab zaroori nahi hai?

:::

---

## Section 3: Advanced GitHub Actions — Reusable Workflows & Environments

:::tip CONCEPT: Reusable Workflows — DRY Principle for Pipelines

:::

```yaml
# File: .github/workflows/reusable-deploy.yml
name: Reusable Deploy

on:
  workflow_call:
    inputs:
      environment:
        required: true
        type: string
      image-tag:
        required: true
        type: string
    secrets:
      AWS_ACCESS_KEY_ID:
        required: true
      AWS_SECRET_ACCESS_KEY:
        required: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: ${{ inputs.environment }}
    steps:
      - name: Configure AWS
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ap-south-1
      
      - name: Deploy
        run: |
          aws ecr get-login-password | docker login --username AWS --password-stdin ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.ap-south-1.amazonaws.com
          docker pull ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.ap-south-1.amazonaws.com/nexabook:${{ inputs.image-tag }}
          aws ecs update-service --cluster nexabook --service nexabook-${{ inputs.environment }} --force-new-deployment

# File: .github/workflows/ci.yml (caller workflow)
jobs:
  deploy-staging:
    uses: ./.github/workflows/reusable-deploy.yml
    with:
      environment: staging
      image-tag: ${{ github.sha }}
    secrets:
      AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
      AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

:::tip CONCEPT: Environment Protection Rules

:::

```yaml
# GitHub Settings -> Environments -> production
# Configure:
# - Required reviewers (manual approval)
# - Wait timer (15 min delay)
# - Deployment branches (sirf main)
# - Secrets (environment-specific)

jobs:
  deploy-production:
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://nexabook.com
    steps:
      - name: Deploy
        run: echo "Deploying to production..."
    # Environment protection rules automatically apply
    # - Required reviewers ko notification jayega
    # - Wait timer ke baad deploy hoga
```

:::tip CONCEPT: Job Outputs — Jobs Ke Beech Data Share Karo

:::

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    outputs:
      image-tag: ${{ steps.meta.outputs.tags }}
      version: ${{ steps.version.outputs.version }}
    steps:
      - id: version
        run: echo "version=$(date +%Y%m%d)-${GITHUB_SHA::7}" >> $GITHUB_OUTPUT
      - id: meta
        uses: docker/metadata-action@v5
        with:
          images: nexabook
          tags: type=sha

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - run: echo "Deploying ${{ needs.build.outputs.image-tag }}"
```

:::caution CHECKPOINT:
1. Reusable workflows aur composite actions mein kya fark hai?
2. Environment protection rules kyun zaroori hain? (Hint: production safety)
3. Job outputs kaise kaam karte hain?

:::

---

## Section 4: Azure DevOps Pipelines — Gulf Market Ke Liye

:::tip CONCEPT: Azure DevOps = Microsoft Ka CI/CD Platform

Azure DevOps Gulf countries mein bahut use hota hai. Jenkins ka replacement hai.

:::

```yaml
# File: azure-pipelines.yml
trigger:
  branches:
    include:
      - main
      - develop
  paths:
    include:
      - src/**

pool:
  vmImage: 'ubuntu-latest'

variables:
  buildConfiguration: 'Release'
  dockerRegistry: 'nexabookregistry.azurecr.io'

stages:
  # Stage 1: Build
  - stage: Build
    jobs:
      - job: BuildJob
        steps:
          - task: NodeTool@0
            inputs:
              versionSpec: '20.x'
            displayName: 'Install Node.js'
          
          - script: |
              npm ci
              npm run build
            displayName: 'Build'
          
          - task: PublishBuildArtifacts@1
            inputs:
              pathToPublish: '$(Build.ArtifactStagingDirectory)'

  # Stage 2: Test
  - stage: Test
    dependsOn: Build
    jobs:
      - job: UnitTests
        steps:
          - script: npm test
            displayName: 'Unit Tests'
          - task: PublishTestResults@2
            inputs:
              testResultsFormat: 'JUnit'
              testResultsFiles: 'test-results.xml'
      
      - job: IntegrationTests
        services:
          postgres:
            image: postgres:16
            env:
              POSTGRES_PASSWORD: test
            ports:
              - 5432:5432
        steps:
          - script: npm run test:integration
            env:
              DATABASE_URL: postgresql://postgres:test@localhost:5432/test

  # Stage 3: Security Scan
  - stage: SecurityScan
    dependsOn: Test
    jobs:
      - job: TrivyScan
        steps:
          - script: |
              docker build -t nexabook:$(Build.BuildId) .
              trivy image --exit-code 1 --severity HIGH,CRITICAL nexabook:$(Build.BuildId)
            displayName: 'Container Scan'

  # Stage 4: Deploy
  - stage: Deploy
    dependsOn: SecurityScan
    condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/main'))
    jobs:
      - deployment: DeployStaging
        environment: 'staging'
        strategy:
          runOnce:
            deploy:
              steps:
                - task: AzureWebAppContainer@1
                  inputs:
                    azureSubscription: 'Azure-Connection'
                    appName: 'nexabook-staging'
                    containers: 'nexabook:$(Build.BuildId)'

      - deployment: DeployProduction
        dependsOn: DeployStaging
        environment: 'production'
        strategy:
          runOnce:
            deploy:
              steps:
                - task: AzureWebAppContainer@1
                  inputs:
                    azureSubscription: 'Azure-Connection'
                    appName: 'nexabook-prod'
                    containers: 'nexabook:$(Build.BuildId)'
```

### GitHub Actions vs Azure DevOps

| Feature | GitHub Actions | Azure DevOps |
|---------|---------------|--------------|
| Price | Free (2000 min/month) | Free (1800 min/month) |
| YAML | Yes | Yes |
| Marketplace | Huge | Good |
| Azure Integration | Good | Excellent |
| Enterprise | Good | Excellent |
| Gulf Market | Good | Excellent |
| Self-hosted Runners | Yes | Yes (agents) |
| Artifacts | Packages | Packages + Build Artifacts |

:::caution CHECKPOINT:
1. Azure DevOps stages aur GitHub Actions jobs mein kya fark hai?
2. Azure DevOps deployment jobs mein `strategy: runOnce` kya karta hai?
3. Gulf market mein Azure DevOps kyun preferred hai?

:::

---

## Section 5: Deployment Strategies — Kab Kya Karo

:::tip CONCEPT: Deployment = Kaise Update Karo Production

:::

### Rolling Update (Default)
```
v1 v1 v1 v1  ->  v1 v1 v1 v2  ->  v1 v1 v2 v2  ->  v1 v2 v2 v2  ->  v2 v2 v2 v2
```
- Gradual update, zero downtime
- Rollback slow (dubara same process)
- Best for: Regular updates, stateless apps

### Blue-Green
```
Blue (v1)  <--- Traffic
Green (v2) <--- Deploy here first

# Test green
# Switch traffic to green
# Blue becomes new staging
```
- Instant rollback (switch back to blue)
- 2x resources needed
- Best for: Critical apps, zero-downtime requirement

### Canary
```
v1 v1 v1 v1  <--- 90% traffic
v2           <--- 10% traffic (canary)
```
- Test with small percentage
- Gradually increase based on metrics
- Best for: Risk-averse teams, large user base

:::note HANDS-ON: Blue-Green with GitHub Actions

:::

```yaml
deploy-blue-green:
  runs-on: ubuntu-latest
  environment: production
  steps:
    - name: Deploy to Green
      run: |
        # Green environment update
        kubectl set image deployment/nexabook-green nexabook=nexabook:${{ github.sha }}
        kubectl rollout status deployment/nexabook-green
    
    - name: Test Green
      run: |
        # Health check green pe
        for i in $(seq 1 10); do
          if curl -f http://green.nexabook.com/health; then
            echo "Green healthy"
          else
            echo "Green unhealthy"
            exit 1
          fi
          sleep 5
        done
    
    - name: Switch Traffic to Green
      run: |
        # Load balancer pe traffic switch
        kubectl patch service nexabook -p '{"spec":{"selector":{"version":"green"}}}'
    
    - name: Cleanup Blue
      run: |
        # Blue ko naya green banao
        kubectl set image deployment/nexabook-blue nexabook=nexabook:${{ github.sha }}
```

:::caution CHECKPOINT:
1. Rolling update aur blue-green mein kya fark hai? Kab kaunsa use karoge?
2. Canary deployment mein traffic percentage kaise decide karte hain?
3. Agar green deployment fail ho jaye to kya karna chahiye?

:::

---

## Section 6: Pipeline Security — Production Critical

:::tip CONCEPT: CI/CD = Tumhara Weakest Link (Agar Secure Nahi Hai)

:::

```yaml
# OIDC Authentication — Passwords ki zaroorat nahi
jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      id-token: write   # OIDC ke liye
      contents: read
      packages: write
    
    steps:
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789012:role/GitHubActionsRole
          aws-region: ap-south-1
        # No access keys needed! OIDC se authenticate hota hai
```

:::tip CONCEPT: Pipeline Security Checklist

:::

```yaml
# 1. Least privilege permissions
permissions:
  contents: read
  packages: write
  # Mat do: contents: write, actions: write (sirf jab zaroori ho)

# 2. Pin action versions (supply chain attack se bachao)
- uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11  # v4.1.1
  # NOT: actions/checkout@v4  # Tag change ho sakta hai

# 3. Secret scanning
- uses: trufflesecurity/trufflehog@main
  with:
    extra_args: --only-verified

# 4. Dependency scanning
- uses: github/codeql-action/analyze@v3
  with:
    languages: javascript

# 5. Container signing (Cosign)
- uses: sigstore/cosign-installer@v3
- run: cosign sign ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}@${{ steps.build.outputs.digest }}
```

:::note HANDS-ON: Secure Pipeline

:::

```yaml
name: Secure CI/CD

on:
  push:
    branches: [main]

permissions:
  contents: read
  packages: write
  security-events: write

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Secret scanning
        uses: trufflesecurity/trufflehog@main
        with:
          extra_args: --only-verified
      
      - name: SAST scan
        uses: github/codeql-action/analyze@v3
        with:
          languages: javascript
      
      - name: Dependency scan
        run: npm audit --audit-level=high

  container-scan:
    runs-on: ubuntu-latest
    needs: security-scan
    steps:
      - uses: actions/checkout@v4
      - uses: docker/build-push-action@v5
        with:
          context: .
          push: false
          load: true
          tags: nexabook:test
      
      - uses: aquasecurity/trivy-action@master
        with:
          image-ref: nexabook:test
          format: 'sarif'
          output: 'trivy-results.sarif'
          severity: 'CRITICAL,HIGH'
      
      - uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: 'trivy-results.sarif'
```

:::caution CHECKPOINT:
1. OIDC authentication kaise kaam karta hai? Access keys se kyun better hai?
2. Action versions ko kyun pin karna chahiye? (Hint: supply chain attack)

:::

---

## Section 7: Jenkins — Awareness Level

:::tip CONCEPT: Jenkins = Purana But Still Alive

Jenkins 2026 mein bhi bahut companies mein hai. Tumhe sirf pata hona chahiye.

:::

```groovy
// Jenkinsfile (Declarative Pipeline)
pipeline {
    agent any
    
    stages {
        stage('Build') {
            steps {
                sh 'npm ci'
                sh 'npm run build'
            }
        }
        stage('Test') {
            steps {
                sh 'npm test'
            }
        }
        stage('Security Scan') {
            steps {
                sh 'trivy image nexabook:latest'
            }
        }
        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                sh 'docker build -t nexabook .'
                sh 'docker push nexabook:latest'
            }
        }
    }
    post {
        failure {
            mail to: 'team@nexabook.com',
                 subject: "Build Failed: ${currentBuild.fullDisplayName}",
                 body: "Check: ${env.BUILD_URL}"
        }
        success {
            slackSend channel: '#deploys',
                      message: "Deployed: ${currentBuild.fullDisplayName}"
        }
    }
}
```

**Jenkins vs GitHub Actions:**
- Jenkins: Self-hosted, complex setup, Groovy-based, plugin-dependent
- GitHub Actions: Cloud-hosted, simple YAML, free tier, built-in marketplace
- **Recommendation:** GitHub Actions use karo unless company Jenkins use karti hai

---

## Section 8: Pipeline Best Practices — Production Ready

:::tip CONCEPT: Pipeline = Tumhari Quality Gate

:::

```yaml
# Complete CI/CD Pipeline
name: Production Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  # Job 1: Code Quality
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run linter
        run: npm run lint
      - name: Run type check
        run: npm run typecheck
      - name: Run formatter check
        run: npm run format:check

  # Job 2: Unit Tests
  test-unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:unit
      - name: Upload coverage
        uses: actions/upload-artifact@v4
        with:
          name: coverage
          path: coverage/

  # Job 3: Integration Tests
  test-integration:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/test

  # Job 4: Build & Push
  build:
    needs: [quality, test-unit, test-integration]
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4
      
      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=sha,prefix=
      
      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  # Job 5: Security Scan
  scan:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Run Trivy scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}
          format: 'sarif'
          output: 'trivy-results.sarif'
          severity: 'CRITICAL,HIGH'
      
      - name: Upload scan results
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: 'trivy-results.sarif'

  # Job 6: Deploy to Staging
  deploy-staging:
    needs: scan
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: staging
    steps:
      - name: Deploy to staging
        run: echo "Deploying to staging..."

  # Job 7: Deploy to Production
  deploy-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment:
      name: production
      url: https://nexabook.com
    steps:
      - name: Deploy to production
        run: echo "Deploying to production..."
```

:::caution CHECKPOINT:
1. `environment: staging` aur `environment: production` ka kya fark hai?
2. Agar security scan fail ho jaye to pipeline kya karega?
3. Integration tests ke liye `services` kya hai? Kubernetes pods hain kya?

:::

---

## Section 9: Rollback & Monitoring — Pipeline Ko Health Mein Rakho

:::tip CONCEPT: Rollback = Jab Deploy Galat Ho Jaye

:::

```yaml
# Automatic rollback on failure
deploy-production:
  runs-on: ubuntu-latest
  environment: production
  steps:
    - name: Deploy
      id: deploy
      run: |
        # Current version save karo
        PREVIOUS=$(kubectl get deployment nexabook -o jsonpath='{.spec.template.spec.containers[0].image}')
        echo "previous_version=$PREVIOUS" >> $GITHUB_OUTPUT
        
        # New version deploy karo
        kubectl set image deployment/nexabook nexabook=nexabook:${{ github.sha }}
        kubectl rollout status deployment/nexabook --timeout=300s
    
    - name: Health Check
      id: health
      run: |
        sleep 30
        if curl -f https://nexabook.com/health; then
          echo "healthy=true" >> $GITHUB_OUTPUT
        else
          echo "healthy=false" >> $GITHUB_OUTPUT
        fi
    
    - name: Rollback on Failure
      if: steps.health.outputs.healthy == 'false'
      run: |
        echo "Health check failed — rolling back!"
        kubectl rollout undo deployment/nexabook
        kubectl rollout status deployment/nexabook
        exit 1
```

:::tip CONCEPT: Pipeline Monitoring

:::

```yaml
# Slack notification
notify:
  needs: [deploy-staging, deploy-production]
  if: always()
  runs-on: ubuntu-latest
  steps:
    - name: Notify Slack
      uses: slackapi/slack-github-action@v1
      with:
        payload: |
          {
            "text": "Pipeline ${{ needs.deploy-staging.result == 'success' && '✅' || '❌' }} on ${{ github.repository }}",
            "blocks": [
              {
                "type": "section",
                "text": {
                  "type": "mrkdwn",
                  "text": "*${{ github.workflow }}*\nResult: ${{ needs.deploy-staging.result }}\nBranch: ${{ github.ref_name }}\nCommit: ${{ github.sha }}"
                }
              }
            ]
          }
      env:
        SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

:::note HANDS-ON: Complete Pipeline with Rollback

:::

```yaml
name: Full CI/CD with Rollback

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm test

  build:
    needs: test
    runs-on: ubuntu-latest
    outputs:
      image-tag: ${{ steps.meta.outputs.tags }}
    steps:
      - uses: actions/checkout@v4
      - id: meta
        uses: docker/metadata-action@v5
        with:
          images: ghcr.io/${{ github.repository }}
          tags: type=sha
      - uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}

  scan:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: aquasecurity/trivy-action@master
        with:
          image-ref: ${{ needs.build.outputs.image-tag }}
          severity: CRITICAL,HIGH
          exit-code: 1

  deploy:
    needs: scan
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Save current version
        run: |
          PREVIOUS=$(kubectl get deploy nexabook -o jsonpath='{.spec.template.spec.containers[0].image}')
          echo "PREVIOUS=$PREVIOUS" >> $GITHUB_ENV
      
      - name: Deploy new version
        run: |
          kubectl set image deploy nexabook nexabook=${{ needs.build.outputs.image-tag }}
          kubectl rollout status deploy nexabook --timeout=300s
      
      - name: Health check
        id: health
        run: |
          sleep 30
          curl -f https://nexabook.com/health || echo "healthy=false" >> $GITHUB_OUTPUT
      
      - name: Rollback if unhealthy
        if: steps.health.outputs.healthy == 'false'
        run: |
          kubectl rollout undo deploy nexabook
          echo "Rolled back to $PREVIOUS"
      
      - name: Notify
        if: always()
        run: |
          echo "Deploy result: ${{ steps.health.outcome }}"
```

:::caution CHECKPOINT:
1. Automatic rollback kaise kaam karta hai? Kab manually rollback karna padta hai?
2. Pipeline monitoring ke liye kya kya track karna chahiye?

:::

---

## Summary: Phase 6 Key Takeaways

| Concept | Tumne Kya Seekha |
|---------|-----------------|
| CI/CD | Code push -> auto test -> auto deploy |
| GitHub Actions | YAML workflows, secrets, matrix builds, caching, reusable workflows |
| Azure DevOps | Stages, jobs, deployment groups, variables |
| Deployment | Rolling, Blue-Green, Canary |
| Security | OIDC, secret scanning, container scanning, action pinning |
| Rollback | Automatic rollback on health check failure |
| Best Practices | Quality gates, staged deployments, monitoring |

---

## MINI-TASKS

### Task 1: GitHub Actions Pipeline (20 min)
NexaBook ke liye CI/CD pipeline banao:
- Test job (npm test)
- Build job (Docker image)
- Scan job (Trivy)
- Deploy to staging

### Task 2: Matrix Build (10 min)
Pipeline banao jo 3 OS pe test kare:
- ubuntu-latest
- windows-latest
- macos-latest

### Task 3: Reusable Workflow (15 min)
Deploy workflow banao jo:
- workflow_call accept kare
- environment parameter le
- secrets accept kare

### Task 4: Rollback Pipeline (15 min)
Pipeline banao jo:
- Health check kare deploy ke baad
- Fail ho to automatic rollback kare
- Slack notification bheje

---

## INCIDENT.md: Practice Scenarios

### Incident #1: Pipeline Fails — Test Error
- **What Broke:** GitHub Actions workflow test step pe fail
- **Root Cause:** Missing environment variable in test
- **Fix:**
  ```bash
  # Step 1: Pipeline logs dekho
  # GitHub repo -> Actions -> Failed run -> Expand failed job
  
  # Step 2: Error identify karo
  # Common: "DATABASE_URL is not defined"
  
  # Step 3: Workflow file mein env vars add karo
  # .github/workflows/ci.yml mein:
  # jobs:
  #   test:
  #     env:
  #       NODE_ENV: test
  #       DATABASE_URL: postgresql://localhost/test
  
  # Step 4: Ya GitHub Secrets se lo
  # Settings -> Secrets -> Actions -> New repository secret
  # Name: DATABASE_URL
  # Value: postgresql://localhost/test
  
  # Step 5: Local pe test karo
  DATABASE_URL=postgresql://localhost/test npm test
  
  # Step 6: Push karo aur verify karo
  git add .github/workflows/ci.yml
  git commit -m "fix: add test env vars"
  git push
  ```
- **Prevention:** Tests ko locally bhi chalao push karne se pehle, `.env.test` use karo
- **Learning:** Pipeline mein env vars explicitly define karo, local `.env` file automatically load nahi hoti

### Incident #2: Docker Build Fails — Cache Issue
- **What Broke:** Docker build bahut slow hai ya cache miss ho raha hai
- **Root Cause:** Dockerfile mein COPY . . pehle hai, changes har baar poori rebuild trigger karte hain
- **Fix:**
  ```bash
  # Step 1: Dockerfile check karo — layer ordering
  # Galat:
  # COPY . .
  # RUN npm install
  
  # Sahi:
  # COPY package*.json ./
  # RUN npm install
  # COPY . .
  
  # Step 2: GitHub Actions mein Docker layer caching enable karo
  # .github/workflows/ci.yml mein:
  # - uses: docker/build-push-action@v5
  #   with:
  #     context: .
  #     push: true
  #     cache-from: type=gha
  #     cache-to: type=gha,mode=max
  
  # Step 3: .dockerignore check karo
  # node_modules, .git, .env files exclude karo
  
  # Step 4: Build test karo locally
  docker build -t nexabook:test .
  # Doosri baar fast hona chahiye (cache hit)
  
  # Step 5: Cache clear karo agar corrupt hai
  docker builder prune -a
  ```
- **Prevention:** Dockerfile mein dependency layer pehle rakho, `.dockerignore` lagao, GitHub Actions cache use karo
- **Learning:** Docker layer cache = pipeline speed. Sahi layer ordering se 10x fast hota hai

### Incident #3: Secret Leaked in Logs
- **What Broke:** Database password logs mein dikha, security alert aaya
- **Root Cause:** `echo $DATABASE_URL` command ya logs mein sensitive data print hua
- **Fix:**
  ```bash
  # Step 1: Turant password rotate karo
  # Database password badlo
  # AWS: aws iam update-access-key --access-key-id AKIA... --status Inactive
  
  # Step 2: GitHub Actions logs check karo
  # Repo -> Actions -> Jo run tha -> Logs mein password dhundho
  
  # Step 3: GitHub Settings -> Security log
  # Dekho kaunse secrets kab access hue
  
  # Step 4: Secret masking add karo workflow mein
  # echo "::add-mask::${MY_SECRET}"
  # echo "Secret value: ${MY_SECRET}"
  # Output mein asterisk dikhega
  
  # Step 5: Workflow fix karo
  # GALAT:
  # - run: echo "DB URL: $DATABASE_URL"
  # SAHI:
  # - run: echo "DB configured"
  #   env:
  #     DATABASE_URL: ${{ secrets.DATABASE_URL }}
  
  # Step 6: Secret scanning enable karo
  # Repo -> Settings -> Security -> Secret scanning -> Enable
  ```
- **Prevention:** Hamesha `::add-mask::` use karo, secret scanning enable karo, logs mein kabhi secrets print mat karo
- **Learning:** GitHub automatically secrets ko mask karta hai lekin env vars direct echo karne se leak ho sakte hain

### Incident #4: Deployment Fails — Permission Denied
- **What Broke:** Deploy step pe `AccessDenied` error
- **Root Cause:** IAM role ya service connection properly configured nahi
- **Fix:**
  ```bash
  # Step 1: AWS credentials check karo
  # GitHub Secrets mein:
  # AWS_ACCESS_KEY_ID
  # AWS_SECRET_ACCESS_KEY
  # Verify: Settings -> Secrets -> Actions
  
  # Step 2: IAM permissions check karo
  aws sts get-caller-identity
  # Galat user ya role dikhega to fix karo
  
  # Step 3: IAM policy check karo
  aws iam simulate-principal-policy \
    --policy-source-arn arn:aws:iam::123456789012:user/github-actions \
    --action-names ecr:GetAuthorizationToken ecr:PutImage ecs:UpdateService
  
  # Step 4: Missing permissions add karo
  aws iam put-user-policy \
    --user-name github-actions \
    --policy-name DeployPolicy \
    --policy-document '{
      "Version": "2012-10-17",
      "Statement": [
        {
          "Effect": "Allow",
          "Action": [
            "ecr:GetAuthorizationToken",
            "ecr:BatchCheckLayerAvailability",
            "ecr:PutImage",
            "ecr:InitiateLayerUpload",
            "ecr:UploadLayerPart",
            "ecr:CompleteLayerUpload",
            "ecs:UpdateService",
            "ecs:DescribeServices"
          ],
          "Resource": "*"
        }
      ]
    }'
  
  # Step 5: OIDC use karo (recommended — no static credentials)
  # GitHub repo -> Settings -> OIDC -> Add provider
  # IAM role banao with GitHub OIDC trust policy
  ```
- **Prevention:** OIDC use karo (no static keys), IAM permissions properly configure karo, least privilege principle
- **Learning:** CI/CD permissions = most common deployment failure. OIDC is the modern, secure approach

### Incident #5: Pipeline Runs but Deploy Doesn't Happen
- **What Broke:** Pipeline green hai lekin production pe koi change nahi aaya
- **Root Cause:** Condition check fail ho raha hai ya environment protection rules pending hain
- **Fix:**
  ```bash
  # Step 1: Workflow condition check karo
  # if: github.ref == 'refs/heads/main'
  # Agar develop branch pe push kiya hai to deploy nahi hoga
  
  # Step 2: Environment protection rules dekho
  # GitHub -> Settings -> Environments -> production
  # Required reviewers pending hain?
  # Wait timer active hai?
  
  # Step 3: Deploy job logs expand karo
  # "Skipped" ya "Condition not met" dikhega
  
  # Step 4: Manual deploy karo agar zaroori ho
  # GitHub -> Actions -> Workflow run -> Deploy job -> Re-run jobs
  
  # Step 5: Ya workflow_dispatch se manually trigger karo
  # GitHub -> Actions -> Select workflow -> Run workflow
  
  # Step 6: Verify deployment
  kubectl get pods
  kubectl rollout status deployment/nexabook
  curl https://nexabook.com/health
  ```
- **Prevention:** Branch protection rules check karo, environment protection rules samjho, manual trigger option rakho
- **Learning:** "Pipeline green but no deploy" = most common confusion. Condition checks aur protection rules samjho
