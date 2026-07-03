---
sidebar_position: 10
title: "Phase 8: Incident Log"
description: "Real-world incident scenarios for Phase 8"
---

# INCIDENT LOG — Phase: Infrastructure as Code (Terraform + Ansible)

---

## Incident #1: State File Corruption
- **Date:** (Practice Scenario)
- **What Broke:** Terraform state file corrupt ho gaya
- **Root Cause:** Manual edit ya concurrent apply
- **Fix:**
  ```bash
  # Step 1: State backup se restore karo
  # Agar S3 versioning enabled hai:
  aws s3api list-object-versions --bucket nexabook-terraform-state --prefix prod/terraform.tfstate
  
  # Previous version restore karo
  aws s3api get-object \
    --bucket nexabook-terraform-state \
    --key prod/terraform.tfstate \
    --version-id "previous-version-id" \
    ./terraform.tfstate
  
  # Step 2: Agar DynamoDB lock hai to remove karo
  aws dynamodb delete-item \
    --table-name terraform-locks \
    --key '{"LockID": {"S": "nexabook-terraform-state/prod/terraform.tfstate"}}'
  
  # Step 3: State verify karo
  terraform state list
  terraform plan
  
  # Step 4: Remote state migrate karo
  terraform init -migrate-state
  ```
- **Prevention:** S3 versioning + DynamoDB locking enable karo, state file kabhi manually edit mat karo
- **Learning:** State file = infrastructure ka source of truth. Backup aur versioning zaroori hai

---

## Incident #2: Ansible Playbook Fails
- **Date:** (Practice Scenario)
- **What Broke:** Nginx install nahi ho raha
- **Root Cause:** Package name wrong hai ya permission issue
- **Fix:**
  ```bash
  # Step 1: Verbose mode se debug karo
  ansible-playbook -i inventory.ini playbook.yml -vvv
  
  # Step 2: Dry run karo (kuch change nahi hoga)
  ansible-playbook -i inventory.ini playbook.yml --check
  
  # Step 3: Specific task run karo
  ansible-playbook -i inventory.ini playbook.yml --start-at-task "Install nginx"
  
  # Step 4: Remote pe check karo
  ansible web -i inventory.ini -m shell -a "apt list --installed | grep nginx"
  
  # Step 5: Playbook fix karo
  # Galat: name: nginx3
  # Sahi: name: nginx
  
  # Step 6: Idempotency verify karo (doosri baar run karo)
  ansible-playbook -i inventory.ini playbook.yml
  # "ok=0 changed=0" = already configured (idempotent)
  ```
- **Prevention:** `--check` mode pehle run karo, ad-hoc commands se test karo
- **Learning:** Ansible idempotent hai — doosri baar run karne pe kuch change nahi hota agar sab configured hai

---

## Incident #3: Terraform Drift
- **Date:** (Practice Scenario)
- **What Broke:** Manual change kiya cloud pe, Terraform ko pata nahi
- **Root Cause:** AWS Console se EC2 instance type change kiya
- **Fix:**
  ```bash
  # Step 1: Plan dekho — drift detect hoga
  terraform plan
  # ~ aws_instance.web: has been changed outside of Terraform
  #   ~ instance_type = "t2.micro" -> "t3.small"
  
  # Step 2: Refresh state (actual state se sync)
  terraform refresh
  
  # Step 3: Desired state restore karo
  terraform apply
  # Terraform wapas t2.micro pe set kar dega
  
  # Step 4: Agar manual change zaroori hai to code mein bhi update karo
  # variable "instance_type" { default = "t3.small" }
  # terraform apply
  
  # Step 5: Drift detection automate karo
  # CI/CD pipeline mein terraform plan chalao aur alert bhejo
  ```
- **Prevention:** Hamesha Terraform se manage karo, manual changes avoid karo, CI/CD mein drift detection
- **Learning:** Drift = desired state vs actual state mismatch. `terraform apply` se restore hota hai

---

## Incident #4: Terraform Apply Fails — Dependency Error
- **Date:** (Practice Scenario)
- **What Broke:** `terraform apply` fails with dependency error
- **Root Cause:** Resource A pe depend karta hai lekin A abhi exist nahi karta
- **Fix:**
  ```bash
  # Step 1: Error padho
  # "Error: Error creating EC2 Instance: DependencyViolation"
  
  # Step 2: Resources order check karo
  terraform plan
  # Kya pehle ban raha hai, kya baad mein
  
  # Step 3: depends_on add karo agar zaroori hai
  # resource "aws_instance" "web" {
  #   depends_on = [aws_security_group.web]
  # }
  
  # Step 4: Security group rules check karo
  aws ec2 describe-security-groups --group-ids sg-xxx
  
  # Step 5: Circular dependency resolve karo
  # Agar A depends on B, aur B depends on A
  # Resources ko alag karo ya refactoring karo
  ```
- **Prevention:** Resource dependencies properly define karo, `terraform plan` se pehle review karo
- **Learning:** Terraform resources automatically dependency order create karta hai. Kabhi kabhi manual `depends_on` zaroori hai

---

## Incident #5: Ansible SSH Connection Fails
- **Date:** (Practice Scenario)
- **What Broke:** Ansible servers se connect nahi ho paa raha
- **Root Cause:** SSH key wrong hai ya permissions galat hain
- **Fix:**
  ```bash
  # Step 1: SSH connectivity test karo
  ansible all -i inventory.ini -m ping
  # "UNREACHABLE!" = SSH issue
  
  # Step 2: SSH manually test karo
  ssh -i ~/.ssh/id_rsa ali@192.168.1.100
  
  # Step 3: SSH key permissions check
  ls -la ~/.ssh/id_rsa
  # -rw------- 1 ali ali 1234 ... (sahi permissions)
  # -rw-r--r-- 1 ali ali 1234 ... (galat permissions)
  chmod 600 ~/.ssh/id_rsa
  
  # Step 4: Inventory check karo
  # Galat: ansible_host=192.168.1.100 (typo)
  # Sahi: ansible_host=192.168.1.100
  
  # Step 5: Known hosts check
  ssh-keyscan 192.168.1.100 >> ~/.ssh/known_hosts
  
  # Step 6: Ansible config check
  ansible -i inventory.ini all -m ping -vvv
  ```
- **Prevention:** SSH keys properly manage karo, inventory verify karo, `ansible all -m ping` se test karo
- **Learning:** Ansible SSH pe depend karta hai. SSH issue = Ansible issue
