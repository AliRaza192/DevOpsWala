---
sidebar_position: 3
title: "PHASE 2: Git & Version Control"
description: "**Tumhara level:** Tum daily Git use kar rahe ho — `add`, `commit`, `push` to aata hai. Is phase mein tum wo seekhoge jo"
---

# PHASE 2: Git & Version Control — TEACHING

> **Tumhara level:** Tum daily Git use kar rahe ho — `add`, `commit`, `push` to aata hai. Is phase mein tum wo seekhoge jo interviews mein aur production mein life-saver hai: **reflog recovery**, **branching strategies**, **merge conflicts**, aur **Git hooks**. Ye tumhare Islamic Banking FTE aur NexaBook dono ke liye critical hai — galat commit se production gir sakta hai.

---

## Section 1: Git Basics Refresher — The Commands You Forget

:::tip CONCEPT: Git = Tumhara Time Machine

Git har commit ko save karta hai — ye tumhara time machine hai. Galti karo to wapas ja sakte ho. Lekin ye sirf tab kaam karta hai jab tum Git ka sahi tarike se use karte ho.

:::

```bash
# Status — abhi kya change hua
git status

# Staging — changes ko ready karo commit ke liye
git add file.txt          # Single file
git add .                # Sab kuch
git add -p               # Interactive — line by line choose karo (sabse useful!)

# Commit — snapshot lo
git commit -m "feat: add user authentication"
git commit --amend        # Last commit fix karo (message ya content)

# History dekho
git log --oneline         # Short history
git log --oneline --graph # Branches ke sath
git log --since="2 weeks ago"  # Date range
git log --author="Ali"    # Sirf tumhare commits

# Changes dekho
git diff                 # Unstaged changes
git diff --staged        # Staged changes
git diff main..feature   # Branch ka fark

# Undo karo
git restore file.txt          # Unstaged changes discard
git restore --staged file.txt # Unstage karo (commit nahi hoga)
git revert HEAD              # Last commit undo (naya commit banta hai — SAFE)
git reset --soft HEAD~1      # Last commit undo (changes saved)
git reset --hard HEAD~1      # Last commit undo (changes DELETE — DANGEROUS!)
```

:::tip CONCEPT: Conventional Commits — Industry Standard

Production mein tumhe commit message format follow karna padega. Ye tumhare teammates ko samajhne mein madad karta hai ke kya change hua.

:::

```
type(scope): description

feat(auth): add JWT token validation
fix(api): handle null response from database
docs(readme): update setup instructions
style(css): fix button alignment
refactor(utils): extract validation logic
test(auth): add unit tests for login
chore(deps): update axios to 1.6.0
```

**Real-world connection:** Tumhare NexaBook mein agar koi naya developer aaye, usko git log dekh kar pata chal jaayega ke kaun sa feature kab add hua, kaun sa bug kab fix hua. Agar tum "updated code" ya "fix bug" likhte ho to kisi ko kuch nahi samajh aata.

:::note HANDS-ON: Git Basics Practice

:::

```bash
# Practice environment banao
mkdir /tmp/git-basics && cd /tmp/git-basics
git init

# Ek file banao aur commit karo
echo "# Nexabook" > README.md
git add README.md
git commit -m "docs: initial commit"

# File edit karo lekin stage mat karo
echo "## Features" >> README.md
git status  # Modified dikhega (red)
git diff    # Changes dikheinge

# Stage karo
git add README.md
git diff --staged  # Staged changes dikheinge (green)

# Commit karo
git commit -m "feat: add features section"

# History dekho
git log --oneline --graph

# Last commit amend karo (galti fix karo)
git commit --amend -m "docs: add features section"

# Cleanup
cd ~ && rm -rf /tmp/git-basics
```

:::caution CHECKPOINT:
1. `git add -p` kya karta hai? Agar tumhare Islamic Banking FTE ke `auth.js` mein 10 lines change hain aur sirf 3 lines staging karni hain (baaki baad mein), to kaise karoge?
2. `git revert` aur `git reset` mein kya fark hai? Agar tumne galti se production pe `git reset --hard` kar diya aur 5 commits gayab ho gaye, to kya karooge? (Hint: Phase 1 mein reflog seekha tha)
3. Agar tumhara teammate tumse pooche "ye commit kya karta hai?" — to tumhara commit message itna clear hona chahiye ke wo bina code dekhe samajh jaaye. "fix bug" vs "fix(auth): handle expired JWT token refresh" — kaunsa better hai aur kyun?

:::

---

## Section 2: Branching — Sabse Important Concept

:::tip CONCEPT: Branch = Alag Duniya

Branch se tum alag-alag kaam ek saath kar sakte ho bina ek dusre ko disturb kiye. Jaise tumhare Islamic Banking FTE mein alag-alag features parallel mein develop ho rahe hain.

:::

```bash
# Branch list
git branch              # Local branches
git branch -r           # Remote branches
git branch -a           # Sab branches

# Naya branch banao
git branch feature-login
git checkout feature-login       # Switch karo
git checkout -b feature-login    # Banao + switch (sabse common)
git switch -c feature-login     # Naya tarika (Git 2.23+)

# Branch pe kaam karo
echo "login logic" > auth.js
git add . && git commit -m "feat(auth): add login page"

# Wapas main pe aao
git checkout main

# Branch merge karo
git merge feature-login    # Fast-forward merge
git merge --no-ff feature-login  # Merge commit banao (recommended)

# Branch delete karo
git branch -d feature-login    # Safe delete (merged hai to)
git branch -D feature-login    # Force delete (merged nahi hai to)
```

:::tip CONCEPT: Merge vs Rebase — Dono Kaam Ke Hain

**Merge** — branch ka history preserve karta hai. Safe hai. Production mein zyada use hota hai.
**Rebase** — commit history ko clean rakhta hai. Linear history banta hai. Personal branches ke liye best.

:::

```
MERGE (history preserved):
main:    A---B---C-------F (merge commit)
              \         /
feature:       D---E---/

REBASE (linear history):
main:    A---B---C
                      \
feature:             D'---E'---F'  (rebased commits)
```

```bash
# Merge (safe, preserves history)
git checkout main
git merge feature-login
# History mein dikhega ke feature branch se merge hua

# Rebase (clean linear history)
git checkout feature-login
git rebase main
# Ab feature-login pe main ke naye commits aa gaye
# Ab main pe jaake fast-forward merge karo
git checkout main
git merge feature-login
# History saaf dikhegi — lagta hai tumne directly main pe kiya
```

**Kab kya use karo:**
- **Merge** — jab tum public/shared branch pe ho (sabki history safe rakho)
- **Rebase** — jab tum apne feature branch pe ho (private, kisi ne dekha nahi)
- **Kab rebase MAT karo** — jab branch already push ho gayi hai aur teammates ne dekh li hai

**Real-world connection:** Tumhare NexaBook mein tum aur tumhara teammate dono alag features pe kaam kar rahe ho. Tum `feature/payment` pe ho, wo `feature/dashboard` pe. Dono `develop` branch se nikle ho. Jab dono complete ho, ek ek karke merge karo `develop` mein — isse conflict kam aate hain.

:::note HANDS-ON: Branching Practice

:::

```bash
mkdir /tmp/git-branching && cd /tmp/git-branching
git init

# Main branch pe initial commit
echo "v1" > app.js
git add . && git commit -m "v1: initial"

# Feature branch banao
git checkout -b feature-login
echo "login module" > login.js
git add . && git commit -m "feat: add login"

# Wapas main pe naya commit
git checkout main
echo "v2" > app.js
git add . && git commit -m "v2: update app"

# Ab merge karo — conflict aa sakta hai
git merge feature-login
# Agar conflict aaye to resolve karo

# Rebase practice
git checkout -b feature-dashboard
echo "dashboard" > dashboard.js
git add . && git commit -m "feat: add dashboard"

git rebase main  # Clean history
git checkout main
git merge feature-dashboard  # Fast-forward

# History dekho
git log --oneline --graph

# Cleanup
cd ~ && rm -rf /tmp/git-branching
```

:::caution CHECKPOINT:
1. Agar tumne `git rebase` kiya aur 5 conflicts aa gaye — to kaise fix karoge? Har conflict ke baad `git rebase --continue` karna padega ya kuch aur?
2. `git merge --no-ff` kyun use karte hain? Agar sirf `git merge` use karo to kya problem aa sakti hai? (Hint: feature branch ka pata nahi chalega kab banaya tha)
3. Tumhare Islamic Banking FTE mein 3 developers hain — tum (payment), Sara (auth), Ahmed (dashboard). Sab ek sath `develop` pe kaam kar rahe hain. Git Flow follow karte ho. Describe karo ke 1 din ka workflow kaisa dikhega.

:::

---

## Section 3: Merge Conflicts — Real Life Mein Aata Hai

:::tip CONCEPT: Conflict = Dono Ne Same Jagah Change Ki

Jab tum aur tumhara teammate dono same line change karte ho, Git confuse ho jaata hai — conflict! Ye har developer ke saath hota hai. Darne ki baat nahi hai — resolve karna seekho.

:::

```bash
# Merge karo
git merge feature-login
# CONFLICT (content): Merge conflict in src/auth.js

# Conflict marker dekho
cat src/auth.js
# <<<<<<< HEAD
# function login() { /* tumhara code */ }
# =======
# function login() { /* teammate ka code */ }
# >>>>>>> feature-login

# Fix karo — manually select karo kaunsa code rakhna hai
# Ya koi ek lo:
git checkout --ours src/auth.js    # Tumhara version
git checkout --theirs src/auth.js  # Teammate ka version

# Ya manually edit karo aur:
git add src/auth.js
git commit -m "fix: resolve merge conflict in auth.js"
```

:::tip CONCEPT: Conflict Markers Samjho

:::

```
<<<<<<< HEAD
// Tumhara code (current branch)
function validateTransaction(amount) {
    return amount > 0;
}
=======
// Teammate ka code (incoming branch)
function validateTransaction(amount) {
    if (amount <= 0) throw new Error("Invalid amount");
    if (amount > 1000000) return false;
    return true;
}
>>>>>>> feature-payment-validation
```

**Ye 3 markers hain:**
- `<<<<<<< HEAD` — Tumhara code shuru hota hai yahan
- `=======` — Tumhara code khatam, teammate ka shuru
- `>>>>>>> feature-branch` — Teammate ka code khatam

**Resolve karo:**
1. Manually decide karo kaunsa code rakhna hai (ya dono ka combination)
2. `<<<<<<<`, `=======`, `>>>>>>>` markers hatao
3. `git add` karo
4. `git commit` karo

:::note HANDS-ON: Conflict Practice Karo

:::

```bash
mkdir /tmp/git-conflict && cd /tmp/git-conflict
git init

# Main branch pe file banao
cat > auth.js << 'EOF'
function login(user) {
    // Basic login
    return user.password === "correct";
}
EOF
git add . && git commit -m "feat: basic login"

# Feature branch pe change karo
git checkout -b feature-login-validation
cat > auth.js << 'EOF'
function login(user) {
    // Basic login
    return user.password === "correct";
}

function validateEmail(email) {
    return email.includes("@");
}
EOF
git add . && git commit -m "feat: add email validation"

# Wapas main pe aur alag change karo
git checkout main
cat > auth.js << 'EOF'
function login(user) {
    // Basic login with logging
    console.log("Login attempt:", user.email);
    return user.password === "correct";
}
EOF
git add . && git commit -m "feat: add login logging"

# Merge karo — conflict aa jayega
git merge feature-login-validation
# CONFLICT!

# Conflict resolve karo
cat auth.js  # Conflict markers dekho
# Manually fix karo — dono changes rakho
cat > auth.js << 'EOF'
function login(user) {
    // Basic login with logging
    console.log("Login attempt:", user.email);
    return user.password === "correct";
}

function validateEmail(email) {
    return email.includes("@");
}
EOF
git add auth.js
git commit -m "feat: merge login validation and logging"

# Cleanup
cd ~ && rm -rf /tmp/git-conflict
```

:::caution CHECKPOINT:
1. Conflict resolve karte waqt `git checkout --ours` aur `--theirs` mein kya fark hai? Kab kaunsa use karoge? Agar dono changes important hain to kya karoge?
2. Agar conflict resolve karte waqt galti se wrong code rakh diya aur commit kar diya — to kaise wapas aoge? (Hint: reflog se)
3. Tumhare NexaBook mein `api/transactions.js` pe tum aur tumhara teammate dono kaam kar rahe ho. Tumne 5 commits kiye, usne 3 commits kiye. Merge karte waqt 8 conflicts aa gaye. Step-by-step batao ke kaise resolve karoge bina kisi code lose kiye.

:::

---

## Section 4: Git Reflog — Tumhara Safety Net (LIFE-SAVER!)

:::tip CONCEPT: Reflog = Git Ka CCTV

Reflog har action record karta hai — commit, reset, rebase, branch switch, sab kuch. Agar tum galti se kuch delete kar do, reflog se wapas la sakte ho. Ye tumhari life jacket hai.

:::

```bash
# Reflog dekho
git reflog
# Output:
# a1b2c3d HEAD@{0}: commit: feat: add login
# d4e5f6g HEAD@{1}: reset: moving to HEAD~1
# h7i8j9k HEAD@{2}: commit: feat: add dashboard
# m3n4o5p HEAD@{3}: clone: from https://github.com/...

# Galti se reset kar diya? Wapas lao
git reset --hard HEAD@{1}

# Galti se branch delete kar diya? Wapas lao
git reflog  # Pata karo kaunsa commit tha
git checkout -b feature-deleted a1b2c3d

# Galti se rebase kar diya? Wapas lao
git reflog
git reset --hard HEAD@{5}  # Rebase se pehle wala commit

# Galti se stash pop kar diya aur conflicts aa gaye? Wapas lao
git reflog
git reset --hard HEAD@{1}  # Stash pop se pehle ki state
```

:::tip CONCEPT: Reflog vs Log — Dono Alag Hain

:::

```
git log     — Sirf commit history dikhata hai
git reflog  — Sab kuch dikhata hai (commits, resets, merges, switches)
```

**Reflog sirf local hai** — ye tumhare machine pe hota hai, push nahi hota. Default 90 din baad expire hota hai.

**Real-world connection:** Tum `git reset --hard` karke apna 2 ghante ka kaam delete kar dete ho. Reflog se wapas aa sakte ho. Ye tumhare career ki sabse important Git trick hai. Har interview mein poochte hain.

:::note HANDS-ON: Reflog Recovery Practice

:::

```bash
mkdir /tmp/reflog-practice && cd /tmp/reflog-practice
git init

# 3 commits karo
echo "v1" > app.js && git add . && git commit -m "v1: initial"
echo "v2" > app.js && git add . && git commit -m "v2: add feature"
echo "v3" > app.js && git add . && git commit -m "v3: add payment"

# Ab galti se reset kar do
git reset --hard HEAD~1
cat app.js  # "v2" — v3 gayab!

# Reflog dekho
git reflog
# a1b2c3d HEAD@{0}: reset: moving to HEAD~1
# d4e5f6g HEAD@{1}: commit: v3: add payment

# Reflog se wapas lao
git reset --hard HEAD@{1}
cat app.js  # "v3" — wapas aa gaya!

# Verify karo
git log --oneline
# d4e5f6g v3: add payment
# h7i8j9k v2: add feature
# m3n4o5p v1: initial

# Cleanup
cd ~ && rm -rf /tmp/reflog-practice
```

:::caution CHECKPOINT:
1. `git reflog` aur `git log --all` mein kya fark hai? Agar tumne galti se ek branch delete kar di jo push nahi hui thi, to konsa use karoge?
2. Reflog 90 din baad expire hota hai. Agar tumhe 6 mahine purana commit chahiye to kya karoge? (Hint: git fsck --unreachable)
3. Tumhare Islamic Banking FTE mein ek critical bug fix commit tha jo 10 commits pehle tha. Tumne uske baad 10 naye commits kiye. Ab tumhe sirf wo purana fix wapas chahiye (baaki changes nahi). Kaise karoge? (Hint: git cherry-pick)

:::

---

## Section 5: Git Workflows — Team Mein Kaise Kaam Hota Hai

:::tip CONCEPT: Workflow = Team Rules

Git Flow, GitHub Flow, Trunk-based — ye sab tarike hain team ke kaam karne ke. Har ek ke fayde aur nuksan hain.

:::

### Git Flow (Bade projects ke liye)

```
main (production ready)
  ├── develop (integration branch)
  │     ├── feature/login
  │     ├── feature/dashboard
  │     └── feature/payment
  ├── release/v1.0
  └── hotfix/critical-bug
```

**Rules:**
- `main` pe sirf release/hotfix merge hota hai
- `develop` pe feature merge hota hai
- Feature branch `develop` se banta hai
- Release branch `develop` se banti hai aur `main` pe merge hoti hai
- Hotfix branch `main` se banti hai aur dono pe merge hoti hai

**Fayda:** Clear separation, organized
**Nuksan:** Complex, slow releases

**Real-world connection:** Tumhare Islamic Banking FTE ke liye Git Flow best hai — compliance requirements hain, har change tracked hona chahiye, release process formal hona chahiye.

### GitHub Flow (Simple, startups ke liye)

```
main (always deployable)
  └── feature-branch
        └── Pull Request → Review → Merge → Deploy
```

**Rules:**
- `main` hamesha deployable ho
- Feature branch banao, PR karo, review karo, merge karo
- Deploy karo
- Koi release branch nahi, koi hotfix branch nahi

**Fayda:** Simple, fast, CI/CD friendly
**Nuksan:** Less control, bade projects mein messy

### Trunk-Based (Experienced teams ke liye)

```
main (trunk)
  └── short-lived feature branches (1-2 din max)
```

**Rules:**
- Feature flags use karo (code hidden rahe jab tak ready na ho)
- Branches 1-2 din se zyada na chalne do
- Continuous integration — roz main pe merge
- Small commits, frequent merges

**Fayda:** Fastest, least merge conflicts
**Nuksan:** Requires discipline, feature flags management

:::caution CHECKPOINT:
1. Agar tumhara NexaBook ek 3-person startup hai to kaunsa workflow use karoge? Agar 50-person enterprise hai to kaunsa? Dono ke reasons do.
2. Trunk-based development mein "feature flags" kya hain? Agar tumne 1 feature flag lagaya aur 2 mahine baad bhool gaye remove karna to kya problem aa sakti hai?
3. Git Flow mein "hotfix" branch kyun alag hai? Sirf `main` pe directly fix kyun nahi kar sakte?

:::

---

## Section 6: Git Hooks — Automation on Steroids

:::tip CONCEPT: Hooks = Git Ke Automatic Triggers

Git hooks tumhe allow karte hain ke kuch kaam automatically ho — commit se pehle, push se pehle, etc. Ye tumhari CI/CD ki pehli line of defense hai.

:::

```bash
# Hooks kahan hote hain
ls .git/hooks/

# Common hooks:
# pre-commit  — commit se pehle chalta hai (lint, format check)
# commit-msg  — commit message check karta hai (format validation)
# pre-push    — push se pehle chalta hai (tests, security scan)
# post-merge  — merge ke baad chalta hai (npm install)
```

:::tip CONCEPT: Hook Types — Client-Side vs Server-Side

:::

```
Client-Side Hooks (tumhare machine pe):
├── pre-commit    — Lint, format, whitespace check
├── commit-msg    — Message format validation
├── pre-push      — Tests run karo
└── post-checkout — npm install after branch switch

Server-Side Hooks (remote pe — GitHub/GitLab):
├── pre-receive   — Branch protection, signed commits
├── post-receive  — Deploy, notification
└── update        — Per-branch rules
```

:::note HANDS-ON: Git Hook Practice

:::

```bash
mkdir /tmp/hook-practice && cd /tmp/hook-practice
git init

# Pre-commit hook banao — console.log check
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
echo "Running pre-commit checks..."

# Check for console.log in staged JS files
if git diff --cached --name-only | grep -E "\.js$" | xargs grep -l "console.log" 2>/dev/null; then
    echo "ERROR: console.log found in staged files. Remove them."
    echo "Use proper logging instead."
    exit 1
fi

# Check for TODO comments
if git diff --cached --name-only | xargs grep -l "TODO:" 2>/dev/null; then
    echo "WARNING: TODO comments found. Make sure they're intentional."
fi

echo "All checks passed!"
EOF
chmod +x .git/hooks/pre-commit

# Commit message hook banao
cat > .git/hooks/commit-msg << 'EOF'
#!/bin/bash
MSG=$(cat "$1")
if ! echo "$MSG" | grep -qE "^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?: "; then
    echo "ERROR: Commit message must follow Conventional Commits format."
    echo "Examples:"
    echo "  feat(auth): add login endpoint"
    echo "  fix(api): handle null response"
    echo "  docs(readme): update setup"
    exit 1
fi
EOF
chmod +x .git/hooks/commit-msg

# Test karo — pre-commit hook
echo 'console.log("debug")' > test.js
git add test.js
git commit -m "test: add debug"
# Hook reject karega!

# Fix karo
sed -i 's/console.log("debug")/\/\/ debug removed/' test.js
git add test.js
git commit -m "test: add debug code"
# Ab commit hoga!

# Cleanup
cd ~ && rm -rf /tmp/hook-practice
```

:::caution CHECKPOINT:
1. Client-side hooks aur server-side hooks mein kya fark hai? Agar sirf client-side hooks use karo to koi bypass kar sakta hai? (Hint: `--no-verify`)
2. Tumhare NexaBook mein pre-commit hook lint check karta hai. Agar koi developer `git commit --no-verify` lagake skip kar de to kya problem aa sakti hai? Isko kaise rok sakte ho?
3. Post-merge hook kya karta hai? Agar tumhare project mein `package.json` update hua hai to merge ke baad `npm install` automatically kaise karoge?

:::

---

## Section 7: Advanced Commands — Production Mein Kaam Aayenge

:::tip CONCEPT: Stash = Temporary Storage

:::

```bash
# Stash — changes ko temporarily save karo
git stash                    # Save karo (tracked files)
git stash -u                 # Save karo (including untracked files)
git stash -m "WIP: login"    # Message ke sath save
git stash list               # Sab stashes dekho
git stash pop                # Wapas lao aur delete
git stash apply stash@{2}    # Specific stash wapas lao
git stash drop               # Delete karo
git stash clear              # Sab stashes delete
```

**Real-world connection:** Tum `feature/payment` pe kaam kar rahe ho. Tumhe urgent bug fix karna hai `main` pe. Stash karo, `main` pe jaao, fix karo, wapas aao, stash pop karo.

:::tip CONCEPT: Cherry-Pick = Ek Commit Chuno

:::

```bash
# Cherry-pick — ek commit doosri branch pe lao
git cherry-pick abc1234      # Sirf ye commit lo
git cherry-pick abc1234..def5678  # Range of commits
git cherry-pick --no-commit abc1234  # Commit bina banaye changes lao
```

**Real-world connection:** Tumhare teammate ne `feature-dashboard` pe ek important bug fix kiya. Tumhe wo fix abhi `main` pe chahiye lekin baaki feature nahi. Cherry-pick se sirf wo fix lao.

:::tip CONCEPT: Interactive Rebase = History Clean Karo

:::

```bash
# Interactive rebase — history clean karo
git rebase -i HEAD~3         # Last 3 commits edit karo

# Editor khulega:
# pick a1b2c3d feat: add login
# pick d4e5f6g fix: typo in login
# pick h7i8j9k feat: add signup

# Commands:
# pick = keep as is
# squash = combine with previous commit
# reword = change commit message
# drop = delete commit

# Example: fix aur signup ko login ke sath combine karo
# pick a1b2c3d feat: add login
# squash d4e5f6g fix: typo in login
# squash h7i8j9k feat: add signup
```

:::tip CONCEPT: Bisect = Bug Dhundho

:::

```bash
# Bisect — binary search for bugs
git bisect start
git bisect bad               # Current version mein bug hai
git bisect good v1.0         # Purana version theek tha

# Git automatically check karega — tum test karo
# "Is this version good or bad?"
# Tum test karo aur batao
git bisect good  # Ya
git bisect bad   # Ya
git bisect reset # Cancel

# Ya automated test use karo
git bisect run npm test
```

**Real-world connection:** Tumhare NexaBook mein bug hai jo 50 commits pehle aaya. Bisect se 6 steps mein dhund sakte ho (2^6 = 64).

:::note HANDS-ON: Advanced Commands Practice

:::

```bash
mkdir /tmp/git-advanced && cd /tmp/git-advanced
git init

# Stash practice
echo "wip" > wip.js
git add . && git commit -m "v1"
echo "more wip" >> wip.js
git stash -m "WIP: login feature"
git stash list

# Cherry-pick practice
git checkout -b feature-a
echo "feature a" > a.js
git add . && git commit -m "feat: feature a"
git checkout main

git checkout -b feature-b
echo "feature b" > b.js
git add . && git commit -m "feat: feature b"

# Feature b ka commit main pe chahiye
git checkout main
git cherry-pick <commit-hash-feature-b>

# Interactive rebase practice
git checkout -b feature-c
echo "v1" > c.js && git add . && git commit -m "feat: c v1"
echo "v2" > c.js && git add . && git commit -m "fix: c typo"
echo "v3" > c.js && git add . && git commit -m "feat: c v2"
git rebase -i HEAD~3  # Last 3 commits combine karo

# Cleanup
cd ~ && rm -rf /tmp/git-advanced
```

:::caution CHECKPOINT:
1. `git stash` aur `git stash -u` mein kya fark hai? Agar tumhare working directory mein ek naya file hai (tracked nahi), to `git stash` usko save karega ya nahi?
2. `git rebase -i` se last 5 commits ko 3 mein combine kaise karoge? Step-by-step batao.
3. Tumhare Islamic Banking FTE mein bug hai jo sirf production pe aata hai. Local pe nahi aata. Git bisect se kaise dhundoge? Agar tumhare paas automated test nahi hai to kya karoge?

:::

---

## Section 8: .gitignore — Files Ko Ignore Karo

:::tip CONCEPT: .gitignore = Git Ko Bolo Ye Mat Dekho

:::

```bash
# .gitignore banao
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
venv/
__pycache__/

# Environment variables
.env
.env.local
.env.production

# Build output
dist/
build/
*.o
*.pyc

# Logs
*.log
logs/

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Sensitive data
*.pem
*.key
secrets/
EOF
```

:::caution CHECKPOINT:
1. Agar tumne pehle commit kar diya `.env` file, ab `.gitignore` mein add kiya — to `.env` Git history se delete hoga ya nahi? (Hint: `git rm --cached`)
2. `node_modules/` ko ignore kyun karte hain? Agar koi developer `npm install` nahi kare to kya hoga?

:::

---

## Summary: Phase 2 Key Takeaways

| Concept | Tumne Kya Seekha |
|---------|-----------------|
| Basics | `add`, `commit`, `diff`, `restore`, `amend` |
| Conventional Commits | `feat:`, `fix:`, `docs:` — industry standard |
| Branching | Feature branches, merge vs rebase |
| Conflicts | Markers samjho, manually resolve karo |
| Reflog | `git reflog` + `git reset --hard HEAD@{n}` = safety net |
| Workflows | Git Flow, GitHub Flow, Trunk-based |
| Hooks | `pre-commit`, `commit-msg` — automation |
| Advanced | `stash`, `cherry-pick`, `bisect`, `rebase -i` |
| .gitignore | Files ko ignore karo |

---

## MINI-TASKS

### Task 1: Reflog Recovery (10 min)
1. Ek naya Git repo banao
2. 3 commits karo
3. `git reset --hard HEAD~1` se galti se delete karo
4. `git reflog` se wapas lao

### Task 2: Merge Conflict Practice (15 min)
1. 2 branches banao — dono pe same file edit karo
2. Merge karo — conflict resolve karo
3. Commit karo

### Task 3: Git Hook (10 min)
1. `.git/hooks/commit-msg` banao
2. Check karo ke commit message Conventional Commits format mein hai
3. Galat message se commit reject hona chahiye

### Task 4: Interactive Rebase (10 min)
1. 5 commits karo
2. `git rebase -i HEAD~5` se last 3 commits ko 1 mein combine karo
3. Verify karo ke history saaf hai

---

## INCIDENT.md: Practice Scenarios

### Incident #1: Accidental Reset — 2 Hours of Work Gone

- **Date:** (Practice Scenario)
- **What Broke:** `git reset --hard HEAD~3` karke 3 important commits gayab
- **Root Cause:** Wrong command — `--hard` ne sab delete kar diya
- **Step-by-Step Fix:**
  ```bash
  # Step 1: Reflog dekho — pata karo kaunsa commit tha
  git reflog
  # Output:
  # a1b2c3d HEAD@{0}: reset: moving to HEAD~3
  # d4e5f6g HEAD@{1}: commit: feat: add payment validation
  # h7i8j9k HEAD@{2}: commit: feat: add transaction logging
  # m3n4o5p HEAD@{3}: commit: fix: handle decimal precision

  # Step 2: Sabse purana wanted commit identify karo
  # Humhe HEAD@{3} chahiye (reset se pehle ka last commit)

  # Step 3: Wapas lao
  git reset --hard HEAD@{3}

  # Step 4: Verify karo
  git log --oneline
  # m3n4o5p fix: handle decimal precision
  # h7i8j9k feat: add transaction logging
  # d4e5f6g feat: add payment validation

  # Step 5: Agar sirf kuch specific commits chahiye
  git cherry-pick d4e5f6g h7i8j9k  # Sirf ye 2 commits lo
  ```
- **Prevention:**
  1. `git reset --hard` se pehle hamesha `git stash` karo
  2. Ya naya branch banao: `git checkout -b backup-branch`
  3. Commit messages clear rakho taake reflog mein asaani se dhund sakao
- **Learning:** Reflog = tumhari safety net. Har interview mein poochte hain.

---

### Incident #2: Wrong Branch Pe Commit — Production Pe Feature Code

- **Date:** (Practice Scenario)
- **What Broke:** Feature ka code main branch pe commit ho gaya
- **Root Cause:** `git checkout main` bhool gaye the, feature branch pe the
- **Step-by-Step Fix:**
  ```bash
  # Step 1: Pata karo kaunsa commit galat jagah hai
  git log --oneline main
  # Output:
  # x9y8z7w feat: add experimental payment gateway  <-- Ye galat hai
  # a1b2c3d v2: stable release

  # Step 2: Commit hash note karo (x9y8z7w)

  # Step 3: Feature branch pe move karo
  git checkout feature-payment
  git cherry-pick x9y8z7w

  # Step 4: Main se hatao
  git checkout main
  git reset --hard HEAD~1

  # Step 5: Verify karo
  git log --oneline main
  # a1b2c3d v2: stable release

  git log --oneline feature-payment
  # x9y8z7w feat: add experimental payment gateway
  # ... (baaki feature commits)
  ```
- **Prevention:**
  1. Commit karne se pehle hamesha `git status` dekho
  2. Branch protection rules lagao (GitHub pe `main` pe direct push disable)
  3. IDE mein branch name hamesha dekho
- **Learning:** `git status` = tumhara best friend. Commit karne se pehle hamesha dekho.

---

### Incident #3: Merge Conflict + Failed CI — PR Merge Nahi Ho Raha

- **Date:** (Practice Scenario)
- **What Broke:** PR merge nahi ho raha — conflict + CI test fail
- **Root Cause:** Teammate ne API change ki, tumne bhi change kiya
- **Step-by-Step Fix:**
  ```bash
  # Step 1: Latest main fetch karo
  git fetch origin

  # Step 2: Feature branch pe rebase karo
  git checkout feature-api
  git rebase origin/main

  # Step 3: Conflicts resolve karo
  # Git batayega kaunsi files mein conflict hai
  # Manually fix karo, phir:
  git add <resolved-file>
  git rebase --continue

  # Step 4: CI test fix karo
  # Test file kholo, API changes ke according update karo
  npm test  # Local pe run karo pehle

  # Step 5: Force push karo (rebase ki wajah se)
  git push origin feature-api --force-with-lease

  # Step 6: PR mein comment karo ke conflict resolve ho gaya
  ```
- **Prevention:**
  1. Roz `git fetch origin` karo aur feature branch pe rebase karo
  2. Small, frequent commits karo (1 commit per day minimum)
  3. Teammates ke saath communicate karo ke kaun kis file pe kaam kar raha hai
- **Learning:** `--force-with-lease` > `--force` (safe hota hai, agar kisi ne push kiya hai to rokta hai)

---

### Incident #4: Stash Pop Conflict — Purana Code Wapas Aa Gaya

- **Date:** (Practice Scenario)
- **What Broke:** `git stash pop` karne pe conflicts aa gaye
- **Root Cause:** Stash mein purane changes hain jo current code se conflict kar rahe hain
- **Step-by-Step Fix:**
  ```bash
  # Step 1: Stash list dekho
  git stash list
  # stash@{0}: WIP on feature-abc: d4e5f6g last commit

  # Step 2: Try pop
  git stash pop
  # CONFLICT: Merge conflict in auth.js

  # Step 3: Conflict resolve karo
  cat auth.js  # Conflict markers dekho
  # Manually fix karo
  git add auth.js

  # Step 4: Stash clean karo
  git stash drop  # Ab stash nahi chahiye

  # Step 5: Ya agar resolve nahi ho raha
  git checkout --conflict=merge auth.js  # Reset conflict markers
  git stash branch stash-branch  # Naye branch pe stash apply
  ```
- **Prevention:**
  1. Stash se pehle `git status` dekho ke kya changes hain
  2. `git stash push -m "descriptive message"` use karo
  3. Complex changes ke liye `git stash branch` use karo
- **Learning:** Stash pop risky hai. Agar doubt ho to `git stash apply` pehle try karo (stash delete nahi hota).

---

### Incident #5: Force Push ne Team ka Code Delete Kar Diya

- **Date:** (Practice Scenario)
- **What Broke:** `git push --force` karke teammate ke 5 commits gayab
- **Root Cause:** Rebase ke baad force push kiya bina `--force-with-lease`
- **Step-by-Step Fix:**
  ```bash
  # Step 1: Teammate ko bolo
  # Step 2: Reflog se wapas lao
  git reflog
  # Pata karo kaunsa commit tha

  # Step 3: Force push with lease use karo
  git push origin main --force-with-lease
  # Agar kisi ne beech mein push kiya hai to ye nahi karega

  # Step 4: Teammate ko bolo apna local checkout update kare
  # git pull --rebase origin main
  ```
- **Prevention:**
  1. `git push --force` KABHI mat use karo
  2. Hamesha `git push --force-with-lease` use karo
  3. Branch protection rules lagao
- **Learning:** `--force-with-lease` = safe force. `--force` = dangerous force.

---

*Next: Phase 3 — Programming (Python/Bash/TypeScript) jab bolo "next"*
