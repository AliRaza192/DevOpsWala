---
sidebar_position: 2
title: "Phase 0: Teaching — Computer & Mindset Foundations"
description: "Computer architecture, internet, file systems, keyboard shortcuts, AI era mindset — detailed teaching content"
---

# PHASE 0: Computer & Mindset Foundations — TEACHING

> **Tumhara level:** Tum already Linux/Git/AI-agents use kar rahe ho. Is phase ka asal value sirf 2 cheezein hain: (1) kuch gaps fill karna jo tumhe pata bhi nahi ke hain, aur (2) AI-era mindset jo tumhare career ko define karega.

---

## Section 1: Computer Architecture — Quick Summary

Tumhara computer ek factory jaisa hai: **CPU** (manager — decisions leta hai), **RAM** (working table — jo kaam abhi ho raha hai), **Storage** (warehouse — sab saved rehta hai), **OS** (Linux/Windows — rule book). Tum already `top`, `free -h`, `df -h` jaante ho — ye sab tumhare computer ki real-time health report hain. Agar koi process 100% CPU pe ho to system slow hota hai. SSD HDD se 10x fast hota hai is liye Kubernetes clusters mein SSD preferred hai.

---

## Section 2: Internet — Quick Summary

Jab tum `curl https://api.nexabook.com/health` chalate ho — tum **client** ho (curl), NexaBook ka server hai. Ye **client-server model** hai. **DNS** phonebook hai jo domain ko IP mein convert karta hai. **HTTP/HTTPS** language hai jo client-server mein baat karti hai. Har service ek **port** pe chalti hai (HTTP 80, HTTPS 443, SSH 22). Agar response `200 OK` aaye to sab theek hai, `503` aaye to server down hai.

---

## Section 3: Files, Folders & Extensions (Beginner)

:::tip CONCEPT: File System — Tumhara Digital Filing Cabinet

Har computer mein files aur folders hote hain. Linux mein ye ek **tree** ki tarah hai:

```
/ (root — sab kuch yahan se shuru hota hai)
├── home/
│   └── ali/
│       ├── Documents/
│       │   ├── roadmap.md
│       │   └── project.py
│       └── Downloads/
├── etc/     (system configuration)
├── var/     (logs, temporary data)
└── usr/     (programs, installed software)
```

**File extensions** batate hain ke file kis cheez ki hai:
- `.py` → Python code
- `.md` → Markdown (text formatting)
- `.sh` → Shell script
- `.yaml` / `.yml` → Configuration file (Kubernetes, CI/CD)
- `.json` → Data interchange format
- `.txt` → Plain text
- `.pdf` → Document

**Real-world connection:** Tumhara `MERGED-ROADMAP.md` ek Markdown file hai. Tumhare Islamic Banking FTE ke config files `.yaml` ya `.json` honge. Jab CI/CD pipeline chalti hai, wo `.github/workflows/main.yml` file padhti hai.
:::

:::note HANDS-ON: Files Ko Handle Karo

```bash
# Naya file banao
touch test-file.txt

# File mein kuch likho
echo "Ye mera pehla file hai" > test-file.txt

# File ka content dekho
cat test-file.txt

# File rename karo
mv test-file.txt renamed-file.txt

# File copy karo
cp renamed-file.txt backup-file.txt

# File delete karo
rm backup-file.txt

# Folder banao
mkdir test-folder

# File folder mein move karo
mv renamed-file.txt test-folder/

# Folder delete karo (sirf agar khali ho)
rmdir test-folder
```
:::

:::caution CHECKPOINT:
1. `>` aur `>>` mein kya fark hai? Ek baar try karo aur dekho output mein kya badalta hai.
2. `rm -r test-folder` kya karega? `rm -rf test-folder` kya karega? Dono mein kya fark hai?
:::

---

## Section 4: Keyboard Shortcuts & Typing (Beginner)

:::tip CONCEPT: Speed = Productivity

DevOps engineer ka zyada tar waqt terminal mein guzarta hai. Agar tumhe type karne mein 2 minute lagenge ek command likhne mein, tumhara flow toot jayega.

**Essential shortcuts (Linux terminal):**
- `Ctrl + R` — command history search (sabse useful)
- `Ctrl + C` — running command band karo
- `Ctrl + Z` — command ko background mein bhejo
- `Ctrl + A` — line ke shuru mein jao
- `Ctrl + E` — line ke end mein jao
- `Ctrl + U` — poori line delete karo
- `Tab` — auto-complete (command aur file names)

**Typing practice:** https://monkeytype.com — daily 10 minutes. Target: 40+ WPM with 95%+ accuracy.
:::

:::note HANDS-ON: Shortcuts Practice Karo

Terminal mein ye karo:

```bash
# Ek lamba command type karo
echo "This is a long command that I want to practice navigation with"

# Ab Ctrl+A press karo — cursor shuru mein chala jayega
# Ab Ctrl+E press karo — cursor end mein chala jayega
# Ab Ctrl+U press karo — poori line delete ho jayegi
# Ab Ctrl+R press karo aur "echo" type karo — purana command mil jayega
```
:::

:::caution CHECKPOINT:
1. `Ctrl + C` aur `Ctrl + Z` mein kya fark hai? Kab `C` use karna chahiye aur kab `Z`?
:::

---

## Section 5: AI Era Mindset — Sabse Important Section (Advanced → Expert)

> **Ye section tumhare poore career ko define karega.** Baaki sab tools hain, ye mindset hai.

:::tip CONCEPT: Tum Coder Nahi Ho — Tum Director Ho

Purana way:
```
Human sochta hai → Human code likhta hai → Human test karta hai → Deploy
```

Naya way (2026):
```
Human sochta hai (Director) → AI code likhta hai (Worker) → Human verify karta hai (Quality Check) → Deploy
```

Ye transformation samajhna zaroori hai. Tum abhi tak shayad ye kar rahe ho:
- Claude Code CLI se code generate karwate ho
- OpenCode CLI se agents chalate ho
- AI se code likhwate ho aur phir fix karte ho

**Ye exactly sahi approach hai.** Tum "architect/director" model pe kaam kar rahe ho. Ab isko formalize karo.
:::

:::tip CONCEPT: Three Modes of AI Development

AgentFactory ye three modes describe karta hai:

**Mode 1: AI-Assisted** (Tum abhi yahan ho)
- Tum code likhte ho, AI help karta hai (autocomplete, suggestions)
- Example: GitHub Copilot, basic ChatGPT

**Mode 2: AI-Driven** (Agla level)
- Tum specify karte ho "kya chahiye", AI poora code likhta hai
- Tum verify karte ho, fix karte ho
- Example: Claude Code se full features build karna

**Mode 3: AI-Native** (Ultimate level)
- Poora application AI ke sath design hota hai
- Types pehle aate hain, tests pehle aate hain, AI implementation generate karta hai
- Example: Spec-Driven Development

**Real-world connection:** Tumhara Islamic Banking FTE — agar tumne usko Spec-Driven Development se banaya hota (pehle types define karo, phir AI se implementation), to debugging aasan hoti. Ye exactly AgentFactory AI-251 course sikhata hai.
:::

:::note HANDS-ON: AI ko Director ki tarah Use Karo

Ye exercise karo — apne kisi existing project pe:

1. **Step 1: Spec likho** (5 minute)
   ```
   # Feature: Health Check Endpoint
   
   ## Input: None
   ## Output: JSON with status, timestamp, version
   ## Behavior: 
   - Return 200 if all services up
   - Return 503 if any service down
   - Include response time in milliseconds
   ```

2. **Step 2: AI ko ye spec do** aur bolo "ye implement karo"
   - Claude Code ya OpenCode CLI use karo

3. **Step 3: Verify karo**
   - Kya output exactly wahi hai jo spec mein tha?
   - Edge cases handle ho rahe hain?
   - Tests likhe gaye hain?

4. **Step 4: Document karo**
   - `INCIDENT.md` mein likho: kya acha hua, kya nahi, kya seekha
:::

:::tip CONCEPT: Context Engineering — AI Ko Sahari Dena

AI tab best kaam karta hai jab usko sahi context ho. Ye "Context Engineering" hai.

**Bad context:**
```
Mujhe ek API banao
```

**Acha context:**
```
Mujhe ek FastAPI endpoint chahiye:
- Route: GET /api/v1/health
- Response format: {"status": "healthy", "timestamp": "ISO8601", "version": "1.0.0"}
- Agar PostgreSQL connection ho to status "healthy", nahi to "degraded"
- Include response time in milliseconds
- Use async/await pattern
- Add proper error handling with try/except
- Include type hints (Python 3.10+)
```

**Real-world connection:** Tumhare NexaBook mein jab bhi tum AI se koi feature mangte ho, pehle ek clear spec likho. Tumhare paas `SKILL.md` aur `CLAUDE.md` files hain — ye exactly context engineering hain. Inko aur structured banao.
:::

:::note HANDS-ON: Context Engineering Practice

Apne kisi project ke liye ye template use karo:

```markdown
## Feature Request

### What I want:
[1-2 lines mein clearly bolo]

### Context:
- Tech stack: [Python/FastAPI/PostgreSQL/etc.]
- Existing code: [kahan hai, kya karta hai]
- Constraints: [performance, security, compatibility]

### Expected behavior:
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Edge cases to handle:
- [Case 1]
- [Case 2]

### Output format:
[JSON structure, API response, etc.]
```

Ye template AI ko exactly batata hai ke kya karna hai. Isko apne daily workflow mein use karo.
:::

:::caution CHECKPOINT:
1. Tum abhi "AI-Assisted" mode mein ho ya "AI-Driven" mode mein? Real examples do apne current workflow se.
2. Agar tumhe ek "Digital FTE" (AI worker) banana ho jo tumhare Islamic Banking FTE ke customers ke questions jawab de, to tumhara spec kaisa hoga? 3 bullet points mein likho.
:::

:::tip CONCEPT: Prompt Engineering Basics — Zero-Shot, Few-Shot, Chain-of-Thought

Prompt engineering sirf "achi tarah likho" nahi hai — ye **technique** hai. Teen main techniques hain:

**1. Zero-Shot Prompting** — Bina koi example diye, seedha sawal pucho:

```
Classify this customer review as positive, negative, or neutral:
"The food was amazing but the service was very slow."
```

AI ko koi example nahi diya — usne apni samajh se jawab diya.

**2. Few-Shot Prompting** — 2-3 examples do taake AI samajh jaye pattern kya hai:

```
Classify reviews:

Review: "Great product, love it!" → Positive
Review: "Waste of money, broke in 2 days" → Negative
Review: "It's okay, nothing special" → Neutral

Now classify: "The food was amazing but the service was very slow."
```

AI ne examples se pattern seekha aur better answer diya.

**3. Chain-of-Thought (CoT) Prompting** — AI ko "sochne" ke liye bolo, seedha answer mat lo:

```
A train travels 120 km in 2 hours. Then it travels 180 km in 3 hours.
What is the average speed for the entire journey?

Think step by step.
```

Ye "Think step by step" magic phrase hai. AI pehle sochega, phir answer dega — accuracy badhti hai.

**Real-world connection:** Tumhare Islamic Banking FTE mein customer queries aati hain. Agar tumhe classification karni hai (loan inquiry, complaint, general question), to few-shot prompting use karo — 3-4 examples do aur AI automatically classify karega. Agar koi complex calculation hai (e.g., "Mujhe 5 lakh ka loan chahiye 3 saal ke liye, markup kitna hoga?"), to Chain-of-Thought use karo — AI step by step calculate karega.
:::

:::note HANDS-ON: Prompt Techniques Practice Karo

Ek hi query ko teeno techniques se likho aur output compare karo:

```bash
# Zero-Shot
echo "Convert this to YAML: app name is myapp, version is 1.0, port is 8080"

# Few-Shot
echo "Convert to YAML:
Input: name is nginx, port is 80 → Output: name: nginx\nport: 80
Input: name is redis, port is 6379 → Output: name: redis\nport: 6379
Input: app name is myapp, version is 1.0, port is 8080 → Output:"

# Chain-of-Thought
echo "Convert this to YAML: app name is myapp, version is 1.0, port is 8080
Think about: what are the keys, what are the values, proper YAML indentation?"
```

**Checkpoint:** Zero-shot vs few-shot mein output mein kya fark aaya? Kab zero-shot kaafi hai, kab few-shot zaroori hai?
:::

---

## Section 6: File Extensions & Config Files (Intermediate)

:::tip CONCEPT: Extensions matter karte hain

Har file type ka ek purpose hai. DevOps mein ye extensions daily aayengi:

| Extension | Purpose | Kab use hoga |
|-----------|---------|-------------|
| `.md` | Markdown | Documentation, README |
| `.yaml` / `.yml` | Configuration | K8s manifests, CI/CD |
| `.json` | Data format | API responses, configs |
| `.py` | Python | Automation scripts, agents |
| `.sh` | Shell script | Linux automation |
| `.tf` | Terraform | Infrastructure as Code |
| `.dockerfile` | Docker | Container images |
| `.env` | Environment vars | Secrets, config |

**Real-world connection:** Tumhare Islamic Banking FTE mein `.env` file mein database URL hoga, `.yaml` files mein deployment configs hongi, `.py` files mein agent logic hoga.
:::

:::note HANDS-ON: Config Files Ko Samjho

```bash
# Naya YAML file banao
cat > test-config.yaml << 'EOF'
app:
  name: "MyApp"
  version: "1.0.0"
  debug: false

database:
  host: "localhost"
  port: 5432
  name: "myapp_db"

features:
  - "auth"
  - "logging"
  - "metrics"
EOF

# YAML validate karo (Python se)
python3 -c "import yaml; print(yaml.safe_load(open('test-config.yaml')))"

# JSON file banao
cat > test-config.json << 'EOF'
{
  "app": {
    "name": "MyApp",
    "version": "1.0.0"
  }
}
EOF

# JSON validate karo
python3 -c "import json; print(json.load(open('test-config.json')))"

# Cleanup
rm test-config.yaml test-config.json
```
:::

:::caution CHECKPOINT:
1. YAML aur JSON mein kya fark hai? Kubernetes manifests YAML kyun use karte hain JSON ki jagah?
2. `.env` file ko Git mein commit kyun nahi karna chahiye? `.gitignore` kaise kaam karta hai?
:::

---

## Summary: Phase 0 Key Takeaways

| Concept | Tumne Kya Seekha |
|---------|-----------------|
| Computer Architecture | CPU = Manager, RAM = Working Table, Storage = Warehouse |
| Internet | Client-Server model, DNS = Phonebook, IP = Address |
| File System | Tree structure, extensions matter |
| Keyboard Shortcuts | `Ctrl+R` (search), `Ctrl+C` (kill), `Tab` (autocomplete) |
| AI Mindset | Tum Director ho, AI Worker hai |
| Context Engineering | Clear spec = Better AI output |

---

:::tip MINI-TASK: Apne Existing Project Pe Apply Karo

Ye task tumhare kisi bhi existing project (Islamic Banking FTE ya NexaBook) pe karo:

1. **Ek feature ka spec likho** — koi small feature jo tum add karna chahte ho (e.g., "Add a /health endpoint")
2. **Ye spec AI ko do** (Claude Code ya OpenCode CLI) aur code generate karwao
3. **Code verify karo** — kya sahi hai, kya galat
4. **Agar koi issue aaya** to `INCIDENT.md` mein document karo
5. **`PROGRESS-TRACKER.md` mein Phase 0 ka status "In Progress" mein update karo**

**Time estimate:** 30-45 minutes
:::

---

*Next: Phase 1 — Linux + Networking + Terminal Mastery jab bolo "next"*
