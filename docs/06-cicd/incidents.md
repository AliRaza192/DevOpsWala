---
sidebar_position: 8
title: "Phase 6: Incident Log"
description: "Real-world incident scenarios for Phase 6"
---

# INCIDENT LOG — Phase: CI/CD (GitHub Actions + Azure DevOps)

---

## Incident #1: Pipeline Fails — Test Error
- **Date:** (Practice Scenario)
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

---

## Incident #2: Docker Build Fails — Cache Issue
- **Date:** (Practice Scenario)
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

---

## Incident #3: Secret Leaked in Logs
- **Date:** (Practice Scenario)
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

---

## Incident #4: Deployment Fails — Permission Denied
- **Date:** (Practice Scenario)
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

---

## Incident #5: Pipeline Runs but Deploy Doesn't Happen
- **Date:** (Practice Scenario)
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
