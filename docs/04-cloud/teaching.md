---
sidebar_position: 5
title: "PHASE 4: Cloud Fundamentals — AWS + Azure + GCP"
description: "**Tumhara level:** Tum already servers pe kaam kar rahe ho. Is phase mein tum cloud ki duniya mein enter karoge — AWS (p"
---

# PHASE 4: Cloud Fundamentals — AWS + Azure + GCP — TEACHING

> **Tumhara level:** Tum already servers pe kaam kar rahe ho. Is phase mein tum cloud ki duniya mein enter karoge — AWS (primary), Azure (Gulf jobs ke liye zaroori), aur GCP (awareness). Cloud = tumhara infrastructure on rent. Ye phase tumhare Islamic Banking FTE aur NexaBook dono ke liye critical hai — production deployment, scaling, aur cost management sab yahan se start hota hai.

---

## Section 1: Cloud Kya Hai? — The Big Picture

:::tip CONCEPT: Cloud = Computer on Rent

Pehle tumhe server kharidna padta tha (physical machine, data center). Ab cloud pe rent pe le sakte ho — jab chaho band karo.

**3 Types:**
- **IaaS (Infrastructure as a Service)** — Tumhe machine milti hai (EC2, VMs). Tum OS, runtime, apps sab manage karte ho.
- **PaaS (Platform as a Service)** — Tumhe platform milta hai (Heroku, App Engine). Sirf code likho, baaki platform sambhalta hai.
- **SaaS (Software as a Service)** — Tumhe software milta hai (Gmail, Slack). Kuch manage nahi karna.

**Tumhara use case:**
- NexaBook frontend → Vercel (SaaS/PaaS)
- Islamic Banking FTE → AWS EC2/EKS (IaaS)
- Monitoring → CloudWatch/Azure Monitor (SaaS)
- Database → RDS/Azure SQL (PaaS)

**Cloud Providers:**
- **AWS** — globally sabse zyada market share, US/Europe/Remote jobs ke liye primary
- **Azure** — Gulf (UAE, Saudi) aur enterprise companies mein dominant
- **GCP** — kam demand lekin AI/ML-heavy companies mein use hota hai

### HANDS-ON: Free Tier Explore Karo

:::

```bash
# AWS Free Tier check karo
# https://aws.amazon.com/free/ — 12 months free tier + always free

# Azure Free Tier
# https://azure.microsoft.com/en-us/pricing/free-services/ — $200 credit + always free

# GCP Free Tier
# https://cloud.google.com/free — $300 credit for 90 days
```

:::caution CHECKPOINT:
1. Agar tum AWS EC2 pe NexaBook chalate ho, to ye IaaS hai ya PaaS? Kyun?
2. Serverless (Lambda) vs EC2 — kab kaunsa use karoge? (Hint: request pattern dekho)
3. Tumhare Islamic Banking FTE ke liye kaunsa cloud best hai aur kyun? (Gulf market context mein socho)

:::

---

## Section 2: AWS Core Services — The Big 6

:::tip CONCEPT: AWS Services = Tumhara Toolbox

AWS mein 200+ services hain. Tumhe sirf 6 core services chahiye — baaki sab inke variations hain.

:::

### IAM (Identity & Access Management) — Security First

```bash
# AWS CLI install karo
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip && sudo ./aws/install

# Configure
aws configure
# Access Key ID: xxx
# Secret Access Key: xxx
# Default region: ap-south-1
# Default output format: json

# Verify configuration
aws sts get-caller-identity
# Output: { "Account": "123456789012", "Arn": "arn:aws:iam::123456789012:user/ali" }

# IAM users/roles
aws iam list-users
aws iam create-user --user-name ali-devops
aws iam create-access-key --user-name ali-devops

# Least-privilege policy — sirf zaroori permissions
cat > policy.json << 'EOF'
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ec2:Describe*",
                "s3:GetObject",
                "s3:PutObject",
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ],
            "Resource": "*"
        }
    ]
}
EOF

aws iam put-user-policy \
    --user-name ali-devops \
    --policy-name DevOpsPolicy \
    --policy-document file://policy.json

# IAM Roles — EC2 ke liye (access keys rakhne ki zaroorat nahi)
aws iam create-role \
    --role-name EC2SSMRole \
    --assume-role-policy-document '{
        "Version": "2012-10-17",
        "Statement": [{
            "Effect": "Allow",
            "Principal": {"Service": "ec2.amazonaws.com"},
            "Action": "sts:AssumeRole"
        }]
    }'

aws iam attach-role-policy \
    --role-name EC2SSMRole \
    --policy-arn arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore
```

**Real-world connection:** Tumhare Islamic Banking FTE ke liye alag IAM roles banao — ek developer role (limited access), ek deployment role (EC2 + S3 access), aur ek monitoring role (CloudWatch only).

### EC2 (Elastic Compute Cloud) — Tumhara Virtual Server

```bash
# Instance launch karo
aws ec2 run-instances \
    --image-id ami-0c55b159cbfafe1f0 \  # Ubuntu 22.04 (ap-south-1)
    --instance-type t2.micro \
    --key-name my-key \
    --security-group-ids sg-12345678 \
    --subnet-id subnet-12345678 \
    --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=NexaBook-Web}]'

# Instances list
aws ec2 describe-instances \
    --query 'Reservations[*].Instances[*].[InstanceId,State.Name,PublicIpAddress,InstanceType]' \
    --output table

# Instance details
aws ec2 describe-instance-status --instance-ids i-1234567890abcdef0

# Instance band karo ( billing band hoti hai)
aws ec2 stop-instances --instance-ids i-1234567890abcdef0

# Instance start karo
aws ec2 start-instances --instance-ids i-1234567890abcdef0

# Instance delete karo (permanent)
aws ec2 terminate-instances --instance-ids i-1234567890abcdef0

# Connect karo (SSM — no SSH key needed)
aws ssm start-session --target i-1234567890abcdef0

# Key pair banao
aws ec2 create-key-pair --key-name my-new-key --query 'KeyMaterial' --output text > ~/.ssh/my-new-key.pem
chmod 400 ~/.ssh/my-new-key.pem
```

**Instance types choosing:**
- `t2.micro` — Free tier, testing, small apps
- `t3.small` — Development, low traffic
- `t3.medium` — Production small apps
- `m5.large` — Production workloads
- `c5.xlarge` — CPU-intensive (CI/CD runners)

### VPC (Virtual Private Cloud) — Tumhara Network

```
VPC (10.0.0.0/16) — 65,536 IPs
├── Public Subnet (10.0.1.0/24) — Internet se accessible
│   ├── EC2 (Web Server) — with Elastic IP
│   └── ALB (Load Balancer)
├── Private Subnet (10.0.2.0/24) — Sirf andar se accessible
│   └── EC2 (Application Server)
├── Private Subnet (10.0.3.0/24) — Database tier
│   └── RDS (Database)
├── NAT Gateway — Private subnet se internet access
├── Internet Gateway — Public subnet se internet access
└── Route Tables — Traffic kahan jaayega
```

```bash
# VPC banao
aws ec2 create-vpc --cidr-block 10.0.0.0/16

# Subnets banao
aws ec2 create-subnet \
    --vpc-id vpc-12345678 \
    --cidr-block 10.0.1.0/24 \
    --availability-zone ap-south-1a

# Internet Gateway banao aur attach karo
aws ec2 create-internet-gateway
aws ec2 attach-internet-gateway \
    --internet-gateway-id igw-12345678 \
    --vpc-id vpc-12345678

# NAT Gateway (private subnet se internet access ke liye)
aws ec2 allocate-address  # Elastic IP lo
aws ec2 create-nat-gateway \
    --subnet-id subnet-public \
    --allocation-id eipalloc-12345678

# Security Group — Firewall rules
aws ec2 create-security-group \
    --group-name web-sg \
    --description "Web server security group" \
    --vpc-id vpc-12345678

# HTTP open karo
aws ec2 authorize-security-group-ingress \
    --group-id sg-web \
    --protocol tcp --port 80 --cidr 0.0.0.0/0

# HTTPS open karo
aws ec2 authorize-security-group-ingress \
    --group-id sg-web \
    --protocol tcp --port 443 --cidr 0.0.0.0/0

# SSH — sirf tumhara IP
MY_IP=$(curl -s http://checkip.amazonaws.com)
aws ec2 authorize-security-group-ingress \
    --group-id sg-web \
    --protocol tcp --port 22 --cidr "${MY_IP}/32"
```

**Key concepts:**
- **Security Group** — Firewall (instance level) — stateful (return traffic automatically allowed)
- **NACL** — Firewall (subnet level) — stateless (return traffic explicitly allow karna padta hai)
- **Route Table** — Traffic kahan jaayega
- **Internet Gateway** — Internet connectivity (public subnet ke liye zaroori)
- **NAT Gateway** — Private subnet se internet access (updates ke liye)

### S3 (Simple Storage Service) — Object Storage

```bash
# Bucket banao (globally unique name chahiye)
aws s3 mb s3://ali-nexabook-backup

# File upload
aws s3 cp backup.tar.gz s3://ali-nexabook-backup/

# Folder sync
aws s3 sync ./logs s3://ali-nexabook-backup/logs/

# List bucket contents
aws s3 ls s3://ali-nexabook-backup/

# Download
aws s3 cp s3://ali-nexabook-backup/backup.tar.gz ./

# Lifecycle policy — auto-delete after 30 days
cat > lifecycle.json << 'EOF'
{
    "Rules": [
        {
            "ID": "AutoExpire",
            "Status": "Enabled",
            "Expiration": {
                "Days": 30
            },
            "Transitions": [
                {
                    "Days": 7,
                    "StorageClass": "STANDARD_IA"
                }
            ]
        }
    ]
}
EOF
aws s3api put-bucket-lifecycle-configuration \
    --bucket ali-nexabook-backup \
    --lifecycle-configuration file://lifecycle.json

# Versioning enable karo (data protection)
aws s3api put-bucket-versioning \
    --bucket ali-nexabook-backup \
    --versioning-configuration Status=Enabled

# Block public access
aws s3api put-public-access-block \
    --bucket ali-nexabook-backup \
    --public-access-block-configuration \
        BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
```

**S3 Storage Classes:**
- `STANDARD` — Frequently accessed (default)
- `STANDARD_IA` — Infrequent access (cheaper, retrieval fee)
- `GLACIER` — Archive (cheapest, hours to retrieve)
- `DEEP_ARCHIVE` — Long-term archive (cheapest, 12 hours to retrieve)

:::caution CHECKPOINT:
1. Security Group aur NACL mein kya fark hai? Kab kaunsa use karoge?
2. Public subnet aur Private subnet mein kya rakhte hain? Kyun?
3. S3 bucket pe versioning enable karna kyun zaroori hai? (Hint: accidental delete)

:::

---

## Section 3: Databases & Monitoring — Production Critical

:::tip CONCEPT: RDS = Managed Database

Database khud manage karna mushkil hai — backups, updates, scaling. RDS ye sab sambhalta hai.

:::

```bash
# RDS instance banao (MySQL)
aws rds create-db-instance \
    --db-instance-identifier nexabook-db \
    --db-instance-class db.t3.micro \
    --engine mysql \
    --master-username admin \
    --master-user-password $(openssl rand -base64 16) \
    --allocated-storage 20 \
    --vpc-security-group-ids sg-db \
    --db-subnet-group-name my-subnet-group \
    --backup-retention-period 7 \
    --multi-az \
    --storage-encrypted

# Check status
aws rds describe-db-instances \
    --db-instance-identifier nexabook-db \
    --query 'DBInstances[*].[DBInstanceIdentifier,DBInstanceStatus,Endpoint.Address]'

# Manual snapshot
aws rds create-db-snapshot \
    --db-instance-identifier nexabook-db \
    --db-snapshot-identifier pre-upgrade-snapshot

# Restore from snapshot
aws rds restore-db-instance-from-db-snapshot \
    --db-instance-identifier nexabook-db-restored \
    --db-snapshot-identifier pre-upgrade-snapshot

# Delete (careful — permanent!)
aws rds delete-db-instance \
    --db-instance-identifier nexabook-db \
    --skip-final-snapshot
```

**RDS vs DynamoDB:**
- `RDS` — Traditional SQL (MySQL, PostgreSQL). Complex queries, relationships.
- `DynamoDB` — NoSQL key-value. Simple, fast, scales infinitely.

### CloudWatch — Monitoring & Logging

```bash
# Custom metric push karo
aws cloudwatch put-metric-data \
    --namespace "NexaBook" \
    --metric-name "ActiveUsers" \
    --value 150

# Log group banao
aws logs create-log-group --log-group-name /aws/nexabook/api

# Log stream banao
aws logs create-log-stream \
    --log-group-name /aws/nexabook/api \
    --log-stream-name "instance-001"

# Log events push karo
aws logs put-log-events \
    --log-group-name /aws/nexabook/api \
    --log-stream-name "instance-001" \
    --log-events \
        timestamp=$(date +%s000),message="Server started on port 8080"

# Alarms banao — jab CPU 80% cross kare to email aaye
aws cloudwatch put-metric-alarm \
    --alarm-name "HighCPU" \
    --metric-name "CPUUtilization" \
    --namespace "AWS/EC2" \
    --statistic Average \
    --period 300 \
    --threshold 80 \
    --comparison-operator GreaterThanThreshold \
    --evaluation-periods 2 \
    --alarm-actions "arn:aws:sns:ap-south-1:123456789012:alerts" \
    --dimensions Name=InstanceId,Value=i-1234567890abcdef0

# Dashboard banao
aws cloudwatch put-dashboard \
    --dashboard-name "NexaBook" \
    --dashboard-body '{
        "widgets": [
            {
                "type": "metric",
                "properties": {
                    "metrics": [["AWS/EC2", "CPUUtilization"]],
                    "title": "CPU Usage"
                }
            }
        ]
    }'
```

### Route 53 — DNS

```bash
# Hosted zone banao
aws route53 create-hosted-zone \
    --name nexabook.com \
    --caller-reference $(date +%s)

# A record add karo
aws route53 change-resource-record-sets \
    --hosted-zone-id Z1234567890 \
    --change-batch '{
        "Changes": [{
            "Action": "CREATE",
            "ResourceRecordSet": {
                "Name": "www.nexabook.com",
                "Type": "A",
                "TTL": 300,
                "ResourceRecords": [{"Value": "1.2.3.4"}]
            }
        }]
    }'

# Health check
aws route53 create-health-check \
    --caller-reference $(date +%s) \
    --health-check-config '{
        "IPAddress": "1.2.3.4",
        "Port": 80,
        "Type": "HTTP",
        "ResourcePath": "/health",
        "RequestInterval": 30,
        "FailureThreshold": 3
    }'
```

:::note HANDS-ON: Full Stack on AWS

:::

```bash
# 1. VPC banao
VPC_ID=$(aws ec2 create-vpc --cidr-block 10.0.0.0/16 --query 'Vpc.VpcId' --output text)
SUBNET_ID=$(aws ec2 create-subnet --vpc-id $VPC_ID --cidr-block 10.0.1.0/24 --query 'Subnet.SubnetId' --output text)

# 2. Security Group
SG_ID=$(aws ec2 create-security-group --group-name web-sg --vpc-id $VPC_ID --query 'GroupId' --output text)
aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 80 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 22 --cidr $(curl -s http://checkip.amazonaws.com)/32

# 3. EC2 launch karo
aws ec2 run-instances \
    --image-id ami-0c55b159cbfafe1f0 \
    --instance-type t2.micro \
    --key-name my-key \
    --security-group-ids $SG_ID \
    --subnet-id $SUBNET_ID \
    --user-data '#!/bin/bash
        apt update && apt install -y nginx
        systemctl enable nginx && systemctl start nginx'

# 4. RDS banao
aws rds create-db-instance \
    --db-instance-identifier nexabook-db \
    --db-instance-class db.t3.micro \
    --engine mysql \
    --master-username admin \
    --master-user-password TempPass123! \
    --allocated-storage 20 \
    --vpc-security-group-ids sg-db

echo "Setup complete!"
```

:::caution CHECKPOINT:
1. RDS Multi-AZ kya hai? Kab enable karna chahiye?
2. CloudWatch alarm jo CPU 80% pe alert kare — usse kaise banaoge? (Steps do)
3. Route 53 health check fail hone pe kya hota hai? (Failover scenario)

:::

---

## Section 4: Azure — Gulf Market Ke Liye Zaroori

:::tip CONCEPT: Azure = AWS Ka Gulf Version

Azure Gulf countries mein dominant hai. Agar tum UAE/Saudi jaana chahte ho to Azure aana zaroori hai. AWS aur Azure ka service mapping nearly 1:1 hai.

:::

```bash
# Azure CLI install karo
curl -sL https://aka.ms/InstallAzureCLI | sudo bash

# Login
az login

# Subscription set karo
az account set --subscription "My Subscription"
az account show --output table
```

### Azure Core Services

```bash
# Resource Group banao (AWS = Resource Groups equivalent nahi, ye Azure specific hai)
az group create --name nexabook-rg --location uaeorth

# VM create
az vm create \
    --resource-group nexabook-rg \
    --name nexabook-vm \
    --image Ubuntu2204 \
    --size Standard_B1s \
    --admin-username ali \
    --ssh-key-value ~/.ssh/id_rsa.pub \
    --nsg web-nsg \
    --subnet nexabook-subnet \
    --public-ip-sku Standard

# VM list
az vm list -o table

# VM details
az vm show --resource-group nexabook-rg --name nexabook-vm -o table

# VM stop/delete
az vm stop --resource-group nexabook-rg --name nexabook-vm
az vm delete --resource-group nexabook-rg --name nexabook-vm --yes
```

### Azure Networking (VNet)

```bash
# VNet banao
az network vnet create \
    --resource-group nexabook-rg \
    --name nexabook-vnet \
    --address-prefix 10.0.0.0/16 \
    --subnet-name web-subnet \
    --subnet-prefix 10.0.1.0/24

# Private subnet add karo
az network vnet subnet create \
    --resource-group nexabook-rg \
    --vnet-name nexabook-vnet \
    --name db-subnet \
    --address-prefixes 10.0.2.0/24

# NSG (Network Security Group = AWS Security Group)
az network nsg create \
    --resource-group nexabook-rg \
    --name web-nsg

az network nsg rule create \
    --resource-group nexabook-rg \
    --nsg-name web-nsg \
    --name allow-http \
    --priority 100 \
    --protocol Tcp \
    --destination-port-ranges 80 443 \
    --access Allow \
    --direction Inbound

# NIC attach karo
az network nic ip-config update \
    --resource-group nexabook-rg \
    --nic-name nexabook-nic \
    --name ipconfig1 \
    --public-ip-address nexabook-pip
```

### AKS (Azure Kubernetes Service)

```bash
# AKS cluster banao
az aks create \
    --resource-group nexabook-rg \
    --name nexabook-aks \
    --node-count 2 \
    --node-vm-size Standard_B2s \
    --enable-addons monitoring \
    --generate-ssh-keys

# Get credentials
az aks get-credentials --resource-group nexabook-rg --name nexabook-aks

# Verify
kubectl get nodes
kubectl cluster-info
```

### Azure vs AWS Mapping

| AWS | Azure | GCP |
|-----|-------|-----|
| EC2 | Virtual Machines | Compute Engine |
| S3 | Blob Storage | Cloud Storage |
| VPC | VNet | VPC |
| Security Group | NSG | Firewall Rules |
| RDS | Azure SQL | Cloud SQL |
| EKS | AKS | GKE |
| Lambda | Azure Functions | Cloud Functions |
| CloudWatch | Azure Monitor | Cloud Monitoring |
| IAM | Azure AD (RBAC) | Cloud IAM |
| Route 53 | Azure DNS | Cloud DNS |
| ELB/ALB | Azure Load Balancer | Cloud Load Balancing |

:::caution CHECKPOINT:
1. Azure RBAC aur AWS IAM mein kya fark hai? (Hint: role assignment model)
2. AKS aur EKS mein kya common hai? Kya alag hai?
3. Gulf market mein Azure kyun dominant hai? (Hint: enterprise + Microsoft relationship)

:::

---

## Section 5: GCP — Awareness Level

:::tip CONCEPT: GCP = Google Ka Cloud (AI/ML Focus)

GCP ka market share kam hai lekin AI/ML heavy companies mein use hota hai. Awareness rakhni chahiye — deep dive abhi nahi.

:::

```bash
# gcloud CLI install karo
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
gcloud init

# Project banao
gcloud projects create nexabook-gcp --name="NexaBook GCP"
gcloud config set project nexabook-gcp

# Compute Engine
gcloud compute instances create nexabook-vm \
    --zone=us-central1-a \
    --machine-type=e2-micro \
    --image-family=ubuntu-2204-lts \
    --image-project=ubuntu-os-cloud

# Cloud Storage
gsutil mb -l us-central1 gs://nexabook-bucket/
gsutil cp backup.tar.gz gs://nexabook-bucket/

# GKE (Google Kubernetes Engine)
gcloud container clusters create nexabook-gke \
    --num-nodes=2 \
    --zone=us-central1-a \
    --machine-type=e2-standard-2

# Get credentials
gcloud container clusters get-credentials nexabook-gke --zone=us-central1-a
```

**GCP Unique Features:**
- **BigQuery** — Serverless data warehouse (analytics ke liye best)
- **Vertex AI** — ML model training/deployment
- **Cloud Run** — Serverless containers (Heroku alternative)

:::caution CHECKPOINT:
1. GCP Cloud Run aur AWS Lambda mein kya fark hai? (Hint: containers vs functions)
2. GCP BigQuery kyun use hota hai jab AWS Redshift available hai?

:::

---

## Section 6: Cloud Security — Production Critical

:::tip CONCEPT: Security = Tumhari Zimmedaari

Cloud mein sab kuch open hai by default. Tumhara kaam hai secured rakhna. Ek galti se tumhara data leak ho sakta hai aur bill 100x ho sakta hai.

:::

### AWS Security Deep Dive

```bash
# 1. IAM — Least Privilege (sirf zaroori permissions)
aws iam create-policy \
    --policy-name NexaBookPolicy \
    --policy-document '{
        "Version": "2012-10-17",
        "Statement": [{
            "Effect": "Allow",
            "Action": ["s3:GetObject", "s3:PutObject"],
            "Resource": "arn:aws:s3:::my-nexabook/*"
        }]
    }'

# 2. Security Group — Only Required Ports
# Galat — sab ports open
# aws ec2 authorize-security-group-ingress --protocol tcp --port 0 --cidr 0.0.0.0/0

# Sahi — sirf zaroori ports
aws ec2 authorize-security-group-ingress \
    --group-id sg-12345678 \
    --protocol tcp --port 443 --cidr 0.0.0.0/0

# 3. Enable MFA (Multi-Factor Authentication)
aws iam enable-mfa-device \
    --user-name ali \
    --serial-number arn:aws:iam::123456789012:mfa/ali \
    --authentication-code1 123456 \
    --authentication-code2 789012

# 4. Enable CloudTrail (audit logs — kaunne kya kiya)
aws cloudtrail create-trail \
    --name nexabook-audit \
    --s3-bucket-name my-audit-logs \
    --is-multi-region-trail
aws cloudtrail start-logging --name nexabook-audit

# 5. Enable GuardDuty (threat detection)
aws guardduty create-detector --enable

# 6. S3 bucket public access check
aws s3api get-public-access-block --bucket my-nexabook-backup

# 7. VPC Flow Logs (network traffic monitoring)
aws ec2 create-flow-logs \
    --resource-type VPC \
    --resource-ids vpc-12345678 \
    --traffic-type ALL \
    --log-destination-type cloud-watch-logs \
    --log-group-name /aws/vpc/flowlogs \
    --deliver-logs-permission-arn arn:aws:iam::123456789012:role/VPCFlowLogsRole
```

### Azure Security

```bash
# NSG rules
az network nsg rule create \
    --resource-group nexabook-rg \
    --nsg-name web-nsg \
    --name deny-all-inbound \
    --priority 4096 \
    --protocol '*' \
    --access Deny \
    --direction Inbound

# Azure AD — Managed Identity (no credentials needed)
az identity create --name nexabook-identity --resource-group nexabook-rg

# Key Vault (secrets management)
az keyvault create --name nexabook-vault --resource-group nexabook-rg --location uaeorth
az keyvault secret set --vault-name nexabook-vault --name db-password --value "TempPass123!"

# Defender for Cloud (threat protection)
az security pricing create --name VirtualMachines --tier Standard
```

### Security Best Practices Checklist

```
[ ] IAM: Least privilege, no root user for daily tasks
[ ] MFA: Enable on all users
[ ] Security Groups: Only required ports open
[ ] S3/Blob: Block public access
[ ] Encryption: At rest (RDS/S3) and in transit (HTTPS)
[ ] CloudTrail/Activity Log: Enable on all regions
[ ] Secrets: Use Key Vault/Secrets Manager, never hardcoded
[ ] VPC Flow Logs: Enable for network monitoring
[ ] Regular audit: Review IAM policies quarterly
```

:::caution CHECKPOINT:
1. Production server pe SSH port 22 open rakhna chahiye ya nahi? Alternative kya hai? (Hint: SSM/Azure Bastion)
2. MFA kyun zaroori hai? Agar tumhara access key leak ho jaye to kya hoga?
3. CloudTrail enable karna kyun zaroori hai? (Hint: compliance + forensics)

:::

---

## Section 7: Cloud Cost Management — Paisa Bachao

:::tip CONCEPT: Cloud = Paisa Udne Ka Zariya (Agar Dhyan Nahi Do)

Cloud mein galat configuration se bill 10x ho sakta hai. Cost awareness zaroori hai — ye tumhare resume mein bhi impress karta hai.

:::

### AWS Cost Management

```bash
# Cost Explorer — pata lagao paisa kahan ja raha hai
aws ce get-cost-and-usage \
    --time-period Start=2024-01-01,End=2024-01-31 \
    --granularity MONTHLY \
    --metrics "BlendedCost" \
    --group-by Type=DIMENSION,Key=SERVICE

# Resource tagging — cost tracking (sabse important)
aws ec2 create-tags \
    --resources i-1234567890abcdef0 \
    --tags Key=Project,Value=NexaBook Key=Environment,Value=Production Key=Team,Value=DevOps

# Budget alert — $50 cross ho to email aaye
aws budgets create-budget \
    --account-id 123456789012 \
    --budget '{
        "BudgetName": "NexaBookBudget",
        "BudgetLimit": {"Amount": "50", "Unit": "USD"},
        "TimeUnit": "MONTHLY",
        "BudgetType": "COST",
        "CostFilters": {
            "TagKeyValue": ["user:Project$NexaBook"]
        }
    }' \
    --notifications-with-subscribers '[{
        "Notification": {
            "NotificationType": "ACTUAL",
            "ComparisonOperator": "GREATER_THAN",
            "Threshold": 80
        },
        "Subscribers": [{
            "SubscriptionType": "EMAIL",
            "Address": "ali@example.com"
        }]
    }]'

# Cost allocation tags enable karo
aws costexplorer create-cost-allocation-tags \
    --tags '[{"Key": "Project", "Value": "NexaBook"}]'
```

### Azure Cost Management

```bash
# Cost analysis
az cost management query \
    --type ActualCost \
    --timeframe "2024-01-01 to 2024-01-31" \
    --dataset grouping \
    --dimensions name=ResourceGroup

# Budget
az consumed billing budget create \
    --amount 50 \
    --currency USD \
    --time-grain Monthly \
    --start-date 2024-01-01 \
    --end-date 2024-12-31 \
    --resource-group nexabook-rg \
    --name NexaBookBudget

# Auto-shutdown VM (dev/staging ke liye)
az vm auto-shutdown \
    --resource-group nexabook-rg \
    --name nexabook-vm \
    --time 22:00
```

### Cost Optimization Strategies

```
1. RIGHT-SIZING:        t2.micro se start karo, monitoring se pata chalega kab upgrade karna hai
2. RESERVED INSTANCES:  1 saal commit karo to 30-60% bachta hai
3. SPOT INSTANCES:      70% cheaper (CI/CD runners ke liye best)
4. S3 LIFECYCLE:        Old data auto-move to cheaper storage
5. TAGGING:             Har resource pe tag karo — pata chalega paisa kahan ja raha hai
6. AUTO-SHUTDOWN:       Dev/staging VMs raat ko band karo
7. MONITORING:          Cost Explorer weekly check karo
```

:::note HANDS-ON: Cost Optimization

:::

```bash
# Unused EBS volumes find karo
aws ec2 describe-volumes --filters Name=status,Values=available \
    --query 'Volumes[*].[VolumeId,Size,CreateTime]'

# Unattached Elastic IPs
aws ec2 describe-addresses --filters Name=instance-id,Values='' \
    --query 'Addresses[*].[PublicIp,AllocationId]'

# Old snapshots delete karo
aws ec2 describe-snapshots --owner-ids self \
    --query 'Snapshots[?StartTime<=`2023-01-01`].[SnapshotId,StartTime,VolumeSize]'

# S3 storage class analysis
aws s3api get-bucket-analytics-configuration \
    --bucket my-nexabook-backup \
    --id full-analysis
```

:::caution CHECKPOINT:
1. Agar tumhare EC2 instance ka CPU average 5% hai, to kya karoge? (Hint: right-sizing)
2. Reserved Instances vs Spot Instances — kab kaunsa use karoge?
3. Cost monitoring ke liye weekly kya check karna chahiye?

:::

---

## Section 8: Infrastructure as Code — Terraform Basics

:::tip CONCEPT: IaC = Code Se Infrastructure Banao

Manual se click karke server banana bhool jao — ab code likho aur infrastructure automate karo. Ye DevOps ka core skill hai.

:::

```bash
# Terraform install karo
sudo apt-get install -y gnupg software-properties-common
wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt-get update && sudo apt-get install terraform

# Verify
terraform --version
```

```hcl
# File: main.tf
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  backend "s3" {
    bucket = "ali-terraform-state"
    key    = "nexabook/terraform.tfstate"
    region = "ap-south-1"
  }
}

provider "aws" {
  region = "ap-south-1"
}

# VPC
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
  
  tags = {
    Name = "nexabook-vpc"
  }
}

# Subnet
resource "aws_subnet" "public" {
  vpc_id     = aws_vpc.main.id
  cidr_block = "10.0.1.0/24"
  
  tags = {
    Name = "nexabook-public"
  }
}

# Security Group
resource "aws_security_group" "web" {
  name        = "web-sg"
  description = "Web server security group"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# EC2 Instance
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
  subnet_id     = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.web.id]

  tags = {
    Name = "nexabook-web"
  }
}

# Output
output "public_ip" {
  value = aws_instance.web.public_ip
}
```

```bash
# Initialize (providers download)
terraform init

# Plan (preview changes)
terraform plan

# Apply (create infrastructure)
terraform apply

# Destroy (delete everything)
terraform destroy

# State dekho
terraform state list
terraform state show aws_instance.web
```

:::caution CHECKPOINT:
1. Terraform state file kyun zaroori hai? Agar delete ho jaye to kya hoga?
2. Manual changes (console se) karne ke baad Terraform kya karega? (Hint: drift detection)

:::

---

## Section 9: Hybrid Architecture — Real-World Pattern

:::tip CONCEPT: Sab Cloud Pe Mat Daalo — Smart Architecture

2026 pattern: **Frontend + API → Vercel/SST**, **Heavy workloads → AWS EKS / Azure AKS**

:::

```
                    Internet
                       |
                    [Cloudflare CDN]
                       |
              +--------+--------+
              |                 |
         [Vercel]          [AWS EKS]
         Frontend          Backend/Agent
         (Free/Cheap)      (Scalable)
              |                 |
              +--------+--------+
                       |
                  [AWS RDS]
                  Database
```

**Cost optimization:**
- Frontend → Vercel (free tier)
- API → Lambda/Cloud Functions (pay per request)
- Database → RDS/Azure SQL (managed)
- Agent/Heavy workloads → EKS/AKS (only when needed)

:::note HANDS-ON: Architecture Decision

:::

```bash
# NexaBook architecture:
# Frontend → Vercel (free)
# API → AWS Lambda (pay per request)
# Database → RDS PostgreSQL (db.t3.micro = ~$15/month)
# Monitoring → CloudWatch (free tier)

# Islamic Banking FTE architecture:
# Frontend → Azure Static Web Apps (free)
# API → Azure AKS (Standard_B2s = ~$50/month)
# Database → Azure SQL (Basic = ~$5/month)
# Monitoring → Azure Monitor (free tier)
```

:::caution CHECKPOINT:
1. Agar tumhara API 100 requests/day leta hai, to EC2 better hai ya Lambda? (Cost calculation karo)
2. Microservices vs Monolith — kab kaunsa choose karoge?

:::

---

## Summary: Phase 4 Key Takeaways

| Concept | Tumne Kya Seekha |
|---------|-----------------|
| Cloud Types | IaaS, PaaS, SaaS — kaunsa kab |
| AWS Core | IAM, EC2, VPC, S3, RDS, CloudWatch, Route 53 |
| Azure Core | VMs, VNet, NSG, AKS, Azure DevOps |
| GCP | Compute Engine, GKE, Cloud Run (awareness) |
| Security | Least privilege, MFA, CloudTrail, encryption |
| Cost | Tagging, budgets, right-sizing, reserved instances |
| IaC | Terraform basics, state management |
| Architecture | Hybrid pattern — Vercel + Cloud backend |

---

## MINI-TASKS

### Task 1: VPC Setup (20 min)
AWS pe ek VPC banao with:
- 1 Public Subnet (web server)
- 1 Private Subnet (database)
- NAT Gateway
- Security Groups (80, 443, 22 only from your IP)
- Internet Gateway

### Task 2: IAM Role (10 min)
Ek IAM role banao jo:
- S3 read-only access de
- CloudWatch logs bhej sake
- EC2 describe kar sake
- Kuch aur na kare (least privilege)

### Task 3: Cost Alert (5 min)
AWS budget banao jo $50 cross hone pe email bheje.

### Task 4: Terraform (15 min)
Terraform se VPC + EC2 banao:
- VPC with 1 public subnet
- Security group (HTTP + SSH)
- EC2 instance with user data (nginx install)
- Output mein public IP

---

## INCIDENT.md: Practice Scenarios

### Incident #1: SSH Access Denied — Security Group
- **What Broke:** EC2 instance pe SSH nahi ho raha, connection timeout
- **Root Cause:** Security Group mein port 22 open nahi ya wrong CIDR
- **Fix:**
  ```bash
  # Step 1: Pata lagao tumhara IP kya hai
  MY_IP=$(curl -s http://checkip.amazonaws.com)
  echo "Your IP: $MY_IP"
  
  # Step 2: Security Group check karo
  aws ec2 describe-security-groups --group-ids sg-12345678 \
      --query 'SecurityGroups[*].IpPermissions'
  
  # Step 3: Port 22 open karo (sirf tumhara IP)
  aws ec2 authorize-security-group-ingress \
      --group-id sg-12345678 \
      --protocol tcp --port 22 --cidr "${MY_IP}/32"
  
  # Step 4: Verify karo
  aws ec2 describe-security-groups --group-ids sg-12345678 \
      --query 'SecurityGroups[*].IpPermissions[*].IpRanges'
  
  # Step 5: Agar NACL bhi check karna ho
  aws ec2 describe-network-acls --filters Name=vpc-id,Values=vpc-12345678
  ```
- **Prevention:** Hamesha security group setup karo launch se pehle, CIDR apna IP dalo
- **Learning:** Security Group stateful hai — sirf inbound allow karo, return traffic automatic allow hoti hai

### Incident #2: S3 Bucket Public — Data Leak
- **What Broke:** S3 bucket publicly accessible ho gaya, sensitive data exposed
- **Root Cause:** Bucket policy mein `*`Principal tha ya Block Public Access disable tha
- **Fix:**
  ```bash
  # Step 1: Check karo bucket policy
  aws s3api get-bucket-policy --bucket my-nexabook-backup
  
  # Step 2: Check public access block
  aws s3api get-public-access-block --bucket my-nexabook-backup
  
  # Step 3: Block Public Access enable karo
  aws s3api put-public-access-block \
      --bucket my-nexabook-backup \
      --public-access-block-configuration \
          BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
  
  # Step 4: Bucket policy delete karo agar galat hai
  aws s3api delete-bucket-policy --bucket my-nexabook-backup
  
  # Step 5: Secure policy lagao
  aws s3api put-bucket-policy \
      --bucket my-nexabook-backup \
      --policy '{
          "Version": "2012-10-17",
          "Statement": [{
              "Effect": "Deny",
              "Principal": "*",
              "Action": "s3:*",
              "Resource": "arn:aws:s3:::my-nexabook-backup/*",
              "Condition": {
                  "Bool": {"aws:SecureTransport": "false"}
              }
          }]
      }'
  
  # Step 6: Access logging enable karo
  aws s3api put-bucket-logging \
      --bucket my-nexabook-backup \
      --bucket-logging-status '{
          "LoggingEnabled": {
              "TargetBucket": "my-access-logs",
              "TargetPrefix": "backup-bucket/"
          }
      }'
  ```
- **Prevention:** Block Public Access default enable karo, bucket policy review karo
- **Learning:** S3 public access = data breach. Hamesha Block Public Access enable rakho

### Incident #3: High Bill — Unused Resources
- **What Broke:** AWS bill $500 aa gaya expected $50 ki jagah
- **Root Cause:** 5 stopped EC2 instances + unattached EBS volumes + old snapshots
- **Fix:**
  ```bash
  # Step 1: Cost breakdown dekho
  aws ce get-cost-and-usage \
      --time-period Start=2024-01-01,End=2024-01-31 \
      --granularity MONTHLY \
      --metrics "BlendedCost" \
      --group-by Type=DIMENSION,Key=SERVICE \
      --query 'ResultsByTime[0].Groups[?Metrics.BlendedCost.Amount>`10`].[Keys,Metrics.BlendedCost]'
  
  # Step 2: Stopped instances delete karo
  aws ec2 describe-instances --filters Name=instance-state-name,Values=stopped \
      --query 'Reservations[*].Instances[*].[InstanceId,LaunchTime,InstanceType]'
  aws ec2 terminate-instances --instance-ids i-xxx i-yyy i-zzz
  
  # Step 3: Unattached EBS delete karo
  aws ec2 describe-volumes --filters Name=status,Values=available \
      --query 'Volumes[*].[VolumeId,Size,CreateTime]'
  aws ec2 delete-volume --volume-id vol-xxx
  
  # Step 4: Old snapshots delete karo (>30 days)
  aws ec2 describe-snapshots --owner-ids self \
      --query 'Snapshots[?StartTime<=`2024-01-01`].[SnapshotId,VolumeSize,StartTime]'
  aws ec2 delete-snapshot --snapshot-id snap-xxx
  
  # Step 5: Unattached Elastic IPs release karo
  aws ec2 describe-addresses --filters Name=instance-id,Values='' \
      --query 'Addresses[*].[PublicIp,AllocationId]'
  aws ec2 release-address --allocation-id eipalloc-xxx
  
  # Step 6: Budget alert set karo taake dubara na ho
  ```
- **Prevention:** Weekly cost review + auto-stop non-production instances + tagging
- **Learning:** Stopped EC2 instances still cost for EBS. Delete when not needed

### Incident #4: EC2 Instance Can't Connect to RDS
- **What Broke:** Application RDS database se connect nahi ho raha
- **Root Cause:** Security Group rules missing ya VPC/subnet mismatch
- **Fix:**
  ```bash
  # Step 1: RDS endpoint check karo
  aws rds describe-db-instances --db-instance-identifier nexabook-db \
      --query 'DBInstances[*].[Endpoint.Address,Endpoint.Port,VpcSecurityGroups]'
  
  # Step 2: RDS Security Group check karo — port 3306 (MySQL) open hai?
  aws ec2 describe-security-groups --group-ids sg-db \
      --query 'SecurityGroups[*].IpPermissions'
  
  # Step 3: EC2 ke Security Group se outbound check karo
  aws ec2 describe-security-groups --group-ids sg-web \
      --query 'SecurityGroups[*].IpPermissionsEgress'
  
  # Step 4: SG rules add karo
  aws ec2 authorize-security-group-ingress \
      --group-id sg-db \
      --protocol tcp --port 3306 \
      --source-group sg-web
  
  # Step 5: Subnet check karo — dono same VPC mein hain?
  aws rds describe-db-subnet-groups --db-subnet-group-name my-subnet-group
  
  # Step 6: Test connectivity (EC2 pe jaake)
  # telnet nexabook-db.xxxxx.ap-south-1.rds.amazonaws.com 3306
  ```
- **Prevention:** Network diagram banao pehle, security groups properly configure karo
- **Learning:** RDS aur EC2 same VPC mein hona chahiye, SG rules properly set hone chahiye

### Incident #5: Terraform State File Corrupted
- **What Broke:** `terraform plan` error de raha hai, state file locked
- **Root Cause:** Concurrent Terraform run ya crash se state file corrupt
- **Fix:**
  ```bash
  # Step 1: State file backup se restore karo
  aws s3 cp s3://ali-terraform-state/nexabook/terraform.tfstate.backup ./terraform.tfstate
  
  # Step 2: Agar S3 versioning enable hai to previous version se restore
  aws s3api list-object-versions \
      --bucket ali-terraform-state \
      --prefix nexabook/terraform.tfstate
  
  aws s3api get-object \
      --bucket ali-terraform-state \
      --key nexabook/terraform.tfstate \
      --version-id "previous-version-id" \
      ./terraform.tfstate
  
  # Step 3: DynamoDB lock check karo
  aws dynamodb scan --table-name terraform-locks \
      --filter-expression "LockID = :val" \
      --expression-attribute-values ':val':{"S": "ali-terraform-state/nexabook/terraform.tfstate"}
  
  # Step 4: Lock delete karo (sirf tab jab sure ho ke koi running nahi)
  aws dynamodb delete-item \
      --table-name terraform-locks \
      --key '{"LockID": {"S": "ali-terraform-state/nexabook/terraform.tfstate"}}'
  
  # Step 5: State verify karo
  terraform state list
  terraform plan
  ```
- **Prevention:** S3 versioning enable karo, DynamoDB locking use karo, state file ko kabhi manually edit mat karo
- **Learning:** State file = infrastructure ka source of truth. Backup aur versioning zaroori hai
