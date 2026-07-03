---
sidebar_position: 4
title: "PHASE 3: Programming — Python + Bash + Type-Driven Development"
description: "**Tumhara level:** Tum AI agents se code generate karwate ho. Is phase mein tum wo seekhoge jo tumhe AI ka output verify"
---

# PHASE 3: Programming — Python + Bash + Type-Driven Development — TEACHING

> **Tumhara level:** Tum AI agents se code generate karwate ho. Is phase mein tum wo seekhoge jo tumhe AI ka output verify karne, review karne, aur production ke liye ready karne dega. Coding se zyada **type-driven thinking, testing, aur code review** pe focus hai. Python tumhara primary automation language hai — AgentFactory, LangChain, OpenAI SDK sab Python-first hain.

---

## Section 1: Python Setup — Virtual Environments & Project Structure

:::tip CONCEPT: Virtual Environment = Tumhara Isolated Workspace

Har Python project ka apna environment hona chahiye. Bina virtual environment ke, packages global install hote hain aur version conflicts hoti hain. Ye tumhare Islamic Banking FTE ka structure hai — alag-alag services ke alag dependencies hain.

:::

```bash
# Virtual environment banao
python3 -m venv venv

# Activate karo
source venv/bin/activate    # Linux/Mac
# venv\Scripts\activate     # Windows

# Check karo kaunsa python use ho raha hai
which python
# Output: /home/ali/project/venv/bin/python  (NOT /usr/bin/python)

# Packages install karo
pip install requests fastapi pytest pydantic

# Freeze karo — exact versions lock karo
pip freeze > requirements.txt

# Dobara install karo (kisi aur machine pe)
pip install -r requirements.txt

# Deactivate
deactivate
```

**Why this matters:** Tumhare Islamic Banking FTE mein agar Flask 2.0 chahiye aur NexaBook mein Flask 3.0, to bina virtual environment ke dono conflict karenge. Virtual environment ye solve karta hai.

:::tip CONCEPT: Project Structure — Clean Code Ka Foundation

:::

```
nexabook-api/
├── venv/                    # Virtual environment (gitignore mein add karo)
├── src/
│   ├── __init__.py          # Python package banata hai
│   ├── main.py              # Entry point
│   ├── config.py            # Configuration
│   └── models/
│       ├── __init__.py
│       └── user.py          # User models
├── tests/
│   ├── __init__.py
│   └── test_main.py
├── requirements.txt         # Dependencies lock
├── .gitignore               # venv/ aur __pycache__/ ignore karo
└── README.md
```

```python
# src/__init__.py — empty file, but zaroori hai
# Iske bina Python "src" ko package nahi samajhta

# src/main.py
from src.config import settings
from src.models.user import User

def main():
    user = User(name="Ali", email="ali@example.com")
    print(f"Welcome {user.name}")

if __name__ == "__main__":
    # Ye tab execute hota hai jab directly run karo: python src/main.py
    # Import karne pe execute nahi hota
    main()
```

:::note HANDS-ON: Project Setup Practice

:::

```bash
# Naya project banao
mkdir my-devops-tool && cd my-devops-tool
python3 -m venv venv
source venv/bin/activate

# Structure banao
mkdir -p src/models tests

# Files create karo
touch src/__init__.py src/main.py src/config.py
touch src/models/__init__.py src/models/user.py
touch tests/__init__.py tests/test_main.py
touch requirements.txt .gitignore

# .gitignore mein add karo
echo -e "venv/\n__pycache__/\n*.pyc\n.env" > .gitignore

# Test karo
python src/main.py
```

:::caution CHECKPOINT:
1. `python src/main.py` aur `python -c "from src import main"` mein kya fark hai? `if __name__ == "__main__"` kyun zaroori hai?
2. Agar tumhare team member ne `pip install requests` global kiya instead of venv mein, to kya problem hogi? Kaise pata chalega ke galti hui hai?

:::

---

## Section 2: Data Structures & Comprehensions — Tumhari Daily Tools

:::tip CONCEPT: Data Structures = Data Ko Organize Karna

:::

```python
# List — ordered, mutable, duplicates allowed
servers = ["web-01", "web-02", "db-01"]
servers.append("cache-01")
servers.remove("db-01")
servers[0]  # "web-01"
len(servers)  # 3

# Slicing — list ka chunk nikalo
recent_logs = logs[-100:]  # Last 100 logs
first_five = logs[:5]

# Dict — key-value pairs (sabse useful DevOps mein)
server_config = {
    "host": "10.0.1.50",
    "port": 8080,
    "health_check": "/health",
    "timeout": 30
}
server_config["host"]           # "10.0.1.50"
server_config.get("retries", 3) # Safe access — default 3 if key missing

# Iterating dict
for key, value in server_config.items():
    print(f"{key}: {value}")

# Set — unique items, no duplicates
error_codes = {"500", "404", "500", "503"}
# Result: {"500", "404", "503"}
len(error_codes)  # 3

# Set operations
healthy_codes = {"200", "201", "204"}
all_codes = error_codes | healthy_codes  # Union
common = error_codes & healthy_codes      # Intersection (empty here)

# Tuple — ordered, immutable (can't change after creation)
coordinates = (33.6941, 73.0479)
# coordinates[0] = 10  # ERROR! Tuples are immutable

# When to use tuple vs list?
# List: jab change hona chahiye (servers add/remove)
# Tuple: jab fixed hona chahiye (coordinates, RGB colors, DB credentials)
```

:::tip CONCEPT: List/Dict Comprehensions — Pythonic Way

:::

```python
# List comprehension — for loop ka short form
# Without comprehension
error_logs = []
for log in logs:
    if "ERROR" in log:
        error_logs.append(log)

# With comprehension — 1 line
error_logs = [log for log in logs if "ERROR" in log]

# Dict comprehension
# Server list ko dict banao
server_list = [("web-01", "10.0.1.1"), ("web-02", "10.0.1.2"), ("db-01", "10.0.2.1")]
server_map = {name: ip for name, ip in server_list}
# Result: {"web-01": "10.0.1.1", "web-02": "10.0.1.2", "db-01": "10.0.2.1"}

# Nested comprehension — flatten nested lists
log_groups = [["log1", "log2"], ["log3"], ["log4", "log5"]]
all_logs = [log for group in log_groups for log in group]
# Result: ["log1", "log2", "log3", "log4", "log5"]

# Generator expression — memory efficient (large data ke liye)
# Ye ek ek karke yield karta hai, poori list memory mein nahi leta
large_dataset = (x * 2 for x in range(1000000))
next(large_dataset)  # 0
next(large_dataset)  # 2
```

:::note HANDS-ON: Data Transformation Practice

:::

```python
# Server monitoring data transform karo
servers = [
    {"name": "web-01", "cpu": 45, "memory": 62, "status": "healthy"},
    {"name": "web-02", "cpu": 89, "memory": 78, "status": "healthy"},
    {"name": "db-01", "cpu": 12, "memory": 95, "status": "warning"},
    {"name": "cache-01", "cpu": 5, "memory": 30, "status": "healthy"},
]

# High CPU servers nikalo (>70%)
high_cpu = [s["name"] for s in servers if s["cpu"] > 70]
# Result: ["web-02"]

# Memory warning servers
memory_warning = [s["name"] for s in servers if s["memory"] > 90]
# Result: ["db-01"]

# Name-to-status mapping
status_map = {s["name"]: s["status"] for s in servers}
# Result: {"web-01": "healthy", "web-02": "healthy", "db-01": "warning", "cache-01": "healthy"}

# Average CPU
avg_cpu = sum(s["cpu"] for s in servers) / len(servers)
# Result: 37.75
```

:::caution CHECKPOINT:
1. List comprehension aur generator expression mein kya fark hai? Kab generator use karoge instead of list?
2. Tumhare NexaBook ke liye — agar 10,000 servers ka data hai, to high-CPU servers nikalne ke liye list comprehension ya generator kaunsa better hai? Kyun?

:::

---

## Section 3: Functions — Building Blocks of Automation

:::tip CONCEPT: Functions = Reusable Code Blocks

:::

```python
# Basic function
def check_port(host: str, port: int) -> bool:
    """Check if a port is open"""
    import socket
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(2)
    result = sock.connect_ex((host, port))
    sock.close()
    return result == 0

# Default arguments
def deploy(service: str, version: str = "latest", replicas: int = 1) -> dict:
    return {"service": service, "version": version, "replicas": replicas}

deploy("nexabook")                    # Uses defaults
deploy("nexabook", "v2.1.0", 3)       # All custom

# *args and **kwargs — flexible arguments
def log_message(level: str, *args, **kwargs):
    """Log with flexible formatting"""
    message = " ".join(str(a) for a in args)
    timestamp = kwargs.get("timestamp", "now")
    print(f"[{level}] {timestamp}: {message}")

log_message("ERROR", "Connection", "failed", timestamp="2024-01-15")
# Output: [ERROR] 2024-01-15: Connection failed

# Lambda — anonymous functions (one-liners)
servers = ["web-01", "db-01", "cache-01", "web-02"]
sorted_servers = sorted(servers, key=lambda x: x.split("-")[1])
# Result: ["db-01", "cache-01", "web-01", "web-02"]

# Higher-order functions
def apply_to_servers(servers: list, func) -> list:
    return [func(s) for s in servers]

results = apply_to_servers(servers, lambda s: f"http://{s}:8080/health")
# Result: ["http://web-01:8080/health", "http://db-01:8080/health", ...]
```

:::tip CONCEPT: Closures & Decorators — Advanced Patterns

:::

```python
# Closure — function yaad rakhta hai apna environment
def create_logger(prefix: str):
    def log(message: str):
        print(f"[{prefix}] {message}")
    return log

error_log = create_logger("ERROR")
info_log = create_logger("INFO")
error_log("Server down")    # [ERROR] Server down
info_log("Deployment done") # [INFO] Deployment done

# Decorator — function ko wrap karna (timing, logging, retry)
import time
from functools import wraps

def timer(func):
    """Measure function execution time"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        elapsed = time.time() - start
        print(f"{func.__name__} took {elapsed:.2f}s")
        return result
    return wrapper

@timer
def slow_function():
    import time
    time.sleep(2)
    return "done"

slow_function()  # Output: slow_function took 2.00s

# Practical decorator — retry logic
def retry(max_attempts: int = 3, delay: int = 1):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if attempt == max_attempts - 1:
                        raise
                    print(f"Attempt {attempt + 1} failed: {e}")
                    time.sleep(delay)
        return wrapper
    return decorator

@retry(max_attempts=3, delay=2)
def call_external_api():
    import requests
    return requests.get("https://api.example.com", timeout=5)
```

:::caution CHECKPOINT:
1. `*args` aur `**kwargs` ka use case kya hai? Kab dono ek sath use karoge?
2. Decorator jo function ka execution time measure kare — usse kaise banaoge? (Hint: `time.time()` aur `@wraps`)

:::

---

## Section 4: Error Handling & Custom Exceptions — Production Code Ki Jaan

:::tip CONCEPT: try/except = Tumhara Safety Net

Production mein errors aayenge — tumhara kaam hai unko gracefully handle karna.

:::

```python
# Basic error handling
try:
    result = 10 / 0
except ZeroDivisionError as e:
    print(f"Error: {e}")
    result = 0

# Multiple exceptions — specific handling
try:
    import requests
    response = requests.get("https://api.nexabook.com/health", timeout=5)
    response.raise_for_status()
except requests.exceptions.Timeout:
    print("Server timeout — retry later")
except requests.exceptions.ConnectionError:
    print("Connection failed — check network")
except requests.exceptions.HTTPError as e:
    print(f"HTTP error: {e.response.status_code}")
except Exception as e:
    print(f"Unexpected error: {e}")

# Finally — always runs (cleanup ke liye)
file = None
try:
    file = open("config.txt")
    data = file.read()
except FileNotFoundError:
    print("Config file not found")
    data = None
finally:
    if file:
        file.close()  # Always close

# Context manager (better way — auto close)
try:
    with open("config.txt") as f:
        data = f.read()
except FileNotFoundError:
    print("Config file not found")
```

:::tip CONCEPT: Custom Exceptions — Meaningful Errors

:::

```python
# Exception hierarchy banao — har error type ka apna exception
class DevOpsError(Exception):
    """Base exception for all DevOps errors"""
    pass

class ServiceDownError(DevOpsError):
    def __init__(self, service: str, host: str, port: int):
        self.service = service
        self.host = host
        self.port = port
        super().__init__(f"Service '{service}' is down at {host}:{port}")

class ConfigError(DevOpsError):
    def __init__(self, config_file: str, message: str):
        self.config_file = config_file
        super().__init__(f"Config error in {config_file}: {message}")

class DeploymentError(DevOpsError):
    def __init__(self, service: str, version: str, reason: str):
        self.service = service
        self.version = version
        super().__init__(f"Deployment failed for {service}:{version} — {reason}")

# Usage
def deploy_service(service: str, version: str) -> bool:
    try:
        # Check config
        import os
        if not os.path.exists(f"/etc/{service}/config.yaml"):
            raise ConfigError(f"/etc/{service}/config.yaml", "File not found")
        
        # Check service health
        import socket
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        result = sock.connect_ex(("localhost", 8080))
        sock.close()
        
        if result != 0:
            raise ServiceDownError(service, "localhost", 8080)
        
        # Deploy logic here
        print(f"Deploying {service}:{version}")
        return True
        
    except DevOpsError as e:
        # Catch-all for our custom exceptions
        print(f"Deployment failed: {e}")
        return False

# Caller ko specific exception milta hai
try:
    deploy_service("nexabook", "v2.1.0")
except ConfigError as e:
    print(f"Fix config: {e}")
except ServiceDownError as e:
    print(f"Start service: {e}")
except DeploymentError as e:
    print(f"Check deployment: {e}")
```

:::note HANDS-ON: Robust Error Handling

:::

```python
# File: safe_api_caller.py
import requests
from typing import Optional, Dict, Any
from functools import wraps
import time

class APIError(Exception):
    def __init__(self, status_code: int, message: str):
        self.status_code = status_code
        self.message = message
        super().__init__(f"API Error {status_code}: {message}")

def retry_on_failure(max_retries: int = 3, delay: float = 1.0):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            last_exception = None
            for attempt in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except requests.exceptions.RequestException as e:
                    last_exception = e
                    if attempt < max_retries - 1:
                        print(f"Attempt {attempt + 1} failed, retrying in {delay}s...")
                        time.sleep(delay)
            raise APIError(0, f"All {max_retries} attempts failed: {last_exception}")
        return wrapper
    return decorator

@retry_on_failure(max_retries=3, delay=2.0)
def fetch_server_status(url: str, timeout: int = 5) -> Dict[str, Any]:
    response = requests.get(url, timeout=timeout)
    if response.status_code >= 400:
        raise APIError(response.status_code, response.text)
    return response.json()

# Usage
try:
    status = fetch_server_status("http://localhost:8080/health")
    print(f"Server status: {status}")
except APIError as e:
    print(f"API call failed: {e}")
except Exception as e:
    print(f"Unexpected error: {e}")
```

:::caution CHECKPOINT:
1. `except Exception as e:` aur bare `except:` mein kya fark hai? Kaunsa use karna chahiye aur kyun?
2. Agar tumhare deployment script mein 3 steps hain (backup, pull, deploy) aur step 2 fail ho jaye, to kaise handle karoge? (Hint: partial rollback)

:::

---

## Section 5: File I/O & Modules — Automate Boring Stuff

:::tip CONCEPT: File Handling = Reading/Writing Data

:::

```python
# Reading files — multiple methods
# Method 1: context manager (BEST — auto close)
with open("servers.txt", "r") as f:
    content = f.read()          # Poori file as string
    lines = f.readlines()       # List of lines
    f.seek(0)                   # File pointer wapas shuru pe
    first_line = f.readline()   # Sirf pehli line

# Reading line by line (memory efficient for large files)
with open("large_log.txt", "r") as f:
    for line in f:
        if "ERROR" in line:
            print(line.strip())

# Writing files
with open("output.txt", "w") as f:       # Overwrite
    f.write("Line 1\n")
    f.write("Line 2\n")

with open("output.txt", "a") as f:       # Append
    f.write("New line\n")

# Working with CSV
import csv
from typing import List, Dict

# Read CSV
with open("servers.csv", "r") as f:
    reader = csv.DictReader(f)  # header row se keys banti hain
    for row in reader:
        print(f"Server: {row['host']}, Port: {row['port']}")

# Write CSV
with open("output.csv", "w", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=["host", "port", "status"])
    writer.writeheader()
    writer.writerow({"host": "web-01", "port": 8080, "status": "healthy"})

# Working with JSON
import json

config = {"host": "localhost", "port": 8080, "debug": True}

# Write JSON
with open("config.json", "w") as f:
    json.dump(config, f, indent=2)  # indent for readability

# Read JSON
with open("config.json", "r") as f:
    loaded = json.load(f)
    print(loaded["host"])

# JSON to string (API ke liye)
json_string = json.dumps(config, indent=2)
```

:::tip CONCEPT: Modules & Packages — Code Organize Karna

:::

```python
# Module = single .py file
# Package = folder with __init__.py

# src/models/user.py
class User:
    def __init__(self, name: str, email: str):
        self.name = name
        self.email = email
    
    def to_dict(self) -> dict:
        return {"name": self.name, "email": self.email}

# src/models/__init__.py — imports ko simplify karta hai
from .user import User

# src/main.py — ab direct import kar sakte ho
from src.models import User  # Instead of: from src.models.user import User

# Built-in modules jo DevOps mein zaroori hain
import os
import sys
import json
import subprocess
import socket
import datetime
import pathlib
import shutil
import tempfile
import hashlib

# os module — file system operations
os.listdir("/var/log")           # Directory listing
os.path.exists("/etc/nginx")    # Check if path exists
os.makedirs("output/logs", exist_ok=True)  # Create dirs recursively
os.environ.get("API_KEY")       # Environment variable

# pathlib — modern file operations (recommended)
from pathlib import Path

log_dir = Path("/var/log/nginx")
if log_dir.exists():
    for log_file in log_dir.glob("*.log"):
        print(f"Found: {log_file.name} ({log_file.stat().st_size} bytes)")

# Create Path object
config_path = Path("config") / "settings.yaml"
config_path.parent.mkdir(parents=True, exist_ok=True)
config_path.write_text("key: value\n")
```

:::note HANDS-ON: Log Parser Script

:::

```python
# File: parse_logs.py
import re
import csv
import json
from typing import List, Dict
from collections import Counter
from pathlib import Path

def parse_nginx_log(log_file: str) -> List[Dict[str, str]]:
    """Parse nginx access log and return structured data"""
    pattern = r'(?P<ip>[\d\.]+) - - \[(?P<time>[^\]]+)\] "(?P<method>\w+) (?P<path>[^\s]+) [^"]*" (?P<status>\d+) (?P<size>\d+)'
    
    entries = []
    with open(log_file, 'r') as f:
        for line in f:
            match = re.match(pattern, line)
            if match:
                entries.append(match.groupdict())
    return entries

def analyze_logs(entries: List[Dict[str, str]]) -> Dict[str, int]:
    """Analyze log entries"""
    status_counts = Counter(e['status'] for e in entries)
    ip_counts = Counter(e['ip'] for e in entries)
    
    return {
        "total_requests": len(entries),
        "status_codes": dict(status_counts),
        "top_ips": dict(ip_counts.most_common(5)),
        "error_rate": round(status_counts.get('500', 0) / len(entries) * 100, 2)
    }

def export_to_csv(entries: List[Dict[str, str]], output_file: str):
    """Export entries to CSV"""
    if not entries:
        return
    with open(output_file, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=entries[0].keys())
        writer.writeheader()
        writer.writerows(entries)

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python parse_logs.py <log_file>")
        sys.exit(1)
    
    entries = parse_nginx_log(sys.argv[1])
    analysis = analyze_logs(entries)
    
    print(f"Total Requests: {analysis['total_requests']}")
    print(f"Error Rate: {analysis['error_rate']}%")
    print(f"Status Codes: {analysis['status_codes']}")
    print(f"Top IPs: {analysis['top_ips']}")
    
    # Export to CSV
    export_to_csv(entries, "parsed_logs.csv")
    print("Exported to parsed_logs.csv")
```

:::caution CHECKPOINT:
1. `os` module aur `pathlib` module mein kya fark hai? Kab `pathlib` prefer karoge?
2. Agar tumhare NexaBook ka access log 2GB ka hai, to kaise parse karoge without crashing memory? (Hint: line by line processing)

:::

---

## Section 6: Type Hints & Pydantic — AI-Era Code Quality

:::tip CONCEPT: Type Hints = Code Ka Blueprint

Type hints se tumhare code ka intent clear hota hai. AI agents ko bhi pata chalta hai kya expected hai. Ye AgentFactory AI-251 ka core concept hai.

:::

```python
# Without type hints — confusing
def add(a, b):
    return a + b

# With type hints — clear
def add(a: int, b: int) -> int:
    return a + b

# Complex types
from typing import Optional, List, Dict, Tuple, Union

def get_user(user_id: int) -> Optional[Dict[str, str]]:
    """Returns user dict or None if not found"""
    users = {1: {"name": "Ali"}, 2: {"name": "Sara"}}
    return users.get(user_id)

def process_logs(logs: List[str]) -> List[str]:
    """Filter error logs"""
    return [log for log in logs if "ERROR" in log]

def get_server_coords() -> Tuple[float, float]:
    """Return (latitude, longitude)"""
    return (33.6941, 73.0479)

# Union types — multiple possible types
def parse_value(value: Union[str, int, float]) -> str:
    return str(value)

# Python 3.10+ syntax (newer, cleaner)
def parse_value(value: str | int | float) -> str:
    return str(value)

# Type aliases — simplify complex types
ServerList = List[Dict[str, Union[str, int]]]
HealthStatus = Dict[str, Union[str, float, bool]]

def check_servers(servers: ServerList) -> List[HealthStatus]:
    results = []
    for server in servers:
        results.append({
            "server": f"{server['host']}:{server['port']}",
            "status": "healthy",
            "latency_ms": 12.5
        })
    return results
```

:::tip CONCEPT: Pydantic — Data Validation at Runtime

:::

```python
# Pydantic models — type-safe data containers
from pydantic import BaseModel, Field, validator
from typing import Optional
from enum import Enum

class Environment(str, Enum):
    DEV = "dev"
    STAGING = "staging"
    PRODUCTION = "production"

class ServerConfig(BaseModel):
    host: str
    port: int = Field(ge=1, le=65535)  # Port 1-65535
    environment: Environment = Environment.DEV
    debug: bool = False
    max_retries: int = Field(default=3, ge=0)
    
    @validator('host')
    def host_must_be_valid(cls, v):
        if not v or len(v) < 1:
            raise ValueError('Host cannot be empty')
        return v

# Usage — validation happens automatically
config = ServerConfig(host="localhost", port=8080)
# config = ServerConfig(host="localhost", port="not-a-number")  # ValidationError!
# config = ServerConfig(host="localhost", port=99999)           # ValidationError! (port > 65535)

# Nested models — complex configurations
class DatabaseConfig(BaseModel):
    host: str
    port: int = 5432
    name: str
    username: str
    password: str

class AppConfig(BaseModel):
    app_name: str
    server: ServerConfig
    database: DatabaseConfig
    allowed_hosts: list[str] = []

# Load from dict (e.g., from JSON/YAML)
config_dict = {
    "app_name": "NexaBook",
    "server": {"host": "0.0.0.0", "port": 8080},
    "database": {
        "host": "db.nexabook.com",
        "name": "nexabook_prod",
        "username": "admin",
        "password": "secret"
    }
}
config = AppConfig(**config_dict)
print(config.server.port)  # 8080

# Serialize back to dict
config_dict = config.dict()
# or JSON
config_json = config.json(indent=2)
```

:::note HANDS-ON: Type-Driven Development Practice

:::

```python
# File: server_monitor.py
from typing import List, Optional, Dict
from pydantic import BaseModel
from dataclasses import dataclass
import socket

# Pydantic model — configuration
class MonitorConfig(BaseModel):
    host: str
    port: int
    timeout: int = 30
    retries: int = 3

# Dataclass — simple data container (no validation needed)
@dataclass
class HealthCheck:
    service: str
    status: str
    latency_ms: float

# Type-hinted functions
def check_service(config: MonitorConfig) -> HealthCheck:
    """Check if a service is healthy"""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(config.timeout)
        result = sock.connect_ex((config.host, config.port))
        sock.close()
        
        if result == 0:
            return HealthCheck(
                service=f"{config.host}:{config.port}",
                status="healthy",
                latency_ms=0.0
            )
        else:
            return HealthCheck(
                service=f"{config.host}:{config.port}",
                status="unhealthy",
                latency_ms=-1.0
            )
    except Exception as e:
        return HealthCheck(
            service=f"{config.host}:{config.port}",
            status="error",
            latency_ms=-1.0
        )

def filter_unhealthy(checks: List[HealthCheck]) -> List[HealthCheck]:
    """Return only unhealthy services"""
    return [c for c in checks if c.status != "healthy"]

# Usage
config = MonitorConfig(host="localhost", port=8080)
result = check_service(config)
print(f"{result.service}: {result.status}")
```

:::caution CHECKPOINT:
1. `Optional[str]` ka matlab kya hai? `str | None` se kya fark hai?
2. Pydantic model aur dataclass mein kya fark hai? Kab kaunsa use karoge? (Hint: validation chahiye ya nahi)

:::

---

## Section 7: HTTP, APIs & Async — DevOps Daily Work

:::tip CONCEPT: APIs = Services Talking to Each Other

:::

```python
import requests
from typing import Optional, Dict, Any
import time

# Basic GET
response = requests.get("https://api.github.com")
print(response.status_code)  # 200
print(response.json())       # Parse JSON

# POST with JSON body
data = {"name": "Ali", "email": "ali@example.com"}
response = requests.post("https://api.example.com/users", json=data)

# Headers
headers = {
    "Authorization": "Bearer YOUR_TOKEN",
    "Content-Type": "application/json"
}
response = requests.get("https://api.example.com/data", headers=headers)

# Timeout (CRITICAL for production — bina timeout ke script hang ho sakti hai)
try:
    response = requests.get("https://api.example.com", timeout=5)
except requests.exceptions.Timeout:
    print("Request timed out")

# Session reuse — connection pooling (fast for multiple calls)
session = requests.Session()
session.headers.update({"Authorization": "Bearer token"})
for server in servers:
    resp = session.get(f"http://{server}/health", timeout=5)
    print(f"{server}: {resp.status_code}")
```

:::tip CONCEPT: Async Programming — Multiple Tasks Simultaneously

:::

```python
# Synchronous — ek ek karke (slow for I/O-bound tasks)
import requests
import time

def check_server_sync(server: str) -> dict:
    start = time.time()
    try:
        resp = requests.get(f"http://{server}/health", timeout=5)
        return {"server": server, "status": "ok", "time": time.time() - start}
    except:
        return {"server": server, "status": "error", "time": time.time() - start}

servers = ["web-01", "web-02", "web-03", "web-04"]

# Sync — serial execution (slow)
start = time.time()
results = [check_server_sync(s) for s in servers]
print(f"Sync total: {time.time() - start:.2f}s")  # ~20s (4 servers * 5s timeout)

# Async — concurrent execution (fast)
import asyncio
import aiohttp

async def check_server_async(session, server: str) -> dict:
    start = time.time()
    try:
        async with session.get(f"http://{server}/health", timeout=aiohttp.ClientTimeout(total=5)) as resp:
            return {"server": server, "status": "ok", "time": time.time() - start}
    except:
        return {"server": server, "status": "error", "time": time.time() - start}

async def check_all_servers(servers: list) -> list:
    async with aiohttp.ClientSession() as session:
        tasks = [check_server_async(session, s) for s in servers]
        return await asyncio.gather(*tasks)

# Async — parallel execution (fast)
start = time.time()
results = asyncio.run(check_all_servers(servers))
print(f"Async total: {time.time() - start:.2f}s")  # ~5s (all in parallel)

# Practical example: concurrent health checks
async def monitor_servers(servers: list) -> dict:
    async with aiohttp.ClientSession() as session:
        tasks = []
        for server in servers:
            tasks.append(check_server_async(session, server))
        results = await asyncio.gather(*tasks, return_exceptions=True)
    
    healthy = sum(1 for r in results if r.get("status") == "ok")
    return {
        "total": len(servers),
        "healthy": healthy,
        "unhealthy": len(servers) - healthy
    }
```

:::tip CONCEPT: Subprocess — System Calls from Python

:::

```python
import subprocess
from typing import Tuple

# Run command and capture output
result = subprocess.run(
    ["docker", "ps", "--format", "{{.Names}}\t{{.Status}}"],
    capture_output=True,
    text=True,
    timeout=10
)

if result.returncode == 0:
    containers = result.stdout.strip().split("\n")
    for container in containers:
        print(container)
else:
    print(f"Error: {result.stderr}")

# Run with shell=True (use carefully — security risk)
result = subprocess.run(
    "df -h | grep '/$'",
    shell=True,
    capture_output=True,
    text=True
)
print(result.stdout)

# Helper function — command runner
def run_command(cmd: list, timeout: int = 30) -> Tuple[bool, str]:
    """Run command and return (success, output)"""
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=timeout
        )
        return result.returncode == 0, result.stdout or result.stderr
    except subprocess.TimeoutExpired:
        return False, f"Command timed out after {timeout}s"
    except FileNotFoundError:
        return False, f"Command not found: {cmd[0]}"

# Usage
success, output = run_command(["systemctl", "status", "nginx"])
if success:
    print("Nginx is running")
else:
    print(f"Nginx issue: {output}")
```

:::note HANDS-ON: Health Check Script

:::

```python
# File: health_check.py
import requests
from typing import List, Dict
from concurrent.futures import ThreadPoolExecutor, as_completed
import time

def check_health(server: Dict[str, str]) -> Dict[str, str]:
    """Check health of a single server"""
    url = f"http://{server['host']}:{server['port']}/health"
    start = time.time()
    try:
        response = requests.get(url, timeout=5)
        latency = (time.time() - start) * 1000
        return {
            "server": f"{server['host']}:{server['port']}",
            "status": "healthy" if response.status_code == 200 else "unhealthy",
            "latency_ms": round(latency, 2),
            "status_code": response.status_code
        }
    except requests.exceptions.Timeout:
        return {"server": f"{server['host']}:{server['port']}", "status": "timeout", "latency_ms": -1}
    except requests.exceptions.ConnectionError:
        return {"server": f"{server['host']}:{server['port']}", "status": "connection_error", "latency_ms": -1}

def check_all_servers(servers: List[Dict[str, str]]) -> List[Dict[str, str]]:
    """Check all servers concurrently"""
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = {executor.submit(check_health, server): server for server in servers}
        results = []
        for future in as_completed(futures):
            results.append(future.result())
    return results

if __name__ == "__main__":
    servers = [
        {"host": "localhost", "port": "8080"},
        {"host": "localhost", "port": "3000"},
        {"host": "localhost", "port": "5432"},
    ]
    results = check_all_servers(servers)
    for r in results:
        print(f"{r['server']}: {r['status']} ({r['latency_ms']}ms)")
```

:::caution CHECKPOINT:
1. `aiohttp` aur `requests` mein kya fark hai? Kab async use karoge?
2. Tumhare 100 servers hain — synchronous approach kitna time lega agar ek server 2s leta hai? Async approach kitna time lega? Calculation do.

:::

---

## Section 8: Bash Scripting — Production Grade

:::tip CONCEPT: Bash = Server Ka Native Language

:::

```bash
#!/bin/bash
set -euo pipefail  # e=exit on error, u=undefined vars error, o=pipefail

# === VARIABLES ===
LOG_DIR="/var/log/myapp"
DATE=$(date +%Y-%m-%d)
BACKUP_DIR="/backups/${DATE}"
APP_NAME="nexabook"

# === FUNCTIONS ===
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

error_exit() {
    log "ERROR: $1"
    exit 1
}

# === CONDITIONALS ===
# Check if running as root
if [[ $EUID -ne 0 ]]; then
    error_exit "This script must be run as root"
fi

# Check if directory exists
if [[ ! -d "$LOG_DIR" ]]; then
    error_exit "Log directory not found: $LOG_DIR"
fi

# Check if command exists
if ! command -v docker &> /dev/null; then
    error_exit "Docker not installed"
fi

# === LOOPS ===
# Process all log files
for logfile in "$LOG_DIR"/*.log; do
    if [[ -f "$logfile" ]]; then
        lines=$(wc -l < "$logfile")
        log "Processing $logfile ($lines lines)"
    fi
done

# Loop over array of servers
servers=("web-01" "web-02" "db-01")
for server in "${servers[@]}"; do
    if ping -c 1 -W 2 "$server" &> /dev/null; then
        log "$server is reachable"
    else
        log "WARNING: $server is unreachable"
    fi
done

# === STRING OPERATIONS ===
filename="access.log.2024-01-15"
echo "${filename%.log.2024-01-15}"  # Output: access (remove suffix)
echo "${filename%%.*}"              # Output: access (remove from first dot)
echo "${filename#*.}"               # Output: log.2024-01-15 (remove up to first dot)
```

:::tip CONCEPT: Error Handling in Bash

:::

```bash
#!/bin/bash
set -euo pipefail

# Trap — catch errors and cleanup
cleanup() {
    log "Cleaning up..."
    rm -f /tmp/deploy_lock
}
trap cleanup EXIT

# Check command success
deploy() {
    local service=$1
    local version=$2
    
    log "Deploying $service:$version"
    
    if ! docker pull "$service:$version"; then
        log "ERROR: Failed to pull $service:$version"
        return 1
    fi
    
    if ! docker run -d --name "$service" "$service:$version"; then
        log "ERROR: Failed to start $service"
        return 1
    fi
    
    log "Deployment successful: $service:$version"
    return 0
}

# Retry logic
retry() {
    local max_attempts=$1
    local delay=$2
    shift 2
    local command=("$@")
    
    for ((attempt=1; attempt<=max_attempts; attempt++)); do
        if "${command[@]}"; then
            return 0
        fi
        log "Attempt $attempt failed. Retrying in ${delay}s..."
        sleep "$delay"
    done
    
    log "ERROR: All $max_attempts attempts failed"
    return 1
}

# Usage
retry 3 5 curl -f http://localhost:8080/health
```

:::note HANDS-ON: Deployment Script

:::

```bash
#!/bin/bash
set -euo pipefail

APP_NAME="nexabook"
DEPLOY_DIR="/opt/$APP_NAME"
BACKUP_DIR="/opt/backups/$APP_NAME"
LOG_FILE="/var/log/deploy.log"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"; }

# Pre-deployment checks
log "=== Pre-deployment checks ==="
command -v docker >/dev/null 2>&1 || { log "ERROR: Docker not installed"; exit 1; }
systemctl is-active --quiet docker || { log "ERROR: Docker not running"; exit 1; }

# Backup current version
log "Backing up current version..."
if [[ -d "$DEPLOY_DIR" ]]; then
    cp -r "$DEPLOY_DIR" "${BACKUP_DIR}_$(date +%Y%m%d_%H%M%S)"
fi

# Pull and deploy
log "Pulling latest image..."
docker pull "$APP_NAME:latest" || { log "ERROR: Failed to pull image"; exit 1; }

log "Stopping old container..."
docker stop "$APP_NAME" 2>/dev/null || true
docker rm "$APP_NAME" 2>/dev/null || true

log "Starting new container..."
docker run -d \
    --name "$APP_NAME" \
    --restart unless-stopped \
    -p 8080:8080 \
    "$APP_NAME:latest"

# Health check
log "Waiting for health check..."
sleep 10
if curl -f http://localhost:8080/health > /dev/null 2>&1; then
    log "=== Deployment successful ==="
else
    log "ERROR: Health check failed — rolling back..."
    # Rollback logic here
    exit 1
fi
```

:::caution CHECKPOINT:
1. `set -e`, `set -u`, aur `set -o pipefail` ka alag-alag kya karte hain? Agar sirf `set -e` ho aur `set -u` na ho, to kya problem ho sakti hai?
2. Bash script mein function banana aur directly code likhne mein kya fark hai? Kab function zaroori hai?

:::

---

## Section 9: Testing — AI Ka Output Verify Karo

:::tip CONCEPT: pytest = Tumhari Confidence

Jab tum AI se code generate karwate ho, pytest se verify karo ke sahi kaam kar raha hai.

:::

```python
# File: test_server_monitor.py
import pytest
from server_monitor import check_service, filter_unhealthy, MonitorConfig, HealthCheck

def test_check_service_healthy():
    """Test healthy service detection"""
    config = MonitorConfig(host="localhost", port=22)  # SSH usually running
    result = check_service(config)
    assert result.status == "healthy"

def test_check_service_unhealthy():
    """Test unhealthy service detection"""
    config = MonitorConfig(host="localhost", port=99999)  # Invalid port
    result = check_service(config)
    assert result.status == "unhealthy"

def test_filter_unhealthy():
    """Test filtering of unhealthy services"""
    checks = [
        HealthCheck("s1", "healthy", 10.0),
        HealthCheck("s2", "unhealthy", -1.0),
        HealthCheck("s3", "healthy", 15.0),
    ]
    unhealthy = filter_unhealthy(checks)
    assert len(unhealthy) == 1
    assert unhealthy[0].service == "s2"

# Fixtures — reusable test data
@pytest.fixture
def sample_servers():
    return [
        {"host": "localhost", "port": 8080},
        {"host": "localhost", "port": 3000},
    ]

def test_with_fixture(sample_servers):
    assert len(sample_servers) == 2

# Parametrize — test multiple inputs
@pytest.mark.parametrize("port,expected", [
    (22, "healthy"),        # SSH
    (99999, "unhealthy"),   # Invalid
    (80, "unhealthy"),      # HTTP not running
])
def test_port_checks(port, expected):
    result = check_service(MonitorConfig(host="localhost", port=port))
    assert result.status == expected

# Run with: pytest test_server_monitor.py -v
```

```bash
# Run tests
pytest test_server_monitor.py -v

# Run with coverage
pytest --cov=. test_server_monitor.py

# Run only failed tests
pytest --lf

# Run tests matching pattern
pytest -k "test_check"

# Stop on first failure
pytest -x
```

:::caution CHECKPOINT:
1. `assert` statement kya karta hai? Agar assert fail ho to kya hota hai?
2. `@pytest.fixture` aur `@pytest.mark.parametrize` ka use case kya hai? Kab dono ek sath use karoge?

:::

---

## Summary: Phase 3 Key Takeaways

| Concept | Tumne Kya Seekha |
|---------|-----------------|
| Virtual Environments | Isolated Python environments, project structure |
| Data Structures | List, dict, set, tuple, comprehensions |
| Functions | Default args, *args/**kwargs, closures, decorators |
| Error Handling | try/except/finally, custom exception hierarchy |
| File I/O | CSV, JSON, pathlib, context managers |
| Type Hints | Optional, List, Dict, Union, type aliases |
| Pydantic | Data validation, BaseModel, nested models |
| APIs | requests, sessions, timeout, retry |
| Async | asyncio, aiohttp, concurrent health checks |
| Subprocess | System calls, run_command helper |
| Bash | set -euo pipefail, loops, functions, deployment scripts |
| Testing | pytest, fixtures, parametrize, coverage |

---

## MINI-TASKS

### Task 1: Type-Hinted Script (15 min)
Ek script banao jo:
- Server list (host, port) ko input le
- Har server ka health check kare
- Type hints use kare
- Pydantic model use kare config ke liye
- Error handling ho (custom exceptions)

### Task 2: Async Health Checker (20 min)
Ek script banao jo:
- 10 servers ko concurrently check kare
- Async/await use kare (aiohttp)
- Results ko JSON file mein export kare
- Summary statistics print kare (healthy/unhealthy count)

### Task 3: Deployment Script (15 min)
Ek Bash script banao jo:
- `set -euo pipefail` use kare
- Backup le current version ka
- Docker image pull kare
- Container restart kare
- Health check kare
- Rollback ho agar health check fail ho
- Log kare sab kuch

### Task 4: Log Parser with Module Structure (20 min)
Ek project banao jo:
- Proper project structure ho (src/, tests/)
- Log parsing module ho
- CSV export ho
- Pydantic model ho parsed data ke liye
- Tests ho pytest se

---

## INCIDENT.md: Practice Scenarios

### Incident #1: Script Crashed — Undefined Variable
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

### Incident #2: Python API Timeout — Script Hang
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

### Incident #3: YAML Indentation Error — K8s Pod Won't Start
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

### Incident #4: Python Import Error — Module Not Found
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

### Incident #5: Bash Script Permission Denied
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

---

*Next: Phase 4 — Cloud Platforms (AWS/Azure) jab bolo "next"*
