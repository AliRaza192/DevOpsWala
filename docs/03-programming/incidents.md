---
sidebar_position: 5
title: "Phase 3: Incident Log"
description: "Real-world incident scenarios for Phase 3"
---

# INCIDENT LOG — Phase: Programming (Python/Bash/TypeScript)

---

## Incident #1: Script Crashed — Undefined Variable
- **Date:** (Practice Scenario)
- **What Broke:** Bash script `unbound variable` error se crash ho gaya
- **Root Cause:** `set -u` enable tha aur variable define nahi tha
- **Fix:**
  ```bash
  # Step 1: Debug mode se pata lagao kaunsa variable undefined hai
  bash -x script.sh  # Debug mode — har command print hoga with values
  
  # Step 2: Error line find karo — output mein "+ VARIABLE_NAME=" dhoondho
  # Jo line pe "unbound variable" aaya, usme variable missing hai
  
  # Step 3: Fix karo — variable define karo ya default value do
  # Galat:
  # echo "$UNDEFINED_VAR"
  
  # Sahi:
  echo "${UNDEFINED_VAR:-"default_value"}"
  
  # Ya variable ko script ke shuru mein define karo
  UNDEFINED_VAR="some_value"
  ```
- **Prevention:** Hamesha `set -euo pipefail` use karo aur variables initialize karo
- **Learning:** `set -u` se pehle variables check karo, default values use karo

---

## Incident #2: Python API Timeout — Script Hang
- **Date:** (Practice Scenario)
- **What Broke:** Production script API call pe hang ho gaya, server pe 100% CPU
- **Root Cause:** No timeout set, no retry logic, requests library default timeout infinity hai
- **Fix:**
  ```python
  # Step 1: Pehle identify karo kaunsa API call hang ho raha hai
  # Server pe process check karo
  # ps aux | grep python
  
  # Step 2: Script mein timeout add karo
  import requests
  
  # Galat — timeout nahi hai, infinite wait karega
  # response = requests.get("https://api.example.com")
  
  # Sahi — timeout set karo (connect timeout, read timeout)
  response = requests.get("https://api.example.com", timeout=(5, 15))
  # 5s connect timeout, 15s read timeout
  
  # Step 3: Retry logic add karo
  import time
  
  def fetch_with_retry(url: str, max_retries: int = 3) -> dict:
      for attempt in range(max_retries):
          try:
              response = requests.get(url, timeout=(5, 15))
              response.raise_for_status()
              return response.json()
          except requests.exceptions.Timeout:
              print(f"Attempt {attempt + 1}: Timeout")
          except requests.exceptions.ConnectionError:
              print(f"Attempt {attempt + 1}: Connection error")
          
          if attempt < max_retries - 1:
              time.sleep(2 ** attempt)  # Exponential backoff
      
      raise Exception(f"All {max_retries} attempts failed for {url}")
  
  # Step 4: Kill hanging process
  # kill $(pgrep -f "python script.py")
  ```
- **Prevention:** Hamesha `timeout` set karo aur retry logic lagao
- **Learning:** Default timeout infinity hai — always set explicit timeout

---

## Incident #3: YAML Indentation Error — K8s Pod Won't Start
- **Date:** (Practice Scenario)
- **What Broke:** Kubernetes pod start nahi ho raha, `kubectl apply` koi error nahi de raha
- **Root Cause:** YAML mein tab use ho gaya tha spaces ki jagah
- **Fix:**
  ```bash
  # Step 1: YAML validate karo
  kubectl apply -f pod.yaml --dry-run=client
  # Agar error aata hai, wo batata hai line number
  
  # Step 2: Python se validate karo (detailed error)
  python3 -c "
  import yaml
  try:
      with open('pod.yaml') as f:
          yaml.safe_load(f)
      print('YAML is valid')
  except yaml.YAMLError as e:
      print(f'YAML Error: {e}')
  "
  
  # Step 3: Tabs ko spaces mein convert karo
  # Install: sudo apt install expand
  expand -t 4 pod.yaml > pod_fixed.yaml
  
  # Step 4: Verify fix
  kubectl apply -f pod_fixed.yaml --dry-run=client
  
  # Step 5: Editor setting configure karo
  # VS Code mein settings.json mein add karo:
  # "editor.insertSpaces": true
  # "editor.tabSize": 2
  # ".yaml": { "editor.tabSize": 2 }
  ```
- **Prevention:** Editor mein "show whitespace" enable karo, `.editorconfig` use karo
- **Learning:** YAML is indentation-sensitive — tabs != spaces

---

## Incident #4: Python Import Error — Module Not Found
- **Date:** (Practice Scenario)
- **What Broke:** `ModuleNotFoundError: No module named 'requests'`
- **Root Cause:** Wrong virtual environment activated ya venv create nahi kiya
- **Fix:**
  ```bash
  # Step 1: Check karo kaunsa python use ho raha hai
  which python
  # Agar /usr/bin/python dikh raha hai to venv activate nahi hai
  
  # Step 2: Check karo venv exists karta hai ya nahi
  ls -la venv/
  # Agar nahi hai to banao
  python3 -m venv venv
  
  # Step 3: Activate karo
  source venv/bin/activate
  
  # Step 4: Verify karo
  which python  # Ab /home/ali/project/venv/bin/python dikhna chahiye
  
  # Step 5: Package install karo
  pip install requests
  
  # Step 6: Requirements file se install karo (production mein)
  pip install -r requirements.txt
  
  # Step 7: Package verify karo
  python -c "import requests; print(requests.__version__)"
  ```
- **Prevention:** Hamesha virtual environment use karo, CI/CD mein bhi
- **Learning:** `which python` se verify karo — sahi python use ho raha hai ya nahi

---

## Incident #5: Bash Script Permission Denied
- **Date:** (Practice Scenario)
- **What Broke:** `bash: ./deploy.sh: Permission denied`
- **Root Cause:** Script executable permission nahi hai
- **Fix:**
  ```bash
  # Step 1: Check karo permissions
  ls -la deploy.sh
  # -rw-r--r-- 1 ali ali 1234 Jan 15 10:00 deploy.sh
  # ^rw- means no execute permission
  
  # Step 2: Execute permission do
  chmod +x deploy.sh
  
  # Step 3: Verify
  ls -la deploy.sh
  # -rwxr-xr-x 1 ali ali 1234 Jan 15 10:00 deploy.sh
  
  # Step 4: Run karo
  ./deploy.sh
  
  # Alternative: Directly bash se run karo (permission nahi chahiye)
  bash deploy.sh
  
  # Step 5: Agar CI/CD mein deploy kar rahe ho
  # .git mein permissions track hoti hain
  git update-index --chmod=+x deploy.sh
  git commit -m "fix: add execute permission to deploy script"
  ```
- **Prevention:** CI/CD pipeline mein `chmod +x` run karo, git se permissions track karo
- **Learning:** Shebang (`#!/bin/bash`) important hai, execute permission bhi zaroori hai
