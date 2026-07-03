---
sidebar_position: 11
title: "PHASE 8: Infrastructure as Code (Terraform) + Config Management (Ansible)"
description: "*Est. Time: 4-6 weeks*"
---

# PHASE 8: Infrastructure as Code (Terraform) + Config Management (Ansible)
*Est. Time: 4-6 weeks*

### Terraform — Kya seekhna hai
- Providers, resources, state management
- Modules, workspaces, remote state (locking)
- `plan`, `apply`, `destroy` lifecycle
- Import, drift detection

### Ansible — Kya seekhna hai
- Inventory, playbooks, roles, modules
- Idempotency, variables, templates

### Free Resources
| Resource | Link |
|---|---|
| **"Terraform Course"** — TechWorld with Nana | https://www.youtube.com/@TechWorldwithNana |
| **"Terraform Full Course"** — freeCodeCamp.org | https://www.youtube.com/@freecodecamp |
| **Official Terraform Tutorials** | https://developer.hashicorp.com/terraform/tutorials |
| **"Ansible Full Course"** — freeCodeCamp.org | https://www.youtube.com/@freecodecamp |
| **Official Ansible Docs** | https://docs.ansible.com |

### Hands-on Checklist
- [ ] Reusable Terraform module + remote state (S3/Azure Blob + locking)
- [ ] `plan/apply/destroy` lifecycle on real infra
- [ ] Ansible playbook: server config + idempotency check
- [ ] Ansible playbook se Nginx install aur configure karo

### Incident Practice
- Syntax/provider error fix karke re-apply
- State conflict/drift resolve karo (`refresh`/`import`)
- Playbook failure debug karo (idempotency check)

### Meri Recommendation
Terraform priority do (industry standard, multi-cloud). Ansible basics-level rakho.

---

*Back to [MERGED-ROADMAP.md](/docs/roadmap)*
