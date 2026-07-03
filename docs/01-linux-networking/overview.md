---
sidebar_position: 4
title: "PHASE 1: Linux + Networking + Terminal Mastery"
description: "*Est. Time: 3-5 weeks | Har DevOps/Cloud/SRE role ki bunyad*"
---

# PHASE 1: Linux + Networking + Terminal Mastery
*Est. Time: 3-5 weeks | Har DevOps/Cloud/SRE role ki bunyad*

### Kya seekhna hai
- Linux filesystem hierarchy (`/etc`, `/var`, `/home`, `/usr`, `/proc`, `/sys`)
- Basic commands: `ls, cd, pwd, cp, mv, rm, cat, less, grep, find`
- Permissions & ownership: `chmod, chown, umask, SUID/SGID`
- Process management: `ps, top, htop, kill, systemctl`
- Package management: `apt, yum, dnf`
- Shell scripting: variables, loops, conditionals, functions, `cron`
- Networking: OSI/TCP-IP model, IP addressing, subnetting, DNS, DHCP
- Protocols: HTTP/HTTPS, SSH, FTP
- Firewalls: `iptables, ufw`, security groups
- Troubleshooting: `ping, traceroute, netstat, curl, dig`
- Log management: `/var/log`, `journald`, log rotation
- Boot process: kernel → initramfs → systemd → services

### Free YouTube Courses
1. **"Linux Crash Course"** — freeCodeCamp.org (2hr, Aaron Lockhart)
2. **"Introduction to Linux – Full Course for Beginners"** — freeCodeCamp.org (6hr, Beau Carnes)
3. **"Learn Linux in 50 Minutes"** — freeCodeCamp.org (Colt Steele)
4. **"Linux for Hackers"** — NetworkChuck
5. **"Networking for Hackers" series** — NetworkChuck
6. **"Networking Fundamentals"** — TechWorld with Nana
7. **"Computer Networking Full Course"** — freeCodeCamp.org (13hr)

### Official Docs / Free Certs
- **Linux Foundation "Introduction to Linux" (LFS101x) — edX (FREE audit):** https://www.edx.org/learn/linux/the-linux-foundation-introduction-to-linux
- **Cisco Networking Basics (Free):** https://www.netacad.com/courses/networking

### Hands-on Checklist
- [ ] SSH key setup + VM connect
- [ ] Service user create, ownership assign, permission secure
- [ ] Shell script: start/stop service + log tail
- [ ] Cron-based monitoring script with alert
- [ ] Network troubleshoot karo (ping, curl, dig)

### Incident Practice
- SSH connection fail ho (wrong port/key/permission) → fix karo
- Disk full ho jaye, service crash kare → clean karke restore karo
- High CPU due to runaway process → isolate + fix karo
- Permission denied error on log writing → securely resolve karo

### Meri Recommendation
Basic commands skip karo, **shell scripting + cron + systemd + networking troubleshooting** pe 1 week zaroor lagao — yahi gaps interviews mein pakde jate hain.

---

*Back to [MERGED-ROADMAP.md](/docs/roadmap)*
