---
sidebar_position: 4
title: "Phase 2: Incident Log"
description: "Real-world incident scenarios for Phase 2"
---

# INCIDENT LOG — Phase: Git & Version Control

---

## Incident #1: Accidental Reset — Code Deleted
- **Date:** (Practice Scenario)
- **What Broke:** `git reset --hard` se 3 commits gayab
- **Root Cause:** Wrong command — `--hard` ne sab delete kar diya
- **Fix:**
  ```bash
  git reflog  # Find the commit hash
  git reset --hard HEAD@{3}  # Restore
  ```
- **Prevention:** Always `git stash` before destructive operations
- **Learning:** Reflog is your safety net

---

## Incident #2: Wrong Branch Pe Commit
- **Date:** (Practice Scenario)
- **What Broke:** Feature code committed to main branch
- **Root Cause:** Forgot to switch branches
- **Fix:**
  ```bash
  git log --oneline  # Find commit hash
  git checkout feature-branch
  git cherry-pick <commit-hash>
  git checkout main
  git reset --hard HEAD~1  # Remove from main
  ```
- **Prevention:** Always check `git status` before committing
- **Learning:** Use branch protection rules

---

## Incident #3: Merge Conflict + Failed CI
- **Date:** (Practice Scenario)
- **What Broke:** PR cannot merge — conflict + CI failing
- **Root Cause:** Teammate changed same file
- **Fix:**
  ```bash
  git fetch origin
  git merge origin/main
  # Resolve conflicts manually
  # Fix CI test
  git add .
  git commit -m "fix: resolve conflict"
  git push
  ```
- **Prevention:** Regular rebase on main
- **Learning:** Communicate with team about shared files

---

## Incident #4: Git Hooks Not Working
- **Date:** (Practice Scenario)
- **What Broke:** Pre-commit hook not running
- **Root Cause:** Hook file not executable
- **Fix:**
  ```bash
  chmod +x .git/hooks/pre-commit
  ```
- **Prevention:** Set up hooks during project initialization
- **Learning:** Test hooks regularly

---

## Incident #5: Stash Pop Conflict
- **Date:** (Practice Scenario)
- **What Broke:** `git stash pop` causing conflict
- **Root Cause:** Stash has changes conflicting with current code
- **Fix:**
  ```bash
  git stash pop  # Shows conflict
  # Resolve manually
  git add .
  git stash drop  # Clean up stash
  ```
- **Prevention:** Stash when you have clean working directory
- **Learning:** Use `git stash branch` for complex stashes
