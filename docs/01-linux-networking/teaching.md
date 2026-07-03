---
sidebar_position: 2
title: "PHASE 1: Linux + Networking + Terminal Mastery"
description: "**Tumhara level:** Tum daily Linux use kar rahe ho. Is phase mein tumhare gaps fill honge — shell scripting, systemd, ne"
---

# PHASE 1: Linux + Networking + Terminal Mastery — TEACHING

> **Tumhara level:** Tum daily Linux use kar rahe ho. Is phase mein tumhare gaps fill honge — shell scripting, systemd, networking troubleshooting, aur log analysis. Ye sab interviews mein sabse zyada poochte hain.

---

## Section 1: Linux Filesystem Hierarchy — Quick Summary

```
/ (root)
├── home/     ← Tumhara personal data (tumhara /home/ali)
├── etc/      ← System configuration files (sabse important)
├── var/      ← Logs (/var/log), temporary data, spool
├── usr/      ← Installed programs, libraries
├── proc/     ← Virtual filesystem — running processes ka data
├── sys/      ← Virtual filesystem — hardware/kernel info
├── tmp/      ← Temporary files (reboot pe delete)
├── opt/      ← Third-party software install
└── bin/      ← Essential commands (ls, cp, mv)
```

**Kyun yaad rakhna zaroori hai?** Jab tum kisi server pe debug kar rahe ho, tumhe pata hona chahiye ke config file kahan hai (`/etc/`), log kahan hai (`/var/log/`), aur temp files kahan hain (`/tmp/`). Ye directories tumhari daily life mein aayengi.

**Real-world connection:** Tumhare Islamic Banking FTE ka config `/etc/nginx/nginx.conf` mein hoga, logs `/var/log/nginx/` mein, aur temp files `/tmp/` mein.

:::note HANDS-ON: Filesystem Explore Karo

:::

```bash
# Root directory structure dekho
ls -la /

# /etc mein kya kya hai — system configs
ls /etc/ | head -20

# /var/log mein kya logs hain
ls -la /var/log/

# /proc mein live system info
cat /proc/cpuinfo | grep "model name" | head -1
cat /proc/meminfo | head -5

# Current working directory
pwd

# Tum kahan ho — relative vs absolute path
cd /etc && pwd
cd ~ && pwd
```

:::caution CHECKPOINT:
1. Tumhare Islamic Banking FTE ka database config `/etc/` mein hai. Agar tumhe database URL change karna ho, to exact file path kya hoga? Agar config change karne ke baad service restart nahi ki to kya hoga?
2. Production server pe tum `/tmp/` mein kuch save karte ho. Raat ko server reboot hota hai. Subah tumhara file gayab hai — kyun? Iska permanent alternative kya hai?

:::

---

## Section 2: Essential Commands — The Ones You Actually Use

:::tip CONCEPT: Commands = Tools in Your Toolbox

Har command ka ek kaam hai. DevOps mein ye 15 commands daily aayengi:

**Navigation & Files:**
:::

```bash
ls -la          # Sab kuch dikha hidden files ke sath
cd /path        # Directory change
pwd             # Kahan ho abhi
cp -r src/ dst/ # Folder copy recursively
mv old new      # Rename ya move
rm -rf dir/     # Force delete (dhyan se!)
mkdir -p a/b/c  # Nested folders banao
touch file.txt  # Empty file banao
```

**Reading Files:**
```bash
cat file.txt           # Poori file print
head -20 file.txt      # Pehli 20 lines
tail -20 file.txt      # Aakhri 20 lines
tail -f /var/log/syslog # Live log dekho (sabse useful)
less file.txt          # Scroll karke padho (q se exit)
wc -l file.txt         # Kitni lines hain
```

**Searching:**
```bash
grep "error" /var/log/syslog        # Error dhundho
grep -rn "password" /etc/            # Recursive search
find / -name "*.log" 2>/dev/null    # File dhundho
history | grep docker                # Purane commands mein search
```

**Real-world connection:** Tumhare NexaBook mein jab koi error aaye, tum `tail -f /var/log/nginx/error.log` chalao ge live dekhne ke liye. Jab production pe koi config dhundni ho to `grep -rn "database_url" /etc/` se dhundoge.

:::note HANDS-ON: Commands Practice Karo

:::

```bash
# Ek test environment banao
mkdir -p /tmp/linux-practice && cd /tmp/linux-practice

# Files banao
touch file1.txt file2.txt file3.txt
echo "Hello World" > file1.txt
echo "Error: Connection failed" > file2.txt
echo "User login successful" > file3.txt

# ls practice
ls -la
ls -lth   # Time sorted — sabse recent upar

# grep practice
grep "Error" *.txt
grep -i "error" *.txt    # Case insensitive
grep -c "error" *.txt    # Count matches

# find practice
find /tmp/linux-practice -name "*.txt"
find /tmp/linux-practice -name "*.txt" -exec cat {} \;

# tail -f practice (Ctrl+C se band karo)
echo "Line 1" >> /tmp/linux-practice/test.log
# Naye terminal mein:
tail -f /tmp/linux-practice/test.log
echo "Line 2" >> /tmp/linux-practice/test.log  # Live dikh jayega

# Cleanup
cd ~ && rm -rf /tmp/linux-practice
```

:::caution CHECKPOINT:
1. Tumhare NexaBook ke production server pe error logs 50,000+ lines hain. Tumhe sirf last 1 ghante ke errors dhundne hain. Kaunsi command combination use karoge? (Hint: `grep` + `awk` ya `journalctl`)
2. `tail -f` aur `tail -F` mein kya fark hai? Agar nginx ka log file rotate ho jaaye (purana file delete, naya file bana) to `tail -f` kya karega? `tail -F` kya karega?

:::

---

## Section 3: Permissions — Sabse Confusing Topic, Sabse Important

:::tip CONCEPT: Permissions = Kaun Kya Kar Sakta Hai

Linux mein har file ke 3 permissions hote hain:
- **r (read)** — padh sakta hai (4)
- **w (write)** — likh sakta hai (2)
- **x (execute)** — chala sakta hai (1)

Ye 3 logon ke liye hota hain:
- **User (u)** — file ka owner
- **Group (g)** — us group ke log
- **Others (o)** — baaki sab

Example: `-rwxr-xr--` ka matlab hai:
- `-` = ye file hai (d hota to directory)
- `rwx` = owner: read + write + execute (7)
- `r-x` = group: read + execute (5)
- `r--` = others: sirf read (4)

**Numerical: 754** — owner ko 7, group ko 5, others ko 4.

### HANDS-ON: Permissions Practice Karo

:::

```bash
# Permissions dekho
ls -la /tmp/

# Naya file banao aur permissions change karo
echo "test" > /tmp/test-perm.txt
ls -la /tmp/test-perm.txt   # Default permissions: -rw-r--r--

# chmod se permissions badlo
chmod 755 /tmp/test-perm.txt   # rwxr-xr-x
ls -la /tmp/test-perm.txt

chmod 644 /tmp/test-perm.txt   # rw-r--r--
ls -la /tmp/test-perm.txt

chmod 700 /tmp/test-perm.txt   # rwx------
ls -la /tmp/test-perm.txt

# Symbolic mode
chmod u+x /tmp/test-perm.txt   # Owner ko execute do
chmod g-w /tmp/test-perm.txt   # Group se write hatao
chmod o-r /tmp/test-perm.txt   # Others se read hatao

# Ownership change (sudo zaroori)
sudo chown ali:ali /tmp/test-perm.txt

# Cleanup
rm /tmp/test-perm.txt
```

:::caution CHECKPOINT:
1. Tumhare Islamic Banking FTE ka `.env` file mein database password hai. Permission `644` hai. Kya koi aur user (e.g., `www-data`) isko padh sakta hai? Agar haan to ye kitna dangerous hai banking context mein? Isko secure kaise karoge?
2. `chmod 777 /var/www/html/` karne se kya hota hai? Agar koi attacker server pe access le le to kya kar sakta hai is directory ke sath?
3. `chown` aur `chmod` mein kya fark hai? Agar tumhara Node.js app `www-data` user pe chalta hai aur tumne file ka owner `root` rakh diya, to kya problem aa sakti hai?

:::

---

## Section 4: Process Management — Kaun Chal Raha Hai, Kaise Rokein

:::tip CONCEPT: Processes = Running Programs

Jab bhi tum koi command chalate ho, wo ek **process** ban jaata hai. Har process ka ek **PID (Process ID)** hota hai.

:::

```bash
# Sab processes dekho
ps aux

# Sirf apne processes
ps aux | grep python

# htop — interactive process viewer (zyada useful)
htop

# Kisi process ko band karo
kill PID           # Graceful shutdown (SIGTERM)
kill -9 PID        # Force kill (SIGKILL — last resort)

# Kisi command ko background mein chalao
long-running-command &

# Background mein chal rahi cheezein dekho
jobs
fg %1   # Foreground mein lao
```

:::tip CONCEPT: systemd — Service Manager

**systemd** Linux ka service manager hai. Ye decide karta hai kaunsi service kab start/stop hogi.

:::

```bash
# Service ki status dekho
systemctl status nginx
systemctl status sshd

# Service start/stop/restart
sudo systemctl start nginx
sudo systemctl stop nginx
sudo systemctl restart nginx

# Service ko boot pe auto-start banao
sudo systemctl enable nginx
sudo systemctl disable nginx

# Sab active services dekho
systemctl list-units --type=service --state=active

# Service ke logs dekho
journalctl -u nginx -f         # Live logs
journalctl -u nginx --since "1 hour ago"
```

**Real-world connection:** Tumhare Islamic Banking FTE ke liye nginx, PostgreSQL, aur Node.js services hongi. Agar FTE down ho, tum `systemctl status nginx` pehle check karoge — agar "inactive (dead)" dikhae to `sudo systemctl restart nginx` karoge.

:::note HANDS-ON: Process & systemd Practice Karo

:::

```bash
# Ek dummy service banao
cat > /tmp/test-service.sh << 'EOF'
#!/bin/bash
while true; do
    echo "$(date): Service running" >> /tmp/test-service.log
    sleep 5
done
EOF
chmod +x /tmp/test-service.sh

# Background mein chalao
/tmp/test-service.sh &
SERVICE_PID=$!
echo "Service PID: $SERVICE_PID"

# Check karo chal rahi hai
ps aux | grep test-service
tail -f /tmp/test-service.log

# Band karo
kill $SERVICE_PID
echo "Service stopped"

# Cleanup
rm /tmp/test-service.sh /tmp/test-service.log
```

:::caution CHECKPOINT:
1. `kill` (SIGTERM) aur `kill -9` (SIGKILL) mein kya fark hai? Agar tumhare Islamic Banking FTE ka transaction process ongoing hai aur tum `kill -9` maar do, to kya hoga? Data loss ho sakta hai?
2. NexaBook ka Node.js process raat 3 AM pe crash hota hai. Tum so rahe ho. systemd se kaise ensure karoge ke process automatically restart ho? Aur tumhe kaise pata chalega ke crash hua tha? (Hint: `Restart=always` + `journalctl` + email notification)
3. `ps aux` aur `htop` mein kya fark hai? Production debugging mein kaunsa better hai aur kyun?

:::

---

## Section 5: Shell Scripting — Automation Ki Duniya

:::tip CONCEPT: Shell Script = ek Text File Jo Commands Run Karti Hai

Jab tum ek command baar baar chalate ho, usko script mein daal do. Ye tumhari pehli automation hai.

**Basic Structure:**
:::

```bash
#!/bin/bash
# Shebang — ye bash script hai

# Variables
NAME="Ali"
echo "Hello, $NAME"

# User input
read -p "Enter your name: " USER_NAME
echo "Welcome, $USER_NAME"

# Conditionals
if [ -f "/etc/nginx/nginx.conf" ]; then
    echo "Nginx config exists"
else
    echo "Nginx config not found"
fi

# Loops
for i in 1 2 3 4 5; do
    echo "Number: $i"
done

# Loop through files
for file in /var/log/*.log; do
    echo "Log file: $file"
done

# Error handling
set -e   # Script band ho jaye agar koi command fail ho
set -x   # Har command print ho (debugging ke liye)

# Functions
check_disk() {
    USAGE=$(df -h / | awk 'NR==2 {print $5}' | tr -d '%')
    if [ "$USAGE" -gt 80 ]; then
        echo "WARNING: Disk usage is ${USAGE}%"
    fi
}

# Function call
check_disk
```

:::tip CONCEPT: Cron Jobs — Schedule Your Automation

**Cron** tumhe allow karta hai ke scripts automatically run hon — ek baar, roz, har hafta, etc.

:::

```bash
# Cron edit karo
crontab -e

# Format: minute hour day month weekday command
# ┌───── minute (0-59)
# │ ┌───── hour (0-23)
# │ │ ┌───── day (1-31)
# │ │ │ ┌───── month (1-12)
# │ │ │ │ ┌───── weekday (0-7, 0=7=Sun)
# │ │ │ │ │
# * * * * * command

# Examples:
# Har 5 minute mein disk check
*/5 * * * * /home/ali/scripts/check-disk.sh

# Roz raat 2 AM pe backup
0 2 * * * /home/ali/scripts/backup.sh

# Har hafta Monday ko cleanup
0 8 * * 1 /home/ali/scripts/cleanup.sh

# Cron jobs dekho
crontab -l
```

:::note HANDS-ON: Scripting Practice Karo

**Task 1: Disk Monitoring Script**

:::

```bash
cat > /tmp/check-disk.sh << 'EOF'
#!/bin/bash
set -e

THRESHOLD=80
USAGE=$(df -h / | awk 'NR==2 {print $5}' | tr -d '%')

if [ "$USAGE" -gt "$THRESHOLD" ]; then
    echo "WARNING: Disk usage is ${USAGE}% (threshold: ${THRESHOLD}%)"
    echo "Top 5 directories by size:"
    du -sh /* 2>/dev/null | sort -rh | head -5
    exit 1
else
    echo "OK: Disk usage is ${USAGE}%"
    exit 0
fi
EOF
chmod +x /tmp/check-disk.sh
/tmp/check-disk.sh
rm /tmp/check-disk.sh
```

**Task 2: Log Rotation Script**

```bash
cat > /tmp/rotate-logs.sh << 'EOF'
#!/bin/bash
LOG_DIR="/var/log/myapp"
KEEP_DAYS=7

echo "Rotating logs older than ${KEEP_DAYS} days..."
find "$LOG_DIR" -name "*.log" -mtime +$KEEP_DAYS -delete
echo "Done. Remaining files:"
ls -la "$LOG_DIR"
EOF
chmod +x /tmp/rotate-logs.sh
```

:::caution CHECKPOINT:
1. `set -e` aur `set -x` dono ek script mein kyun use karte hain? Agar tumhare NexaBook ka deployment script mein `set -e` nahi hai to kya ho sakta hai? Real example do.
2. Tumhara backup script raat 2 AM pe chalta hai. Script fail ho jaati hai. Tum so rahe ho. Subah uthke kaise pata chalega ke backup nahi hua? 3 tarike batao jo production mein use hote hain.
3. Cron job mein `0 2 * * * /scripts/backup.sh` likha hai. Agar backup script 30 minute leta hai aur 2:15 pe ek aur cron job chalti hai jo backup file use karti hai — to kya problem aa sakti hai? Isko kaise handle karoge?

:::

---

## Section 6: Networking Deep Dive — Tumhe Ye Aana Chahiye

:::tip CONCEPT: OSI Model — 7 Layers of Networking

Jab tum `curl https://nexabook.com` likhte ho, kya hota hai? Ye 7 layers se guzarta hai:

:::

```
Layer 7: Application    — HTTP, HTTPS, DNS, SSH (tumhara browser/terminal)
Layer 6: Presentation   — SSL/TLS encryption, data format
Layer 5: Session        — Connection manage karta hai
Layer 4: Transport      — TCP (reliable) ya UDP (fast) — port numbers
Layer 3: Network        — IP addressing, routing — kahan jaana hai
Layer 2: Data Link      — MAC address — physical device identification
Layer 1: Physical       — Cable, WiFi, electrical signals
```

**Yaad rakhne ka tarika:**
```
Please Do Not Throw Sausage Pizza Away
(Physical, Data, Network, Transport, Session, Presentation, Application)
```

**Real-world connection:** Tumhare Islamic Banking FTE mein jab transaction hoti hai:
- Layer 7: tumhara frontend `POST /api/transaction` bhejta hai
- Layer 4: TCP connection establish hota hai port 443 pe
- Layer 3: IP packets route hote hain tumhare server tak
- Layer 1: Fiber optic cable se data travel karta hai

:::tip CONCEPT: TCP/IP Model — Simplified Version (4 Layers)

Production mein tum OSI ki jagah TCP/IP model use karte ho:

:::

```
TCP/IP Model          |  OSI Equivalent   |  Kya karta hai
──────────────────────────────────────────────────────────────
Application Layer     |  Layer 7,6,5      |  HTTP, DNS, SSH
Transport Layer       |  Layer 4          |  TCP (reliable), UDP (fast)
Internet Layer        |  Layer 3          |  IP addressing, routing
Network Access Layer  |  Layer 2,1        |  Ethernet, WiFi
```

**TCP vs UDP:**
```
TCP (Transmission Control Protocol):
├── Reliable — agar packet gaya to dobara bhejta hai
├── Ordered — packets sahi order mein aate hain
├── Slow — handshake lagta hai (SYN → SYN-ACK → ACK)
├── Use: HTTP, SSH, FTP, Database connections
└── Example: Banking transaction (data loss acceptable nahi)

UDP (User Datagram Protocol):
├── Fast — handshake nahi
├── Unordered — packets kisi bhi order mein aa sakte hain
├── Unreliable — packet gaya to gaya
├── Use: DNS lookup, video streaming, gaming
└── Example: DNS query (fast chahiye, ek query fail ho to dobara bhejo)
```

:::tip CONCEPT: IP Addressing — Tumhara Digital Address

Har device ka ek IP address hota hai — ye uska digital address hai.

:::

```
IPv4: 192.168.1.100    (32-bit, 4 octets, e.g. 255.255.255.255)
IPv6: 2001:0db8::1    (128-bit, for future)

Private IP ranges (sirf internal network):
├── 10.0.0.0 — 10.255.255.255     (10.0.0.0/8)
├── 172.16.0.0 — 172.31.255.255   (172.16.0.0/12)
└── 192.168.0.0 — 192.168.255.255 (192.168.0.0/16)

Public IP: Internet pe accessible (tumhara server ka IP)
Private IP: Sirf internal network mein (tumhara laptop ka WiFi IP)
```

:::tip CONCEPT: Subnetting — Network Ko Todna

Subnetting = ek bada network chhote chhote networks mein todna. Security aur management ke liye.

:::

```
IP Address: 192.168.1.100
Subnet Mask: 255.255.255.0 (/24)

/24 ka matlab hai:
├── Pehle 24 bits network ke hain (192.168.1)
└── Last 8 bits host ke hain (100)

Total hosts: 2^8 - 2 = 254 (1 aur 255 reserved hain)
Network address: 192.168.1.0
Broadcast address: 192.168.1.255
Usable range: 192.168.1.1 — 192.168.1.254
```

**Common Subnet Masks:**
```
/24 = 255.255.255.0   = 254 hosts    (small office)
/16 = 255.255.0.0     = 65,534 hosts (big company)
/8  = 255.0.0.0       = 16M hosts    (ISP)
/32 = 255.255.255.255 = 1 host       (single server)
```

**Subnetting Calculation:**
```
Question: 192.168.1.0/26 mein kitne usable hosts hain?

/26 ka matlab hai:
├── Network bits: 26
├── Host bits: 32 - 26 = 6
├── Total IPs: 2^6 = 64
├── Usable hosts: 64 - 2 = 62 (network aur broadcast address)
└── Range: 192.168.1.0 — 192.168.1.63

Network address: 192.168.1.0
First usable: 192.168.1.1
Last usable: 192.168.1.62
Broadcast: 192.168.1.63
```

**Real-world connection:** Tumhare NexaBook ke AWS VPC mein:
```
VPC: 10.0.0.0/16 (65,534 IPs)
├── Public Subnet: 10.0.1.0/24 (254 IPs) — Web servers
├── Private Subnet: 10.0.2.0/24 (254 IPs) — Database
└── Private Subnet: 10.0.3.0/24 (254 IPs) — Internal services
```

:::note HANDS-ON: Subnetting Practice

:::

```bash
# IP address info dekho
ip addr show                    # Tumhara IP address
ip route show                   # Routing table
ifconfig                        # Purana command (still works)

# Network calculator (Python se)
python3 -c "
import ipaddress
network = ipaddress.ip_network('192.168.1.0/26')
print(f'Network: {network.network_address}')
print(f'Broadcast: {network.broadcast_address}')
print(f'Usable hosts: {network.num_addresses - 2}')
print(f'Host range: {list(network.hosts())[:3]}...{list(network.hosts())[-1]}')
"

# CIDR notation practice
python3 -c "
import ipaddress
# Convert subnet mask to CIDR
mask = '255.255.255.0'
cidr = ipaddress.IPv4Network(f'0.0.0.0/{mask}').prefixlen
print(f'{mask} = /{cidr}')

# How many hosts?
cidr = 26
hosts = 2**(32-cidr) - 2
print(f'/{cidr} = {hosts} usable hosts')
"
```

:::tip CONCEPT: Ports — Tumhara Service Ka Door

Har service ek port pe chalti hai. Port number 0-65535 tak hota hai.

:::

```
Well-known ports (0-1023):
├── 22: SSH
├── 80: HTTP
├── 443: HTTPS
├── 3306: MySQL
├── 5432: PostgreSQL
├── 6379: Redis
└── 8080: Common alt HTTP

Dynamic ports (1024-65535):
└── Tumhare apps ke liye (3000, 4000, 8000 etc.)
```

:::tip CONCEPT: DNS — Internet Ka Phonebook

DNS domain name ko IP mein convert karta hai. `nexabook.com` → `52.66.123.45`

:::

```
DNS Resolution Process:
1. Tum `curl https://nexabook.com` likhte ho
2. Pehle local cache check hota hai
3. Agar nahi mila to DNS server jaata hai
4. DNS server root nameserver se poochta hai
5. Root → TLD (.com) → Authoritative nameserver
6. IP address milta hai (52.66.123.45)
7. Connection establish hota hai
```

:::note HANDS-ON: Networking Troubleshooting Practice

:::

```bash
# Connectivity check
ping 8.8.8.8                    # Internet chal raha hai?
ping google.com                 # DNS kaam kar raha hai?

# DNS resolution
nslookup google.com             # Basic
dig google.com                  # Detailed
dig +short google.com           # Sirf IP
dig google.com +trace           # Poori resolution path dekho

# Website se baat karo
curl -v https://google.com      # Verbose — sab details
curl -o /dev/null -s -w "HTTP: %{http_code}, Time: %{time_total}s\n" https://google.com

# Port check
ss -tuln                        # Kaunsi service kis port pe
netstat -tuln                   # Same, but older
telnet localhost 80              # Port open hai?

# Network paths trace karo
traceroute google.com           # Route dekho
mtr google.com                  # Continuous traceroute

# Firewall
sudo ufw status                 # Ubuntu firewall
sudo iptables -L -n             # Detailed rules

# Connection test
timeout 5 bash -c 'echo > /dev/tcp/google.com/80' && echo "Port 80 open" || echo "Port 80 closed"

# HTTP debug
curl -v https://httpbin.org/status/200  # Headers dekho
curl -v https://httpbin.org/status/500  # Error response

# Port scan (sirf apne server pe!)
ss -tuln | grep -E "LISTEN|ESTABLISHED"
```

:::tip CONCEPT: SSH — Tumhara Remote Control

SSH se tum kisi bhi remote server ko apne computer ki tarah control kar sakte ho.

:::

```bash
# Basic SSH connection
ssh user@hostname
ssh ali@192.168.1.100

# Key-based authentication (password ki zaroorat nahi)
ssh-keygen -t ed25519 -C "ali@example.com"
ssh-copy-id ali@192.168.1.100

# Config file banao — easy connection
cat > ~/.ssh/config << 'EOF'
Host nexabook-server
    HostName 192.168.1.100
    User ali
    Port 22
    IdentityFile ~/.ssh/id_ed25519

Host banking-fte
    HostName 10.0.0.50
    User deploy
    Port 2222
    IdentityFile ~/.ssh/id_ed25519
EOF

# Ab bas: ssh nexabook-server
# Port forward (tunnel)
ssh -L 5432:localhost:5432 ali@nexabook-server
# Ab localhost:5432 pe remote PostgreSQL access hoga
```

**Real-world connection:** Tumhare NexaBook server pe SSH se login karoge, deploy karoge, logs check karoge. SSH keys setup karo taake password na likhna pade.

:::caution CHECKPOINT:
1. Agar `ping google.com` kaam kare lekin `curl https://google.com` na kare, to problem kya ho sakti hai? (Hint: Layer 7 vs Layer 3)
2. TCP aur UDP mein kya fark hai? Agar tumhare Islamic Banking FTE mein transaction data UDP pe bheje to kya hoga?
3. 192.168.1.0/26 network mein kitne usable hosts hain? Pehle aur last usable IP address kya hain?
4. SSH key aur SSH password mein kya fark hai? Production servers pe kaunsa prefer karte hain aur kyun?

:::

---

## Section 7: Log Management — Production Mein Sabse Zyada Kaam Aayega

:::tip CONCEPT: Logs = Tumhari CCTV Footage

Jab kuch galat hota hai, logs se pata chalta hai kya hua. DevOps engineer ka pehla kaam hota hai logs check karna.

:::

```bash
# System logs
sudo journalctl                    # Sab logs
sudo journalctl -u nginx           # Sirf nginx ke logs
sudo journalctl -u nginx -f        # Live logs (tail -f jaisa)
sudo journalctl --since "1 hour ago"
sudo journalctl --since "2024-01-01" --until "2024-01-02"

# Application logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Log analysis
grep "500" /var/log/nginx/access.log | wc -l    # Kitne 500 errors
awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -rn | head  # Top IPs

# Log rotation setup
cat > /etc/logrotate.d/myapp << 'EOF'
/var/log/myapp/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        systemctl reload nginx > /dev/null 2>&1 || true
    endscript
}
EOF
```

**Real-world connection:** Tumhare Islamic Banking FTE mein jab koi transaction fail ho, tum `journalctl -u banking-fte --since "5 minutes ago"` se turant pata laga sakte ho kya hua.

---

## Section 8: Boot Process — Server Rise Kaise Hota Hai

:::tip CONCEPT: Boot Process = Server Ka Morning Routine

Jab tum server restart karte ho ya power on karte ho, ek defined sequence hota hai. Har step ka ek kaam hai. Agar kisi step pe fail ho jaye to server boot nahi karega.

:::

```
Power On
  ↓
BIOS/UEFI (Hardware check, POST test)
  ↓
Bootloader (GRUB — decide karta hai kaunsa kernel chalega)
  ↓
Kernel (Linux kernel load hota hai — heart of OS)
  ↓
initramfs (Temporary root filesystem — drivers load karte hain)
  ↓
systemd (PID 1 — sabse pehla process, service manager)
  ↓
Services (nginx, sshd, postgresql — jo tum enable karte ho)
  ↓
Login Prompt (Server ready hai)
```

**Har step ka detail:**

**Step 1: BIOS/UEFI**
- Hardware check karta hai (RAM, CPU, disk)
- POST (Power-On Self-Test) karta hai
- Boot device dhundhta hai (disk, USB, network)
- UEFI modern hai, BIOS purana hai

**Step 2: GRUB Bootloader**
- Disk pe GRUB installed hota hai
- Decide karta hai kaunsa kernel version chalega
- Agar multiple OS hain to menu dikhata hai
- `/boot/grub/grub.cfg` mein configuration hoti hai

**Step 3: Kernel**
- `vmlinuz` file hoti hai `/boot/` mein
- Hardware drivers load karta hai
- Memory management, process scheduling shuru karta hai
- `dmesg` se kernel messages dekh sakte ho

**Step 4: initramfs**
- Temporary root filesystem hai
- Real filesystem mount karne ke liye drivers load karta hai
- LVM, RAID, encrypted disk ke liye zaroori hai
- `initrd.img` file hoti hai

**Step 5: systemd (PID 1)**
- Sabse pehla process jo start hota hai
- Service manager hai — sab services manage karta hai
- Targets define karta hai (multi-user.target, graphical.target)
- `systemctl` command systemd ko control karti hai

**Step 6: Services**
- Jo services `systemctl enable` ki hain wo start hoti hain
- `/etc/systemd/system/` mein service files hoti hain
- Dependency-based startup (pehle network, phir web server)

**Kyun jaanna zaroori hai?**

Tumhare Islamic Banking FTE ke liye:
- Agar server boot nahi ho raha → GRUB corrupt hai ya disk fail hai
- Agar boot ho raha hai lekin service nahi start ho rahi → systemd issue
- Agar network nahi mil raha → boot pe network service start nahi hui
- Agar disk mount nahi ho raha → initramfs mein drivers missing hain

:::note HANDS-ON: Boot Process Explore Karo

:::

```bash
# Boot time kitna laga
systemd-analyze
# Output: "Startup finished in 1.234s (kernel) + 5.678s (initrd) + 12.345s (userspace) = 19.258s"

# Sabse zyada waqt kis service ne liya
systemd-analyze blame
# Output: 8.123s cloud-init.service
#         3.456s nginx.service
#         1.234s ssh.service

# Critical chain — kaunsi service sabse last mein ready hui
systemd-analyze critical-chain
# Output: graphical.target @12.345s
#         └─nginx.service @8.901s +1.234s
#           └─network.target @5.678s

# Current boot ke logs dekho
journalctl -b | head -50

# Previous boot ke logs (agar current boot fail ho)
journalctl -b -1 | head -50

# Kernel messages dekho
dmesg | head -30

# Kaunsa kernel version chal raha hai
uname -r

# GRUB configuration dekho
cat /boot/grub/grub.cfg | head -30

# Systemd targets dekho
systemctl list-units --type=target

# Kaunsi target active hai
systemctl get-default  # graphical.target ya multi-user.target
```

:::tip CONCEPT: systemd Advanced — Service Files Kaise Bante Hain

Agar tumhare NexaBook ka Node.js service ko systemd se manage karna ho:

:::

```ini
# File: /etc/systemd/system/nexabook.service
[Unit]
Description=Nexabook Node.js Application
After=network.target postgresql.service
Wants=postgresql.service

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/opt/nexabook
ExecStart=/usr/bin/node /opt/nexabook/dist/index.js
ExecReload=/bin/kill -HUP $MAINPID
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal
SyslogIdentifier=nexabook

# Security hardening
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/opt/nexabook/data /var/log/nexabook

[Install]
WantedBy=multi-user.target
```

```bash
# Service file banao
sudo nano /etc/systemd/system/nexabook.service

# systemd ko batao naya service aaya
sudo systemctl daemon-reload

# Service enable karo (boot pe start hogi)
sudo systemctl enable nexabook

# Service start karo
sudo systemctl start nexabook

# Status check karo
sudo systemctl status nexabook

# Logs dekho
journalctl -u nexabook -f

# Service restart karo
sudo systemctl restart nexabook

# Service stop karo
sudo systemctl stop nexabook

# Service disable karo (boot pe start nahi hogi)
sudo systemctl disable nexabook
```

:::tip CONCEPT: Boot Failures — Common Problems

**Problem 1: GRUB Rescue Mode**
:::

```
Error: unknown filesystem
grub rescue>
```
- GRUB corrupt ho gaya hai
- Fix: Live USB se boot karo, GRUB reinstall karo

**Problem 2: Kernel Panic**
```
Kernel panic - not syncing: VFS: Unable to mount root fs
```
- Kernel root filesystem mount nahi kar pa raha
- Fix: GRUB mein different kernel version select karo

**Problem 3: Service Fails to Start**
```
Job for nginx.service failed because the control process exited with error code
```
- Configuration file mein error hai
- Fix: `journalctl -u nginx -xe` se error dekho

**Problem 4: Disk Mount Fails**
```
Welcome to emergency mode!
```
- `/etc/fstab` mein galat entry hai
- Fix: `mount -o remount,rw /` karke fstab fix karo

:::caution CHECKPOINT:
1. Agar tumhara server GRUB rescue mode mein atak jaaye, to tum kya karoge? Step-by-step batao.
2. systemd mein `Restart=always` aur `RestartSec=5` ka kya effect hai? Agar tumhara NexaBook crash ho jaaye to kya hoga?
3. Agar tum `journalctl -b` se current boot ke logs dekho aur `journalctl -b -1` se previous boot ke — dono mein kya fark hota hai? Kab previous boot ke logs dekhne chahiye?

:::

---

## Summary: Phase 1 Key Takeaways

| Concept | Tumne Kya Seekha |
|---------|-----------------|
| Filesystem | `/etc/` = config, `/var/log/` = logs, `/proc/` = live data |
| Commands | `grep`, `find`, `tail -f`, `awk` — daily tools |
| Permissions | `chmod`, `chown`, numeric (755, 644) |
| Processes | `ps aux`, `kill`, `systemctl` |
| Shell Scripting | Variables, loops, conditionals, `set -e` |
| Cron | Schedule automation — `crontab -e` |
| Networking | `ping`, `dig`, `curl`, `ss -tuln`, SSH |
| Logs | `journalctl`, `tail -f`, `grep` in logs |

---

## MINI-TASKS

### Task 1: Disk Monitoring Script (15 min)
Ek script banao jo check kare ke disk usage 80% se zyada hai ya nahi. Agar zyada hai to warning de. Script ko cron mein daalo jo har 5 minute mein chale.

### Task 2: SSH Setup (10 min)
Apne kisi bhi server pe SSH key-based authentication setup karo. Password login disable karo.

### Task 3: Log Analysis (15 min)
Apne kisi bhi server ke nginx/access.log ko analyze karo:
- Sabse zyada hit hone wale 5 IP addresses nikalo
- Kitne 404 errors aaye hain
- Kitne 500 errors aaye hain

Ye 3 tasks tumhare daily kaam mein directly aayenge.

---

## INCIDENT.md: Practice Scenarios

### Incident #1: Service Down — Nginx 502 Bad Gateway
- **What Broke:** Website pe "502 Bad Gateway" aa raha hai
- **Root Cause:** Nginx chal raha hai lekin backend (Node.js) crash ho gaya hai
- **Fix:**
  ```bash
  # Check nginx status
  sudo systemctl status nginx
  
  # Check backend status
  sudo systemctl status nexabook-backend
  
  # Backend logs dekho
  journalctl -u nexabook-backend -f
  
  # Backend restart karo
  sudo systemctl restart nexabook-backend
  
  # Verify
  curl -I https://nexabook.com
  ```
- **Prevention:** systemd mein `Restart=always` lagao taake backend auto-restart ho

### Incident #2: Disk Full — Deployment Fail
- **What Broke:** `No space left on device` error
- **Root Cause:** `/var/log/` mein 50GB logs jam ho gayi
- **Fix:**
  ```bash
  df -h                              # Confirm karo
  du -sh /var/log/* | sort -rh | head  # Sabse bade files
  sudo find /var/log -name "*.gz" -delete  # Purani compressed logs
  sudo journalctl --vacuum-size=500M       # Journalctl cleanup
  ```
- **Prevention:** Log rotation setup karo (`/etc/logrotate.d/`)

---

*Next: Phase 2 — Git & Version Control jab bolo "next"*
