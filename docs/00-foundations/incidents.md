---
sidebar_position: 3
title: "Phase 0: Incident Log"
description: "Real-world incident scenarios for Phase 0 foundations — disk full, command not found, DNS issues, permissions"
---

# INCIDENT LOG — Phase 0: Foundations

---

## Incident #1: "Mera Disk Full Ho Gaya"
- **Date:** [Tumhari date daalo jab ye practice karo]
- **What Broke:** Server pe deployment fail ho rahi hai, error aa raha hai "No space left on device"
- **Root Cause:** `/var/log/` mein 50GB se zyada log files jam ho gayi hain. Log rotation configured nahi tha.
- **Fix:**
  ```bash
  # Dekho kitni jagah bachi hai
  df -h
  
  # Dekho sabse bade files kahan hain
  du -sh /var/log/* | sort -rh | head -10
  
  # Purani log files clean karo (sirf practice machine pe!)
  sudo find /var/log -name "*.log" -mtime +30 -delete
  
  # Log rotation setup karo
  sudo nano /etc/logrotate.d/myapp
  ```
  Content:
  ```
  /var/log/myapp/*.log {
      daily
      rotate 7
      compress
      missingok
      notifempty
  }
  ```
- **Prevention:** Log rotation pehle se configure karo. Monitoring setup karo jo alert de jab disk 80% full ho.
- **Learning:** Production mein disk full hona common hai. `df -h` aur `du -sh` tumhare best friends hain.

---

## Incident #2: "Mera Command Kaam Nahi Kar Raha"
- **Date:** [Tumhari date daalo]
- **What Broke:** `kubectl get pods` chalane pe "command not found" aa raha hai
- **Root Cause:** PATH environment variable mein kubectl ka path nahi hai. Naya software install kiya tha lekin terminal restart nahi kiya.
- **Fix:**
  ```bash
  # Pehle check karo kubectl kahan hai
  which kubectl
  find / -name "kubectl" 2>/dev/null
  
  # Agar mil jaye to PATH mein add karo
  export PATH=$PATH:/usr/local/bin
  
  # Permanent karo
  echo 'export PATH=$PATH:/usr/local/bin' >> ~/.bashrc
  source ~/.bashrc
  ```
- **Prevention:** Naya tool install karne ke baad `source ~/.bashrc` ya naya terminal kholo. Har tool ka path verify karo.
- **Learning:** `PATH` environment variable sabse important concept hai. `which` command batata hai ke tool kahan hai.

---

## Incident #3: "Internet Kaam Nahi Kar Raha"
- **Date:** [Tumhari date daalo]
- **What Broke:** Browser mein koi website load nahi ho rahi, lekin WiFi connected hai
- **Root Cause:** DNS server down hai. ISP ka default DNS kaam nahi kar raha.
- **Fix:**
  ```bash
  # DNS check karo
  ping 8.8.8.8          # Google DNS — agar ye kaam kare to internet hai
  ping google.com       # Agar ye fail ho to DNS issue hai
  
  # DNS temporarily change karo
  sudo nano /etc/resolv.conf
  # Add: nameserver 8.8.8.8
  # Add: nameserver 1.1.1.1
  
  # Permanent karo (Ubuntu/Debian)
  sudo nano /etc/netplan/01-config.yaml
  # Add nameservers under your interface
  
  # Test karo
  nslookup google.com
  dig google.com
  ```
- **Prevention:** Hamesha reliable DNS rakho (8.8.8.8, 1.1.1.1). Backup DNS bhi configure karo.
- **Learning:** Internet = IP address + DNS. `ping 8.8.8.8` se pata chalta hai ke internet hai ya nahi.

---

## Incident #4: "Mera Permission Denied Aa Raha Hai"
- **Date:** [Tumhari date daalo]
- **What Broke:** `sudo nano /etc/nginx/nginx.conf` chalane pe "Permission denied" aa raha hai
- **Root Cause:** File ownership tumhare user ko nahi hai. Ya sudo nahi use kiya.
- **Fix:**
  ```bash
  # Check karo file ownership
  ls -la /etc/nginx/nginx.conf
  
  # Agar sudo chahiye
  sudo nano /etc/nginx/nginx.conf
  
  # Agar ownership change karni ho
  sudo chown $USER:$USER /path/to/file
  
  # Permissions samjho
  # -rwxr-xr-x means:
  # First rwx = owner (read, write, execute)
  # Second r-x = group (read, execute)
  # Third r-x = others (read, execute)
  
  # Permission change karo
  chmod 755 /path/to/file   # rwxr-xr-x
  chmod 644 /path/to/file   # rw-r--r--
  ```
- **Prevention:** `ls -la` se pehle ownership check karo. Production mein root access mat do.
- **Learning:** Linux permissions = security foundation. `chmod`, `chown`, `ls -la` daily use honge.

---

## Incident #5: "Mera IP Address Kaise Pata Karun"
- **Date:** [Tumhari date daalo]
- **What Broke:** Server se connect ho rahe ho lekin IP address pata nahi. Ya network issue hai aur pata karna hai ke IP sahi hai.
- **Root Cause:** IP configuration check karni hai. DHCP se automatic IP mila hai ya static set hai.
- **Fix:**
  ```bash
  # Apna IP address dekho
  ip addr show
  # Ya short version
  hostname -I
  
  # Network interface details
  ip link show
  
  # Gateway check karo
  ip route show
  
  # DNS check karo
  cat /etc/resolv.conf
  
  # Connectivity test
  ping -c 4 8.8.8.8        # Internet connectivity
  ping -c 4 192.168.1.1    # Local gateway
  traceroute google.com    # Path trace
  
  # WiFi/network status
  nmcli device status
  nmcli connection show
  ```
- **Prevention:** Basic networking commands yaad karo. `ip addr`, `ping`, `traceroute` — ye 3 commands se 80% network issues solve ho jate hain.
- **Learning:** Network troubleshooting = pehle IP check karo, phir connectivity, phir DNS. Systematic approach se problem jaldi solve hoti hai.
