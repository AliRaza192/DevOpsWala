---
sidebar_position: 9
title: "PHASE 8: Infrastructure as Code (Terraform) + Config Management (Ansible)"
description: "**Tumhara level:** Tum manually cloud resources bana rahe ho. Ab Terraform seekho — infrastructure as code. Ye tumhe rep"
---

# PHASE 8: Infrastructure as Code (Terraform) + Config Management (Ansible) — TEACHING

> **Tumhara level:** Tum manually cloud resources bana rahe ho. Ab Terraform seekho — infrastructure as code. Ye tumhe repeatable, version-controlled, aur auditable infrastructure dega. Ansible basics bhi seekho configuration management ke liye. Ye phase tumhare resume mein sabse zyada weight rakhta hai — IaC = senior DevOps engineer.

---

## Section 1: IaC Kya Hai? — The Big Picture

:::tip CONCEPT: IaC = Infrastructure = Code

Pehle tum manually EC2, VPC, Security Groups banaate the. Ab code likho aur infrastructure apne aap ban jaayega.

**Benefits:**
- **Repeatable** — Same infrastructure 100 baar bana sakte ho
- **Version Controlled** — Git pe track hota hai
- **Auditable** — Pata chalta hai kisne kya kab badla
- **Collaborative** — Team contribute kar sakti hai
- **Disaster Recovery** — Infrastructure dobara bana sakte ho minutes mein

**Terraform vs Ansible:**
- **Terraform** — Infrastructure create karta hai (EC2, VPC, RDS). Declarative. Cloud-focused.
- **Ansible** — Servers configure karta hai (install packages, copy files). Procedural. Multi-platform.

:::

```
Terraform: Server banao (IaC)
Ansible: Server pe Nginx install karo (Config Management)
```

**When to use what:**
- Cloud resources banao -> Terraform
- Server configure karo -> Ansible
- Dono ek saath -> Terraform (infra) + Ansible (configuration)

:::caution CHECKPOINT:
1. Terraform aur Ansible mein kya fark hai? Kab kaunsa use karoge?
2. Manual infrastructure aur IaC mein kya fark hai? Kab IaC zaroori nahi hai?
3. Tumhare Islamic Banking FTE ke liye Terraform aur Ansible kaunsa use hoga?

:::

---

## Section 2: Terraform Basics — The First Steps

:::tip CONCEPT: Terraform = Infrastructure Ka Blueprint

:::

```bash
# Install
wget https://releases.hashicorp.com/terraform/1.7.0/terraform_1.7.0_linux_amd64.zip
unzip terraform_1.7.0_linux_amd64.zip
sudo mv terraform /usr/local/bin/

# Verify
terraform version

# Basic workflow
terraform init      # Providers download
terraform plan      # Preview changes
terraform apply     # Create infrastructure
terraform destroy   # Delete everything
```

:::note HANDS-ON: First Terraform Config

:::

```hcl
# File: main.tf
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  required_version = ">= 1.0"
}

provider "aws" {
  region = "ap-south-1"
}

# VPC
resource "aws_vpc" "nexabook" {
  cidr_block = "10.0.0.0/16"
  
  tags = {
    Name = "nexabook-vpc"
    Environment = "production"
  }
}

# Subnet
resource "aws_subnet" "public" {
  vpc_id     = aws_vpc.nexabook.id
  cidr_block = "10.0.1.0/24"
  
  tags = {
    Name = "nexabook-public-subnet"
  }
}

# Security Group
resource "aws_security_group" "web" {
  name        = "nexabook-web-sg"
  description = "Allow HTTP/HTTPS"
  vpc_id      = aws_vpc.nexabook.id

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
output "instance_ip" {
  value = aws_instance.web.public_ip
}
```

```bash
# Run
terraform init
terraform plan    # Preview dekho
terraform apply   # Resources banao
terraform destroy # Sab delete karo
```

:::note HANDS-ON: Terraform Plan Output Padho aur Samjho

Ye exercise tumhe dikhayegi ke `terraform plan` output kaise padhte hain — kaunsa resource ban raha hai, kaunsa change ho raha hai, kaunsa delete ho raha hai. Production mein apply se pehle plan samajhna zaroori hai.

:::

```bash
# Step 1: Pehle init karo (agar nahi kiya)
terraform init

# Step 2: Plan chalao aur output save karo
terraform plan -out=tfplan
# OUTPUT mein ye symbols dikhenge:
#   + = resource CREATE hone wala hai (naya banega)
#   ~ = resource CHANGE hone wala hai (update hoga)
#   - = resource DESTROY hone wala hai (delete hoga)
#   -/+ = delete + create (replace)
#   <= read-only (data source)

# Step 3: Plan file padho
terraform show tfplan
# Detailed output dikhayega — har resource ka action

# Step 4: Specific resource check karo
terraform plan -target=aws_instance.web
# Sirf EC2 instance ke changes dikhenge

# Step 5: Destroy plan dekho
terraform plan -destroy
# Sab resources delete hone wale dikhenge

# Step 6: Output format change karo
terraform plan -json=tfplan.json
cat tfplan.json | jq '.resource_changes[] | {address, change: .change.actions}'
# JSON format mein specific actions filter kar sakte ho
```

**Real-world connection:** Islamic Banking FTE ka infrastructure update karte waqt `terraform plan` se pehle verify karo ke sirf EC2 change ho raha hai, database (RDS) untouched hai. Agar RDS bhi delete dikh raha hai to apply mat karo!

:::caution CHECKPOINT:
1. `terraform plan` mein `+` aur `-/+` mein kya fark hai?
2. `-target` flag kab use karoge? Production mein yeh safe hai?
3. `terraform plan -out=tfplan` aur `terraform apply tfplan` ka kya benefit hai?

:::

---

:::tip CONCEPT: Variables & Outputs — Dynamic Infrastructure

:::

```hcl
# File: variables.tf
variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
  
  validation {
    condition     = contains(["dev", "staging", "production"], var.environment)
    error_message = "Environment must be dev, staging, or production"
  }
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t2.micro"
}

variable "allowed_cidrs" {
  description = "Allowed CIDR blocks"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

# File: outputs.tf
output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.nexabook.id
}

output "instance_public_ip" {
  description = "EC2 public IP"
  value       = aws_instance.web.public_ip
}

# File: terraform.tfvars
environment   = "production"
instance_type = "t3.medium"
allowed_cidrs = ["10.0.0.0/8"]
```

:::tip CONCEPT: Data Sources — Existing Resources

:::

```hcl
# AMI find karo
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]
  
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-22.04-amd64-server-*"]
  }
}

# Existing VPC use karo
data "aws_vpc" "existing" {
  filter {
    name   = "tag:Name"
    values = ["existing-vpc"]
  }
}

# Availability zones
data "aws_availability_zones" "available" {
  state = "available"
}

# Use in resource
resource "aws_instance" "web" {
  ami           = data.aws_ami.ubuntu.id  # Dynamic AMI
  instance_type = var.instance_type
}
```

:::caution CHECKPOINT:
1. `terraform plan` aur `terraform apply` mein kya fark hai? Kab `plan` skip kar sakte ho?
2. Variable validation kyun zaroori hai? Kab use karoge?
3. Data source aur resource mein kya fark hai?

:::

---

## Section 3: Terraform State — Sabse Important Concept

:::tip CONCEPT: State = Terraform Ka Memory

State file mein record hota hai ke tumne kya resources banaye hain. Bina state ke Terraform ko nahi pata kya chal raha hai.

:::

```bash
# State dekho
terraform state list
terraform state show aws_instance.web

# State modify mat karo manually!
# Agar resource remove karna ho (Terraform se delete nahi hoga):
terraform state rm aws_instance.web

# Import existing resource:
terraform import aws_instance.web i-1234567890abcdef0

# Move/rename resource:
terraform state mv aws_instance.web aws_instance.web_server
```

:::tip CONCEPT: Remote State — Team Ke Liye Zaroori

Local state file galat hai — team ke liye shared state chahiye.

:::

```hcl
# File: backend.tf
terraform {
  backend "s3" {
    bucket         = "nexabook-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "ap-south-1"
    dynamodb_table = "terraform-locks"
    encrypt        = true
  }
}
```

```bash
# S3 bucket banao
aws s3 mb s3://nexabook-terraform-state

# Versioning enable karo (backup ke liye)
aws s3api put-bucket-versioning \
    --bucket nexabook-terraform-state \
    --versioning-configuration Status=Enabled

# DynamoDB table for locking
aws dynamodb create-table \
    --table-name terraform-locks \
    --attribute-definitions AttributeName=LockID,AttributeType=S \
    --key-schema AttributeName=LockID,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST

# Initialize
terraform init
```

**Why locking?** Agar 2 log ek saath `terraform apply` karein to conflict ho jaata hai. DynamoDB lock ensure karta hai ke sirf 1 person apply kar sake.

:::note HANDS-ON: Remote State (S3 + DynamoDB) Setup aur State Inspect Karo

Ye exercise tumhe dikhayegi ke production-ready remote state kaise setup karte hain aur `terraform state` commands se resources ko inspect karte hain.

:::

```bash
# Step 1: S3 bucket banao (state file ke liye)
aws s3 mb s3://nexabook-terraform-state --region ap-south-1

# Step 2: Versioning enable karo (backup ke liye — zaroori hai)
aws s3api put-bucket-versioning \
    --bucket nexabook-terraform-state \
    --versioning-configuration Status=Enabled

# Step 3: Server-side encryption enable karo
aws s3api put-bucket-encryption \
    --bucket nexabook-terraform-state \
    --server-side-encryption-configuration '{
        "Rules": [{"ApplyServerSideEncryptionByDefault": {"SSEAlgorithm": "AES256"}}]
    }'

# Step 4: Public access block karo (security)
aws s3api put-public-access-block \
    --bucket nexabook-terraform-state \
    --public-access-block-configuration \
        "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

# Step 5: DynamoDB table banao (locking ke liye)
aws dynamodb create-table \
    --table-name terraform-locks \
    --attribute-definitions AttributeName=LockID,AttributeType=S \
    --key-schema AttributeName=LockID,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST

# Step 6: Backend configure karo main.tf mein
cat > backend.tf << 'EOF'
terraform {
  backend "s3" {
    bucket         = "nexabook-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "ap-south-1"
    dynamodb_table = "terraform-locks"
    encrypt        = true
  }
}
EOF

# Step 7: State migrate karo (local se S3 pe)
terraform init -migrate-state
# "Do you want to copy existing state to S3?" -> yes

# Step 8: State list karo (sab resources dekho)
terraform state list
# OUTPUT: aws_instance.web, aws_vpc.nexabook, aws_subnet.public...

# Step 9: Specific resource inspect karo
terraform state show aws_instance.web
# OUTPUT: Detailed info — ami, instance_type, tags, etc.

# Step 10: State pull karo (raw JSON dekhne ke liye)
terraform state pull | jq '.resources[] | select(.type=="aws_instance") | .instances[0].attributes'
# Raw state JSON mein se specific resource filter karo

# Step 11: Agar kisi resource ko Terraform se hatao (delete nahi hogi)
terraform state rm aws_instance.web
# Instance Terraform se hat jayegi lekin AWS pe rahegi

# Step 12: Existing resource import karo
terraform import aws_instance.existing i-1234567890abcdef0
# Agar koi resource manually bana hai use Terraform mein lao
```

**Real-world connection:** Islamic Banking FTE ke infrastructure ka state S3 pe hai — team ke 3 log ek saath kaam kar sakte hain bina conflict ke. DynamoDB lock ensure karta hai ke sirf 1 person `terraform apply` kare.

:::caution CHECKPOINT:
1. `terraform state list` aur `terraform state show` mein kya fark hai?
2. `terraform state rm` aur `terraform destroy` mein kya fark hai?
3. `terraform import` kab use karoge? Real-world mein kahan lagta hai?

:::

---

:::tip CONCEPT: Drift Detection — Manual Changes Track Karo

:::

```bash
# Drift detect karo
terraform plan
# terraform drift dikhata hai kya change hua hai

# Agar kisi ne manually EC2 type change kiya
terraform plan
# - aws_instance.web: has been changed outside of Terraform
#   ~ instance_type = "t2.micro" -> "t3.small"

# Desired state restore karo
terraform apply
# Terraform wapas t2.micro pe set kar dega
```

:::note HANDS-ON: State File Drift Practically Reproduce Karo

Ye exercise tumhe dikhayegi ke drift actually hota kya hai — manually cloud pe change karke `terraform plan` se detect karo, phir restore karo. Ye interview mein bahut poochte hain.

:::

```bash
# Step 1: Pehle infrastructure banao (EC2 instance)
terraform apply -auto-approve

# Step 2: Current state check karo
terraform state show aws_instance.web
# OUTPUT: instance_type = "t2.micro"

# Step 3: AB DRIFT CREATE KARO — AWS Console pe jaake manually change karo
# AWS Console -> EC2 -> Instances -> NexaBook -> Instance Type -> t3.small change karo
# Ya CLI se:
aws ec2 modify-instance-attribute --instance-id $(terraform output -raw instance_id) --instance-type t3.small

# Step 4: Ab terraform plan chalao
terraform plan
# OUTPUT mein dikhega:
# ~ aws_instance.web: has been changed outside of Terraform
#   ~ instance_type = "t2.micro" -> "t3.small"  (desired: t2.micro, actual: t3.small)

# Step 5: Drift restore karo
terraform apply -auto-approve
# OUTPUT: aws_instance.web: Modifying... instance_type: "t3.small" => "t2.micro"
# Terraform wapas t2.micro pe set kar dega

# Step 6: Verify karo ke restore ho gaya
terraform state show aws_instance.web
# OUTPUT: instance_type = "t2.micro" (restored)

# Step 7: State inspect karo
terraform state list
# OUTPUT: aws_instance.web (Terraform ke under manage ho raha hai)

# Step 8: Agar manually kuch delete kar diya (console se)
# EC2 instance terminate karo console se
terraform plan
# OUTPUT: + aws_instance.web: will be created (replacement)
# Terraform naya instance banayega kyunki state mein "exists" tha
```

**Real-world connection:** Islamic Banking FTE ke production servers pe agar kisi ne manually security group change kar diya, to `terraform plan` se turant pata chalega. Agar change authorized hai to code mein bhi update karo, warna `terraform apply` se restore karo.

:::caution CHECKPOINT:
1. Drift detect hone ke baad `terraform apply` se pehle kya check karna chahiye?
2. Agar manually change zaroori hai to Terraform code mein kya karna hoga?
3. `terraform refresh` aur `terraform plan` mein drift detection kaise different hai?

:::

---

:::caution CHECKPOINT:
1. State file kyun important hai? Agar delete ho jaaye to kya hoga?
2. Remote state aur local state mein kya fark hai? Kab local state use karoge?
3. Drift detection kya hai? Agar manual change zaroori ho to kya karoge?

:::

---

## Section 4: Terraform Modules — Reusable Code

:::tip CONCEPT: Module = Terraform Ka Function

:::

```
modules/
+-- vpc/
|   +-- main.tf
|   +-- variables.tf
|   +-- outputs.tf
+-- ec2/
|   +-- main.tf
|   +-- variables.tf
|   +-- outputs.tf
+-- rds/
    +-- main.tf
    +-- variables.tf
    +-- outputs.tf
```

```hcl
# File: modules/vpc/main.tf
variable "cidr_block" {
  description = "VPC CIDR block"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "enable_nat_gateway" {
  description = "Enable NAT Gateway"
  type        = bool
  default     = true
}

resource "aws_vpc" "this" {
  cidr_block = var.cidr_block
  
  tags = {
    Name = "${var.environment}-vpc"
  }
}

resource "aws_subnet" "public" {
  vpc_id     = aws_vpc.this.id
  cidr_block = cidrsubnet(var.cidr_block, 8, 1)
  
  tags = {
    Name = "${var.environment}-public"
  }
}

resource "aws_internet_gateway" "this" {
  vpc_id = aws_vpc.this.id
}

resource "aws_nat_gateway" "this" {
  count         = var.enable_nat_gateway ? 1 : 0
  allocation_id = aws_eip.nat[0].id
  subnet_id     = aws_subnet.public.id
}

resource "aws_eip" "nat" {
  count  = var.enable_nat_gateway ? 1 : 0
  domain = "vpc"
}

output "vpc_id" {
  value = aws_vpc.this.id
}

output "public_subnet_id" {
  value = aws_subnet.public.id
}
```

```hcl
# File: main.tf (using module)
module "vpc" {
  source = "./modules/vpc"
  
  cidr_block         = "10.0.0.0/16"
  environment        = "production"
  enable_nat_gateway = true
}

module "ec2" {
  source = "./modules/ec2"
  
  vpc_id     = module.vpc.vpc_id
  environment = "production"
}

# Community modules
module "vpc_community" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.0.0"
  
  name = "nexabook"
  cidr = "10.0.0.0/16"
  
  azs             = ["ap-south-1a", "ap-south-1b"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]
  
  enable_nat_gateway = true
}
```

:::note HANDS-ON: Reusable Module Banao aur Apply Karo

Ye exercise tumhe dikhayegi ke ek reusable VPC module kaise banate hain aur use multiple environments mein kaise use karte hain. NexaBook ke liye ek VPC module banao.

:::

```bash
# Step 1: Module structure banao
mkdir -p modules/vpc

# Step 2: Module ka main.tf likho
cat > modules/vpc/main.tf << 'EOF'
variable "cidr_block" {
  description = "VPC CIDR block"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "enable_nat_gateway" {
  description = "Enable NAT Gateway"
  type        = bool
  default     = true
}

resource "aws_vpc" "this" {
  cidr_block           = var.cidr_block
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "${var.environment}-vpc"
  }
}

resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.this.id
  cidr_block              = cidrsubnet(var.cidr_block, 8, 1)
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.environment}-public"
  }
}

resource "aws_subnet" "private" {
  vpc_id     = aws_vpc.this.id
  cidr_block = cidrsubnet(var.cidr_block, 8, 2)

  tags = {
    Name = "${var.environment}-private"
  }
}

resource "aws_internet_gateway" "this" {
  vpc_id = aws_vpc.this.id
}

resource "aws_eip" "nat" {
  count  = var.enable_nat_gateway ? 1 : 0
  domain = "vpc"
}

resource "aws_nat_gateway" "this" {
  count         = var.enable_nat_gateway ? 1 : 0
  allocation_id = aws_eip.nat[0].id
  subnet_id     = aws_subnet.public.id
}

output "vpc_id" {
  value = aws_vpc.this.id
}

output "public_subnet_id" {
  value = aws_subnet.public.id
}

output "private_subnet_id" {
  value = aws_subnet.private.id
}
EOF

# Step 3: Module ka variables.tf banao
cat > modules/vpc/variables.tf << 'EOF'
variable "cidr_block" {
  description = "VPC CIDR block"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "enable_nat_gateway" {
  description = "Enable NAT Gateway"
  type        = bool
  default     = true
}
EOF

# Step 4: Module ka outputs.tf banao
cat > modules/vpc/outputs.tf << 'EOF'
output "vpc_id" {
  value = aws_vpc.this.id
}

output "public_subnet_id" {
  value = aws_subnet.public.id
}

output "private_subnet_id" {
  value = aws_subnet.private.id
}
EOF

# Step 5: Main configuration mein module use karo
cat > main.tf << 'EOF'
module "vpc" {
  source = "./modules/vpc"

  cidr_block         = "10.0.0.0/16"
  environment        = "production"
  enable_nat_gateway = true
}

output "vpc_id" {
  value = module.vpc.vpc_id
}

output "public_subnet_id" {
  value = module.vpc.public_subnet_id
}
EOF

# Step 6: Initialize aur apply karo
terraform init
terraform plan
terraform apply -auto-approve

# Step 7: Module outputs verify karo
terraform output
# OUTPUT:
# vpc_id = "vpc-xxx"
# public_subnet_id = "subnet-xxx"
# private_subnet_id = "subnet-xxx"

# Step 8: Agar dev environment bhi chahiye to
cat > dev.tf << 'EOF'
module "vpc_dev" {
  source = "./modules/vpc"

  cidr_block         = "10.1.0.0/16"
  environment        = "development"
  enable_nat_gateway = false  # Dev mein NAT zaroori nahi
}
EOF

terraform apply -auto-approve
# Ab 2 VPCs ban jayengi — production aur development
```

**Real-world connection:** NexaBook ke 3 environments hain (dev, staging, production) — sab ke liye same VPC module use karo sirf different values ke sath. Module ek baar likho, baar baar use karo.

:::caution CHECKPOINT:
1. Module aur resource mein kya fark hai? Kab module banana chahiye?
2. Community modules kahan se milte hain? Kab use karoge?
3. Module versioning kaise karte hain? (Hint: Git tags)

:::

---

## Section 5: Terraform Advanced — Loops, Conditionals & Workspaces

:::tip CONCEPT: Loops — Multiple Resources Ek Baar Mein

:::

```hcl
# count — number of resources
resource "aws_instance" "web" {
  count         = 3
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
  
  tags = {
    Name = "nexabook-web-${count.index}"
  }
}

# for_each — map/set se resources
variable "instances" {
  default = {
    web = "t2.micro"
    api = "t3.small"
    db  = "t3.medium"
  }
}

resource "aws_instance" "servers" {
  for_each      = var.instances
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = each.value
  
  tags = {
    Name = "nexabook-${each.key}"
  }
}

# Dynamic blocks
variable "ingress_rules" {
  default = [
    { port = 80, cidr = "0.0.0.0/0" },
    { port = 443, cidr = "0.0.0.0/0" },
    { port = 22, cidr = "10.0.0.0/8" },
  ]
}

resource "aws_security_group" "web" {
  name = "nexabook-web-sg"
  
  dynamic "ingress" {
    for_each = var.ingress_rules
    content {
      from_port   = ingress.value.port
      to_port     = ingress.value.port
      protocol    = "tcp"
      cidr_blocks = [ingress.value.cidr]
    }
  }
}
```

:::tip CONCEPT: Conditionals & Locals

:::

```hcl
# Locals — computed values
locals {
  instance_type = var.environment == "production" ? "t3.medium" : "t2.micro"
  
  common_tags = {
    Environment = var.environment
    Project     = "nexabook"
    ManagedBy   = "terraform"
  }
}

# Conditional resource
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = local.instance_type
  
  tags = merge(local.common_tags, {
    Name = "nexabook-web"
  })
}

# Conditional resource creation
resource "aws_eip" "nat" {
  count  = var.environment == "production" ? 1 : 0
  domain = "vpc"
}
```

:::tip CONCEPT: Workspaces — Environment Management

:::

```bash
# Workspaces
terraform workspace list
terraform workspace new staging
terraform workspace new production
terraform workspace select staging
terraform workspace show

# Workspace-specific values
terraform workspace select production
terraform apply -var="instance_type=t3.medium"
```

```hcl
# File: main.tf (workspace-based)
resource "aws_instance" "web" {
  instance_type = terraform.workspace == "production" ? "t3.medium" : "t2.micro"
  
  tags = {
    Name = "nexabook-${terraform.workspace}"
  }
}
```

:::caution CHECKPOINT:
1. `count` aur `for_each` mein kya fark hai? Kab kaunsa use karoge?
2. Locals aur variables mein kya fark hai?
3. Workspaces aur separate state files mein kya fark hai?

:::

---

## Section 6: Terraform Best Practices — Production Ready

```hcl
# 1. Variables with validation
variable "environment" {
  type        = string
  description = "Environment name"
  
  validation {
    condition     = contains(["dev", "staging", "production"], var.environment)
    error_message = "Environment must be dev, staging, or production"
  }
}

# 2. Lifecycle rules
resource "aws_instance" "web" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = "t2.micro"
  
  lifecycle {
    create_before_destroy = true
    prevent_destroy       = true  # Never delete accidentally
    ignore_changes        = [tags]  # Tags manual change ho sakte hain
  }
}

# 3. Moved blocks (rename without delete+create)
moved {
  from = aws_instance.web
  to   = aws_instance.web_server
}

# 4. Import existing resources
import {
  to = aws_instance.web
  id = "i-1234567890abcdef0"
}
```

:::note HANDS-ON: Full Stack with Terraform

:::

```hcl
# File: main.tf — NexaBook Production Infrastructure
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  backend "s3" {
    bucket = "nexabook-terraform-state"
    key    = "prod/terraform.tfstate"
    region = "ap-south-1"
    dynamodb_table = "terraform-locks"
    encrypt = true
  }
}

provider "aws" {
  region = "ap-south-1"
}

locals {
  common_tags = {
    Environment = "production"
    Project     = "nexabook"
    ManagedBy   = "terraform"
  }
}

# VPC
module "vpc" {
  source = "./modules/vpc"
  
  cidr_block         = "10.0.0.0/16"
  environment        = "production"
  enable_nat_gateway = true
}

# EC2
module "ec2" {
  source = "./modules/ec2"
  
  vpc_id         = module.vpc.vpc_id
  subnet_id      = module.vpc.public_subnet_id
  instance_type  = "t3.medium"
  environment    = "production"
  common_tags    = local.common_tags
}

# RDS
module "rds" {
  source = "./modules/rds"
  
  vpc_id         = module.vpc.vpc_id
  subnet_ids     = module.vpc.private_subnet_ids
  environment    = "production"
  common_tags    = local.common_tags
}

output "ec2_public_ip" {
  value = module.ec2.public_ip
}

output "rds_endpoint" {
  value = module.rds.endpoint
}
```

---

## Section 7: Ansible Basics — Configuration Management

:::tip CONCEPT: Ansible = Server Ko Configure Karo

Terraform se server banao, Ansible se server pe sab kuch install aur configure karo.

:::

```bash
# Install
sudo apt update
sudo apt install ansible

# Verify
ansible --version

# Ad-hoc commands
ansible all -i inventory.ini -m ping
ansible web -i inventory.ini -m shell -a "uptime"
```

:::tip CONCEPT: Inventory = Servers Ki List

:::

```ini
# File: inventory.ini
[web]
server1 ansible_host=192.168.1.100
server2 ansible_host=192.168.1.101

[database]
db1 ansible_host=192.168.1.200

[all:vars]
ansible_user=ali
ansible_ssh_private_key_file=~/.ssh/id_rsa
ansible_python_interpreter=/usr/bin/python3
```

```yaml
# File: inventory.yml (dynamic inventory)
all:
  children:
    web:
      hosts:
        server1:
          ansible_host: 192.168.1.100
        server2:
          ansible_host: 192.168.1.101
    database:
      hosts:
        db1:
          ansible_host: 192.168.1.200
  vars:
    ansible_user: ali
    ansible_ssh_private_key_file: ~/.ssh/id_rsa
```

:::tip CONCEPT: Playbook = Configuration Steps

:::

```yaml
# File: playbook.yml
---
- name: Configure web servers
  hosts: web
  become: yes
  
  vars:
    http_port: 80
    app_name: nexabook
  
  tasks:
    - name: Install required packages
      apt:
        name:
          - nginx
          - python3
          - python3-pip
        state: present
        update_cache: yes
    
    - name: Copy nginx config
      template:
        src: templates/nginx.conf.j2
        dest: /etc/nginx/sites-available/default
      notify: restart nginx
    
    - name: Ensure nginx is running
      service:
        name: nginx
        state: started
        enabled: yes
    
    - name: Create app directory
      file:
        path: /opt/{{ app_name }}
        state: directory
        owner: www-data
        group: www-data
        mode: '0755'
  
  handlers:
    - name: restart nginx
      service:
        name: nginx
        state: restarted
```

```bash
# Run playbook
ansible-playbook -i inventory.ini playbook.yml

# Dry run
ansible-playbook -i inventory.ini playbook.yml --check

# Verbose
ansible-playbook -i inventory.ini playbook.yml -vvv

# Specific task
ansible-playbook -i inventory.ini playbook.yml --tags "nginx"

# Limit to specific host
ansible-playbook -i inventory.ini playbook.yml --limit server1
```

:::note HANDS-ON: Playbook Idempotency Test — Do Baar Run Karo

Ye exercise tumhe dikhayegi ke Ansible idempotent hai — doosri baar run karne pe "changed=0" aana chahiye agar sab already configured hai. Ye production mein zaroori hai — baar baar run karne pe kuch change nahi hona chahiye.

:::

```bash
# Step 1: Inventory banao
cat > inventory.ini << 'EOF'
[web]
server1 ansible_host=192.168.1.100 ansible_user=ali ansible_ssh_private_key_file=~/.ssh/id_rsa
EOF

# Step 2: Playbook banao
cat > playbook.yml << 'EOF'
---
- name: Configure NexaBook web server
  hosts: web
  become: yes

  vars:
    app_name: nexabook
    http_port: 80

  tasks:
    - name: Install required packages
      apt:
        name:
          - nginx
          - python3
          - curl
        state: present
        update_cache: yes
      register: packages_installed

    - name: Ensure nginx is running
      service:
        name: nginx
        state: started
        enabled: yes

    - name: Create app directory
      file:
        path: /opt/{{ app_name }}
        state: directory
        owner: www-data
        group: www-data
        mode: '0755'

    - name: Copy nginx config
      template:
        src: templates/nginx.conf.j2
        dest: /etc/nginx/sites-available/default
      notify: restart nginx

  handlers:
    - name: restart nginx
      service:
        name: nginx
        state: restarted
EOF

# Step 3: Template banao
mkdir -p templates
cat > templates/nginx.conf.j2 << 'EOF'
server {
    listen {{ http_port }};
    server_name _;

    location / {
        root /opt/{{ app_name }};
        index index.html;
    }
}
EOF

# Step 4: PEHLI BAAR run karo — changes dikhenge
ansible-playbook -i inventory.ini playbook.yml
# OUTPUT:
# TASK [Install required packages] ***
# changed: [server1]    <-- Packages install hue
#
# TASK [Ensure nginx is running] ***
# changed: [server1]    <-- nginx start hua
#
# TASK [Create app directory] ***
# changed: [server1]    <-- directory bani
#
# PLAY RECAP ***
# server1: ok=4  changed=3  unreachable=0  failed=0

# Step 5: DOSRI BAAR run karo — "changed=0" hona chahiye
ansible-playbook -i inventory.ini playbook.yml
# OUTPUT:
# TASK [Install required packages] ***
# ok: [server1]        <-- already installed (idempotent!)
#
# TASK [Ensure nginx is running] ***
# ok: [server1]        <-- already running (idempotent!)
#
# TASK [Create app directory] ***
# ok: [server1]        <-- already exists (idempotent!)
#
# PLAY RECAP ***
# server1: ok=4  changed=0  unreachable=0  failed=0
#                     ^^^^^
#                     changed=0 = perfect idempotency!

# Step 6: Verify karo ke sab sahi hai
ansible web -i inventory.ini -m shell -a "systemctl status nginx"
ansible web -i inventory.ini -m shell -a "ls -la /opt/nexabook"

# Step 7: Agar manually kuch bigaad do (nginx band karo)
ansible web -i inventory.ini -m shell -a "systemctl stop nginx"

# Step 8: Phir run karo — sirf nginx restart hoga
ansible-playbook -i inventory.ini playbook.yml
# OUTPUT:
# TASK [Ensure nginx is running] ***
# changed: [server1]    <-- sirf yeh change hua
#
# PLAY RECAP ***
# server1: ok=4  changed=1  unreachable=0  failed=0
#                     ^^^^^
#                     changed=1 = sirf nginx restart hua
```

**Real-world connection:** Islamic Banking FTE ka playbook jab baar baar run hota hai to sirf actual changes apply hote hain. Agar koi package already installed hai to dobara install nahi hoga — idempotency = reliability.

:::caution CHECKPOINT:
1. `changed=0` ka kya matlab hai? Kab "changed=1" aayega?
2. `register` keyword kya karta hai? Kab use karoge?
3. Agar koi task idempotent nahi hai to kya karte hain? (Hint: `creates`, `removes`)

:::

---

:::caution CHECKPOINT:
1. Ansible aur Chef/Puppet mein kya fark hai? (Hint: agent vs agentless)
2. `become: yes` ka kya matlab hai? Kab zaroori hai?
3. Handlers kab run hote hain?

:::

---

## Section 8: Ansible Advanced — Vault, Templates & Roles

:::tip CONCEPT: Ansible Vault = Secrets Management

:::

```bash
# Encrypted file banao
ansible-vault create secrets.yml

# Existing file encrypt karo
ansible-vault encrypt inventory.yml

# Decrypt
ansible-vault decrypt secrets.yml

# Edit encrypted file
ansible-vault edit secrets.yml

# View
ansible-vault view secrets.yml

# Run playbook with vault
ansible-playbook -i inventory.ini playbook.yml --ask-vault-pass
ansible-playbook -i inventory.ini playbook.yml --vault-password-file ~/.vault_pass
```

```yaml
# File: secrets.yml (encrypted)
---
db_password: "supersecret123"
api_key: "ak_xxxxxxxxxxxx"
```

:::note HANDS-ON: Ansible Vault se Secrets Encrypt/Decrypt Practically Karo

Ye exercise tumhe dikhayegi ke production mein database passwords, API keys ko kaise secure rakhte hain. Vault se encrypt karo, playbook mein use karo, aur verify karo ke plaintext kabhi disk pe nahi hota.

:::

```bash
# Step 1: Password file banao (vault password store karne ke liye)
echo "MyVaultPass123!" > ~/.vault_pass
chmod 600 ~/.vault_pass

# Step 2: Encrypted secrets file banao
ansible-vault create secrets.yml --vault-password-file ~/.vault_pass
# Editor khulega — ye likho:
# ---
# db_password: "IslamicBanking@2026"
# api_key: "sk-nexabook-prod-2026"
# jwt_secret: "super-secret-jwt-key"

# Step 3: Verify — file encrypted hai
cat secrets.yml
# OUTPUT: $ANSIBLE_VAULT;1.1;AES256
#         61626364656667686930313233343536373839...
#         (plaintext nahi dikhega)

# Step 4: Decrypt karo aur dekho
ansible-vault view secrets.yml --vault-password-file ~/.vault_pass
# OUTPUT: plaintext dikhega

# Step 5: Edit karo
ansible-vault edit secrets.yml --vault-password-file ~/.vault_pass
# Editor khulega — changes kar sakte ho

# Step 6: Playbook banao jo vault secrets use kare
cat > deploy.yml << 'EOF'
---
- name: Deploy NexaBook with secrets
  hosts: web
  become: yes

  vars_files:
    - secrets.yml

  tasks:
    - name: Create database config
      template:
        src: templates/db.conf.j2
        dest: /opt/nexabook/db.conf
        owner: www-data
        mode: '0600'

    - name: Create environment file
      copy:
        content: |
          DB_PASSWORD={{ db_password }}
          API_KEY={{ api_key }}
          JWT_SECRET={{ jwt_secret }}
        dest: /opt/nexabook/.env
        owner: www-data
        mode: '0600'
EOF

# Step 7: Template banao
mkdir -p templates
cat > templates/db.conf.j2 << 'EOF'
[database]
host=localhost
port=5432
name=islamic_banking
user=admin
password={{ db_password }}
EOF

# Step 8: Playbook run karo (vault password dijiye)
ansible-playbook -i inventory.ini deploy.yml --ask-vault-pass
# Prompt aayega: Vault password: MyVaultPass123!

# Step 9: Ya password file se (automation ke liye)
ansible-playbook -i inventory.ini deploy.yml --vault-password-file ~/.vault_pass

# Step 10: Verify — secrets files create ho gayin
ansible web -i inventory.ini -m shell -a "cat /opt/nexabook/db.conf"
ansible web -i inventory.ini -m shell -a "cat /opt/nexabook/.env"

# Step 11: Verify — permissions sahi hain
ansible web -i inventory.ini -m shell -a "ls -la /opt/nexabook/"

# Step 12: Agar secrets change karne ho
ansible-vault encrypt_string "NewPassword2026!" --vault-password-file ~/.vault_pass --name 'db_password'
# OUTPUT: db_password: !vault |
#          $ANSIBLE_VAULT;1.1;AES256
#          ...
# Ye output ko secrets.yml mein paste karo

# Step 13: Multiple vault IDs (different environments ke liye)
ansible-vault create --vault-id prod@prompt secrets_prod.yml
ansible-vault create --vault-id dev@prompt secrets_dev.yml
ansible-playbook deploy.yml --vault-id prod@prompt --vault-id dev@prompt
```

**Real-world connection:** Islamic Banking FTE ka database password, API keys — sab Vault mein encrypted hain. Git pe commit karo (encrypted), production pe decrypt karo. Plaintext kabhi disk pe nahi hota.

:::caution CHECKPOINT:
1. `ansible-vault create` aur `ansible-vault encrypt` mein kya fark hai?
2. Vault password file ko kaise secure rakhte hain? Production mein kya use karte hain? (Hint: AWS Secrets Manager)
3. Agar ek hi playbook mein different environments ke secrets hon to kaise manage karoge?

:::

---

:::tip CONCEPT: Jinja2 Templates

:::

```jinja2
# File: templates/nginx.conf.j2
server {
    listen {{ http_port }};
    server_name {{ server_name }};

    location / {
        proxy_pass http://127.0.0.1:{{ app_port }};
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

{% if ssl_enabled %}
    listen 443 ssl;
    ssl_certificate /etc/ssl/{{ server_name }}.crt;
    ssl_certificate_key /etc/ssl/{{ server_name }}.key;
{% endif %}
}
```

:::tip CONCEPT: Roles — Organized Playbooks

:::

```yaml
# roles/nginx/tasks/main.yml
---
- name: Install nginx
  apt:
    name: nginx
    state: present
  tags: [nginx, install]

- name: Copy nginx config
  template:
    src: nginx.conf.j2
    dest: /etc/nginx/nginx.conf
  notify: restart nginx
  tags: [nginx, config]

# roles/nginx/handlers/main.yml
---
- name: restart nginx
  service:
    name: nginx
    state: restarted

# site.yml (main playbook)
---
- name: Configure web servers
  hosts: web
  become: yes
  roles:
    - common
    - nginx
    - app
```

:::tip CONCEPT: Loops & Conditionals

:::

```yaml
# Loops
- name: Install multiple packages
  apt:
    name: "{{ item }}"
    state: present
  loop:
    - nginx
    - python3
    - redis

# Or
- name: Install packages
  apt:
    name:
      - nginx
      - python3
      - redis
    state: present

# Conditionals
- name: Install nginx on web servers
  apt:
    name: nginx
    state: present
  when: inventory_hostname in groups['web']

- name: Restart service
  service:
    name: "{{ service_name }}"
    state: restarted
  when: config_changed | bool

# Error handling
- name: Try to start service
  service:
    name: nginx
    state: started
  register: result
  ignore_errors: yes

- name: Debug if failed
  debug:
    msg: "Service failed to start: {{ result.msg }}"
  when: result is failed
```

:::caution CHECKPOINT:
1. Ansible Vault kaise kaam karta hai? Key kahan store hoti hai?
2. Template aur copy module mein kya fark hai?
3. Roles aur plain playbooks mein kya fark hai?

:::

---

## Section 9: Terraform + Ansible — Production Workflow

:::tip CONCEPT: Terraform + Ansible = Complete Automation

:::

```bash
# Workflow:
# 1. Terraform se infrastructure banao
terraform apply -auto-approve

# 2. Terraform se inventory generate karo
terraform output -json > tf_output.json

# 3. Ansible se servers configure karo
ansible-playbook -i inventory.ini site.yml

# 4. Verify
curl http://$(terraform output -raw instance_ip)/health
```

```hcl
# Terraform output se Ansible inventory generate
resource "local_file" "inventory" {
  filename = "../ansible/inventory.ini"
  content  = <<EOF
[web]
${aws_instance.web.public_ip} ansible_user=ali

[database]
${aws_instance.db.private_ip} ansible_user=ali
EOF
}
```

:::note HANDS-ON: Islamic Banking FTE — Full Automation

:::

```bash
# Step 1: Infrastructure
cd terraform/
terraform apply -auto-approve

# Step 2: Configure servers
cd ../ansible/
ansible-playbook -i inventory.ini site.yml

# Step 3: Deploy app
ansible-playbook -i inventory.ini deploy.yml

# Step 4: Verify
curl http://$(cd ../terraform && terraform output -raw api_ip)/health
```

:::caution CHECKPOINT:
1. Terraform aur Ansible ko ek saath kaise use karoge?
2. Server provisioning aur configuration alag-alag kyun karte hain?

:::

---

## Summary: Phase 8 Key Takeaways

| Concept | Tumne Kya Seekha |
|---------|-----------------|
| IaC | Infrastructure = Code (repeatable, version-controlled) |
| Terraform | `init`, `plan`, `apply`, `destroy`, variables, outputs |
| State | Local vs Remote (S3 + DynamoDB locking), drift detection |
| Modules | Reusable code, composable infrastructure |
| Loops | `count`, `for_each`, dynamic blocks |
| Workspaces | Environment management (dev/staging/prod) |
| Ansible | Inventory, playbooks, roles, handlers, vault |
| Templates | Jinja2 templating |
| Idempotency | Run multiple times, same result |
| Production | Terraform (infra) + Ansible (config) workflow |

---

## MINI-TASKS

### Task 1: Terraform Module (20 min)
VPC module banao jo:
- VPC create kare
- Public + private subnet create kare
- NAT Gateway enable kare
- Security group create kare
- Outputs return kare

### Task 2: Ansible Playbook (15 min)
Nginx installation playbook banao jo:
- Nginx install kare
- Custom config copy kare (template)
- Service start kare
- Idempotent ho

### Task 3: Full Stack (20 min)
Terraform + Ansible se:
- EC2 instance banao
- Ansible se Nginx install karo
- Health check verify karo

### Task 4: Vault (10 min)
Ansible Vault se:
- Encrypted secrets file banao
- Playbook mein use karo
- `--ask-vault-pass` se run karo

---

## INCIDENT.md: Practice Scenarios

### Incident #1: State File Corruption
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

### Incident #2: Ansible Playbook Fails
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

### Incident #3: Terraform Drift
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

### Incident #4: Terraform Apply Fails — Dependency Error
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

### Incident #5: Ansible SSH Connection Fails
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
