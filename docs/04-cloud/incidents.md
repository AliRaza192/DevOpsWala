---
sidebar_position: 6
title: "Phase 4: Incident Log"
description: "Real-world incident scenarios for Phase 4"
---

# INCIDENT LOG — Phase: Cloud Fundamentals (AWS/Azure/GCP)

---

## Incident #1: SSH Access Denied — Security Group
- **Date:** (Practice Scenario)
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

---

## Incident #2: S3 Bucket Public — Data Leak
- **Date:** (Practice Scenario)
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

---

## Incident #3: High Bill — Unused Resources
- **Date:** (Practice Scenario)
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

---

## Incident #4: EC2 Instance Can't Connect to RDS
- **Date:** (Practice Scenario)
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

---

## Incident #5: Terraform State File Corrupted
- **Date:** (Practice Scenario)
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
