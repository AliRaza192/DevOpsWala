---
sidebar_position: 3
title: "Phase 1: Incident Log"
description: "Real-world incident scenarios for Phase 1"
---

# INCIDENT LOG — Phase: Linux + Networking + Terminal Mastery

> Har incident ko document karo — ye tumhara asli portfolio hai.

---

## Incident #1: Service Down — Nginx 502 Bad Gateway

- **Date:** (Practice Scenario)
- **What Broke:** Website pe "502 Bad Gateway" aa raha hai
- **Root Cause:** Nginx chal raha hai lekin backend (Node.js) crash ho gaya hai
- **Step-by-Step Fix:**
  ```bash
  # Step 1: Nginx status check karo
  sudo systemctl status nginx
  # Output dekho: "active (running)" ya "inactive (dead)"

  # Step 2: Backend service check karo
  sudo systemctl status nexabook-backend
  # Agar "inactive (dead)" dikhae to restart karo

  # Step 3: Backend logs dekho — kyun crash hua
  journalctl -u nexabook-backend --since "10 minutes ago"
  # Error message dhundho (e.g., "ECONNREFUSED", "Cannot find module")

  # Step 4: Port check karo — backend ka port open hai ya nahi
  ss -tuln | grep 3000
  # Agar kuch nahi dikha to backend nahi chal raha

  # Step 5: Backend restart karo
  sudo systemctl restart nexabook-backend
  sleep 5  # 5 second wait karo

  # Step 6: Verify karo
  sudo systemctl status nexabook-backend
  curl -I https://nexabook.com
  # "HTTP/1.1 200 OK" aana chahiye
  ```
- **Prevention:** systemd mein ye add karo:
  ```ini
  [Service]
  Restart=always
  RestartSec=5
  ```
- **Learning:** Nginx 502 ka matlab hai — upstream (backend) respond nahi kar raha. Pehle backend check karo, nginx nahi.

---

## Incident #2: Disk Full — Deployment Fail

- **Date:** (Practice Scenario)
- **What Broke:** `No space left on device` error
- **Root Cause:** `/var/log/` mein 50GB logs jam ho gayi
- **Step-by-Step Fix:**
  ```bash
  # Step 1: Confirm karo kitna full hai
  df -h /
  # Filesystem      Size  Used Avail Use% Mounted on
  # /dev/sda1        50G   48G  2.0G  96% /

  # Step 2: Sabse bade files/folders dhundho
  du -sh /* 2>/dev/null | sort -rh | head -10
  # Output: 45G    /var/log

  # Step 3: Detailed breakdown dekho
  du -sh /var/log/* | sort -rh | head -10
  # Output: 30G    /var/log/nginx
  #         15G    /var/log/journal

  # Step 4: Purani compressed logs delete karo
  sudo find /var/log -name "*.gz" -mtime +30 -delete
  sudo find /var/log -name "*.log.*" -mtime +7 -delete

  # Step 5: Journalctl cleanup karo
  sudo journalctl --vacuum-size=500M
  # Ya sirf 7 din rakho
  sudo journalctl --vacuum-time=7d

  # Step 6: Verify karo
  df -h /
  # Ab 10% ya kam use hona chahiye

  # Step 7: Log rotation setup karo (permanent fix)
  sudo nano /etc/logrotate.d/nginx
  ```
  
  **Log rotation config:**
  ```
  /var/log/nginx/*.log {
      daily
      rotate 14
      compress
      delaycompress
      missingok
      notifempty
      create 0640 www-data adm
      sharedscripts
      postrotate
          [ -f /var/run/nginx.pid ] && kill -USR1 $(cat /var/run/nginx.pid)
      endscript
  }
  ```

- **Prevention:** 
  1. Log rotation setup karo
  2. Disk usage alert lagao: `df -h / | awk 'NR==2 {print $5}' | tr -d '%'` se threshold check karo
  3. Cron job lagao jo roz cleanup kare

- **Learning:** Production mein disk full hona common hai. Log rotation aur monitoring mandatory hai.

---

## Incident #3: High CPU — Runaway Process

- **Date:** (Practice Scenario)
- **What Broke:** Server unresponsive, SSH slow hai
- **Root Cause:** Ek process 100% CPU use kar raha hai
- **Step-by-Step Fix:**
  ```bash
  # Step 1: CPU usage dekho
  top -bn1 | head -20
  # Ya htop use karo (better view)
  htop

  # Step 2: Sabse zyada CPU wala process dhundho
  ps aux --sort=-%cpu | head -5
  # USER       PID %CPU %MEM    COMMAND
  # www-data  1234 98.5  2.1  /usr/bin/node suspicious-script.js

  # Step 3: Process details dekho
  ls -la /proc/1234/exe
  # Symlink dikhaega kaunsi binary chal rahi hai

  cat /proc/1234/cmdline | tr '\0' ' '
  # Full command dikhega

  # Step 4: Process ko gracefully band karo
  kill 1234           # SIGTERM — graceful shutdown
  sleep 5
  ps aux | grep 1234  # Check karo band hua ya nahi

  # Step 5: Agar SIGTERM se nahi ruka to force kill
  kill -9 1234        # SIGKILL — force kill (last resort)

  # Step 6: Verify karo
  top -bn1 | head -5
  # CPU usage normal hona chahiye (&lt;80%)

  # Step 7: Root cause dhundho
  journalctl --since "30 minutes ago" | grep -i "error\|warning"
  ```

- **Prevention:**
  1. Resource limits lagao: `ulimit -u 100` (max 100 processes per user)
  2. Systemd mein limits set karo:
     ```ini
     [Service]
     CPUQuota=80%
     MemoryMax=512M
     ```
  3. Monitoring setup karo (Prometheus + alert)

- **Learning:** `kill -9` last resort hai. Pehle `kill` (SIGTERM) try karo. Process ko gracefully shutdown karne do.

---

## Incident #4: Permission Denied on Log Writing

- **Date:** (Practice Scenario)
- **What Broke:** Application cannot write to log file
- **Root Cause:** Wrong file permissions/ownership
- **Step-by-Step Fix:**
  ```bash
  # Step 1: Error confirm karo
  tail -f /var/log/nexabook/error.log
  # "Permission denied" ya "open() failed" dikhega

  # Step 2: File permissions dekho
  ls -la /var/log/nexabook/error.log
  # -rw-r--r-- 1 root root 12345 Jan 1 12:00 error.log
  # Owner: root, Group: root
  # Problem: Application (www-data) ko write permission nahi

  # Step 3: Ownership change karo
  sudo chown www-data:www-data /var/log/nexabook/error.log

  # Step 4: Permissions theek karo
  sudo chmod 640 /var/log/nexabook/error.log
  # 640 = owner: rw, group: r, others: nothing

  # Step 5: Directory permissions bhi check karo
  ls -la /var/log/nexabook/
  # Agar directory mein bhi write nahi kar pa raha

  sudo chown -R www-data:www-data /var/log/nexabook/
  sudo chmod 750 /var/log/nexabook/

  # Step 6: Verify karo
  sudo -u www-data touch /var/log/nexabook/test-write
  # Agar bina error ke ho gaya to sahi hai
  rm /var/log/nexabook/test-write
  ```

- **Prevention:**
  1. Deployment script mein ownership set karo
  2. Log directory pehle se bana ke rakho
  3. Application ko root pe mat chalao — least privilege

- **Learning:** Linux permissions 3 layers hain: User, Group, Others. Production mein hamesha least privilege principle use karo.

---

## Incident #5: DNS Resolution Failing

- **Date:** (Practice Scenario)
- **What Broke:** Cannot resolve domain names, services unreachable
- **Root Cause:** DNS server not configured or down
- **Step-by-Step Fix:**
  ```bash
  # Step 1: DNS resolution test karo
  nslookup google.com
  # "server can't find google.com: NXDOMAIN" = DNS fail

  # Step 2: DNS config check karo
  cat /etc/resolv.conf
  # nameserver 8.8.8.8
  # nameserver 8.8.4.4
  # Agar nameserver missing ya wrong hai to fix karo

  # Step 3: Temporary fix — Google DNS add karo
  sudo bash -c 'echo "nameserver 8.8.8.8" >> /etc/resolv.conf'
  sudo bash -c 'echo "nameserver 8.8.4.4" >> /etc/resolv.conf'

  # Step 4: Test karo
  nslookup google.com
  dig google.com +short

  # Step 5: Permanent fix (Netplan for Ubuntu)
  sudo nano /etc/netplan/01-netcfg.yaml
  ```
  
  **Netplan config:**
  ```yaml
  network:
    version: 2
    ethernets:
      eth0:
        dhcp4: true
        nameservers:
          addresses: [8.8.8.8, 8.8.4.4, 1.1.1.1]
  ```

  ```bash
  # Step 6: Apply karo
  sudo netplan apply

  # Step 7: Verify karo
  cat /etc/resolv.conf
  nslookup nexabook.com
  ```

- **Prevention:**
  1. DNS servers configure karo during server setup
  2. Multiple DNS servers rakho (redundancy)
  3. DNS monitoring setup karo

- **Learning:** DNS = Internet ka phonebook. Agar DNS fail ho to tumhe IPs directly use karni padengi (temporary fix).
