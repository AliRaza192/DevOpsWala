---
sidebar_position: 14
title: "PHASE 13: AGENTIC AI — Agent Building"
description: "**Tumhara level:** Tumne AI foundations seekhe (Phase 12). Ab agents banao — jo khud soch sakein, tools use karein, aur "
---

# PHASE 13: AGENTIC AI — Agent Building — TEACHING

> **Tumhara level:** Tumne AI foundations seekhe (Phase 12). Ab agents banao — jo khud soch sakein, tools use karein, aur kaam karein. Ye tumhe Level 3 (AI-Native) tak le jaayega. AgentFactory AI-301 mein tum LangGraph, MCP, Google ADK seekhoge.

---

## Section 1: Agent Kya Hai? — The Mental Model

:::tip CONCEPT: Agent = LLM + Tools + Memory + Planning

**Simple Chatbot:** Tum poochte ho, AI jawab deta hai
**Agent:** AI khud sochta hai, tools use karta hai, aur kaam karta hai

:::

```
User: "Mujhe Nexabook ka deployment status batao"

Chatbot: "I can't check deployment status directly."
Agent:
  1. Thought: Mujhe kubectl use karna chahiye
  2. Action: kubectl get pods -n nexabook
  3. Observation: 3 pods running, 1 pending
  4. Thought: Ab service status check karna chahiye
  5. Action: kubectl get svc -n nexabook
  6. Response: "3 pods running, 1 pending. Service is healthy."
```

**Agent Components:**
1. **LLM** — Brain (decision making)
2. **Tools** — Actions (API calls, shell commands, database queries)
3. **Memory** — Context (previous interactions, learned information)
4. **Planning** — Strategy (how to break down complex tasks)

**Agent Loop:**
```
Perceive → Think → Act → Observe → Think → Act → ... → Respond
```

:::caution CHECKPOINT:
1. Agent aur chatbot mein kya fark hai?
2. Agent tools kab use karta hai? Kab sirf LLM kaafi hai?
3. Agent loop kaise kaam karta hai?

:::

---

## Section 2: Agent Frameworks — The Landscape

:::tip CONCEPT: Framework = Agent Ka Operating System

| Framework | Best For | Your Use Case |
|-----------|----------|---------------|
| **OpenAI Agents SDK** | Simple, elegant | Quick start |
| **LangGraph** | Complex stateful workflows | Production banking agents |
| **CrewAI** | Multi-agent teams | Quick prototypes |
| **Google ADK** | Google-native, Gemini | Google Cloud integration |
| **Claude Agent SDK** | Anthropic-native | Claude-based agents |
| **PydanticAI** | Type-safe Python | Clean code agents |
| **AutoGen (Microsoft)** | Multi-agent remote | Enterprise collaboration |

**Recommendation:** Start with **OpenAI Agents SDK** (simple) → **LangGraph** (production)

:::

---

## Section 3: OpenAI Agents SDK — Your First Agent

:::tip CONCEPT: OpenAI Agents SDK = Simple But Powerful

:::

```python
# File: simple_agent.py
from openai import OpenAI
from openai.agents import Agent, Runner

# Define agent
agent = Agent(
    name="DevOps Assistant",
    instructions="""You are a DevOps assistant. 
    You can check server status, deploy applications, and troubleshoot issues.
    Always explain what you're doing before taking action.""",
    model="gpt-4",
    tools=[]
)

# Run agent
result = Runner.run_sync(agent, "Check the status of all pods in nexabook namespace")
print(result.final_output)
```

:::note HANDS-ON: Agent With Tools

:::

```python
# File: agent_with_tools.py
from openai import OpenAI
from openai.agents import Agent, Runner, function_tool
import subprocess

client = OpenAI()

@function_tool
def run_command(command: str) -> str:
    """Run a shell command and return output.
    Args:
        command: The shell command to execute
    Returns:
        Command output including stdout, stderr, and exit code
    """
    try:
        result = subprocess.run(
            command, 
            shell=True, 
            capture_output=True, 
            text=True, 
            timeout=30
        )
        return f"Exit code: {result.returncode}\nStdout: {result.stdout}\nStderr: {result.stderr}"
    except subprocess.TimeoutExpired:
        return "Command timed out after 30 seconds"

@function_tool
def check_pod_status(namespace: str) -> str:
    """Check Kubernetes pod status in a namespace.
    Args:
        namespace: Kubernetes namespace to check
    Returns:
        Pod status including names, status, and restart counts
    """
    return run_command(f"kubectl get pods -n {namespace} -o wide")

@function_tool
def restart_deployment(name: str, namespace: str) -> str:
    """Restart a Kubernetes deployment.
    Args:
        name: Deployment name
        namespace: Kubernetes namespace
    Returns:
        Restart status
    """
    return run_command(f"kubectl rollout restart deployment/{name} -n {namespace}")

# Agent create karo
agent = Agent(
    name="K8s Assistant",
    instructions="""You are a Kubernetes assistant. 
    Help users manage their K8s cluster.
    Always confirm before taking destructive actions.
    Always explain what you're doing.""",
    model="gpt-4",
    tools=[run_command, check_pod_status, restart_deployment]
)

# Run
result = Runner.run_sync(agent, "Check pod status in nexabook namespace")
print(result.final_output)
```

### Agent Guardrails

```python
# Safety guardrails
from openai.agents import Agent, Runner, InputGuardrail, GuardrailFunctionOutput

@InputGuardrail
async def check_dangerous_commands(context, agent, input):
    """Block dangerous commands"""
    dangerous = ["rm -rf", "kubectl delete", "docker rm", "DROP TABLE"]
    for cmd in dangerous:
        if cmd in input.lower():
            return GuardrailFunctionOutput(
                output_info="Dangerous command detected",
                tripwire_triggered=True
            )
    return GuardrailFunctionOutput(output_info="Safe", tripwire_triggered=False)

agent = Agent(
    name="Safe K8s Assistant",
    instructions="You are a safe Kubernetes assistant.",
    model="gpt-4",
    tools=[run_command, check_pod_status],
    input_guardrails=[check_dangerous_commands]
)
```

---

## Section 4: MCP — Model Context Protocol

:::tip CONCEPT: MCP = Agent Ka USB Port

MCP ek standard hai jo tumhe allow karta hai ke tools aur data ko agents se connect karo. Jaise USB se devices connect karte ho.

:::

```
Agent ←→ MCP Server ←→ Database
         ←→ API
         ←→ File System
         ←→ External Services
```

:::note HANDS-ON: Build MCP Server

:::

```python
# File: mcp_server.py
from mcp import Server, Tool
from mcp.types import TextContent
import asyncio

server = Server("nexabook-tools")

@server.tool()
async def check_database(database_url: str) -> str:
    """Check database connection status.
    Args:
        database_url: PostgreSQL connection URL
    Returns:
        Database connection status and version
    """
    import asyncpg
    try:
        conn = await asyncpg.connect(database_url)
        version = await conn.fetchval("SELECT version()")
        await conn.close()
        return f"Connected! PostgreSQL version: {version}"
    except Exception as e:
        return f"Connection failed: {str(e)}"

@server.tool()
async def run_migration(database_url: str, migration_file: str) -> str:
    """Run a database migration.
    Args:
        database_url: PostgreSQL connection URL
        migration_file: Path to migration SQL file
    Returns:
        Migration execution status
    """
    return f"Migration {migration_file} applied successfully"

@server.tool()
async def get_table_stats(database_url: str) -> str:
    """Get database table statistics.
    Args:
        database_url: PostgreSQL connection URL
    Returns:
        Table names and their sizes
    """
    import asyncpg
    conn = await asyncpg.connect(database_url)
    tables = await conn.fetch("""
        SELECT tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
        FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
    """)
    await conn.close()
    return "\n".join([f"{t['tablename']}: {t['size']}" for t in tables])

if __name__ == "__main__":
    asyncio.run(server.run())
```

```json
// MCP config (claude_desktop_config.json)
{
  "mcpServers": {
    "nexabook-tools": {
      "command": "python",
      "args": ["mcp_server.py"],
      "env": {
        "DATABASE_URL": "postgresql://localhost/nexabook"
      }
    }
  }
}
```

:::caution CHECKPOINT:
1. MCP kya hai? REST API se kaise different hai?
2. MCP server kaise implement karoge?

:::

---

## Section 5: LangGraph — Complex Workflows

:::tip CONCEPT: LangGraph = Agent Ka Flowchart

LangGraph se tum complex workflows bana sakte ho — jaise state machines.

:::

```python
# File: langgraph_agent.py
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage
from typing import TypedDict, Annotated
import operator

# State define karo
class AgentState(TypedDict):
    messages: Annotated[list, operator.add]
    next_step: str

# Tools
def check_server(server_name: str) -> str:
    """Check server health"""
    return f"{server_name}: healthy (CPU: 45%, Memory: 60%)"

def restart_server(server_name: str) -> str:
    """Restart server"""
    return f"{server_name}: restarted successfully"

def create_ticket(title: str, description: str) -> str:
    """Create support ticket"""
    return f"Ticket created: {title}"

# LLM with tools
tools = [check_server, restart_server, create_ticket]
llm = ChatOpenAI(model="gpt-4").bind_tools(tools)

# Nodes
def agent_node(state: AgentState):
    response = llm.invoke(state["messages"])
    return {"messages": [response]}

def should_continue(state: AgentState):
    last_message = state["messages"][-1]
    if last_message.tool_calls:
        return "tools"
    return END

# Graph
workflow = StateGraph(AgentState)
workflow.add_node("agent", agent_node)
workflow.add_node("tools", ToolNode(tools))
workflow.set_entry_point("agent")
workflow.add_conditional_edges("agent", should_continue, {"tools": "tools", END: END})
workflow.add_edge("tools", "agent")

app = workflow.compile()

# Run
result = app.invoke({"messages": [HumanMessage(content="Check server health and create ticket if unhealthy")]})
```

### LangGraph with Memory

```python
from langgraph.checkpoint.memory import MemorySaver

# Memory add karo
memory = MemorySaver()
app = workflow.compile(checkpointer=memory)

# Thread ID se memory access
config = {"configurable": {"thread_id": "user-123"}}
result = app.invoke({"messages": [HumanMessage(content="Check nexabook pods")]}, config)
result = app.invoke({"messages": [HumanMessage(content="Now check staging pods")]}, config)
# Agent yaad rakhega ke pehle nexabook check kiya tha
```

---

## Section 6: Google ADK — Google-Native Agents

:::tip CONCEPT: Google ADK = Gemini + Google Cloud

:::

```python
# File: google_adk_agent.py
from google.adk import Agent
from google.adk.tools import FunctionTool

# Tool define karo
def check_gcp_project(project_id: str) -> str:
    """Check GCP project status.
    Args:
        project_id: GCP project ID
    Returns:
        Project status and active services
    """
    return f"Project {project_id}: Active. Services: GKE, Cloud Run, Cloud SQL"

def deploy_to_cloud_run(service_name: str, image: str, project_id: str) -> str:
    """Deploy to Cloud Run.
    Args:
        service_name: Name of the service
        image: Docker image URL
        project_id: GCP project ID
    Returns:
        Deployment status and URL
    """
    return f"Deployed {service_name} to Cloud Run. URL: https://{service_name}-xxx.run.app"

# Agent create karo
agent = Agent(
    name="GCP Assistant",
    model="gemini-2.0-flash",
    description="Helps manage GCP resources",
    instruction="""You are a GCP assistant. Help users manage their Google Cloud resources.
    Always confirm before making changes.""",
    tools=[check_gcp_project, deploy_to_cloud_run]
)

# Run with ADK
from google.adk.runners import Runner
runner = Runner(agent=agent)
result = runner.run("Check my GCP project status")
```

:::note HANDS-ON: Google ADK with Tools

:::

```python
# File: gcp_tools.py
from google.adk.tools import FunctionTool
from google.cloud import compute_v1
from google.cloud import container_v1

@FunctionTool
def list_gke_clusters(project_id: str, zone: str) -> str:
    """List GKE clusters in a project.
    Args:
        project_id: GCP project ID
        zone: GCP zone
    Returns:
        List of cluster names and statuses
    """
    client = container_v1.ClusterManagerClient()
    clusters = client.list_clusters(project_id=project_id, zone=zone)
    result = []
    for cluster in clusters.clusters:
        result.append(f"{cluster.name}: {cluster.status}")
    return "\n".join(result)

@FunctionTool
def list_compute_instances(project_id: str, zone: str) -> str:
    """List Compute Engine instances.
    Args:
        project_id: GCP project ID
        zone: GCP zone
    Returns:
        List of instance names and statuses
    """
    client = compute_v1.InstancesClient()
    instances = client.list(project=project_id, zone=zone)
    result = []
    for instance in instances:
        result.append(f"{instance.name}: {instance.status}")
    return "\n".join(result)
```

---

## Section 7: Claude Agent SDK & PydanticAI

:::tip CONCEPT: Claude Agent SDK = Anthropic Native

:::

```python
# File: claude_agent.py
from claude_agent_sdk import Agent, Tool

# Tool define karo
@Tool
def check_server_status(server_name: str) -> str:
    """Check server health status.
    Args:
        server_name: Name of the server
    Returns:
        Health status
    """
    return f"{server_name}: healthy (CPU: 45%, Memory: 60%)"

# Agent
agent = Agent(
    name="DevOps Assistant",
    model="claude-3-5-sonnet-20241022",
    instructions="You are a DevOps assistant.",
    tools=[check_server_status]
)

# Run
response = agent.run("Check server status for web-1")
print(response.content)
```

### PydanticAI — Type-Safe Agents

```python
# File: pydantic_agent.py
from pydantic_ai import Agent
from pydantic import BaseModel

# Define output schema
class ServerStatus(BaseModel):
    name: str
    cpu_percent: float
    memory_percent: float
    status: str

# Agent with structured output
agent = Agent(
    model="gpt-4",
    system_prompt="You are a server monitoring assistant.",
    result_type=ServerStatus
)

# Run
result = agent.run_sync("Check server status for web-1")
print(f"Server: {result.name}")
print(f"CPU: {result.cpu_percent}%")
print(f"Memory: {result.memory_percent}%")
print(f"Status: {result.status}")
```

---

## Section 8: Agent Memory & Planning

:::tip CONCEPT: Memory = Agent Ka Brain

**Types of Memory:**
1. **Short-term** — Current conversation context
2. **Long-term** — Persistent across sessions (vector DB)
3. **Episodic** — Past experiences (what worked, what didn't)
4. **Semantic** — Facts and knowledge

:::

```python
# Memory with LangGraph
from langgraph.checkpoint.memory import MemorySaver

memory = MemorySaver()

# Short-term memory
# Agent yaad rakhta hai current conversation

# Long-term memory (with vector DB)
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings

vectorstore = FAISS.from_texts(
    ["Nexabook uses PostgreSQL", "Deployment is on EKS", "Shari'ah compliance is required"],
    OpenAIEmbeddings()
)

# Retrieval
relevant_docs = vectorstore.similarity_search("What database does Nexabook use?")
```

:::tip CONCEPT: Planning = Agent Ka Strategy

:::

```python
# Planning patterns
planning_prompt = """
Break down this task into steps:

Task: Deploy Nexabook to production

Plan:
1. Check current deployment status
2. Verify all tests pass
3. Build Docker image
4. Push to registry
5. Update Kubernetes manifests
6. Apply to cluster
7. Verify deployment health
8. Update monitoring dashboards

Execute each step and report progress.
"""
```

:::note HANDS-ON: Agent with Memory

:::

```python
# File: agent_memory.py
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage
from typing import TypedDict, Annotated
import operator

class AgentState(TypedDict):
    messages: Annotated[list, operator.add]

def agent_node(state: AgentState):
    llm = ChatOpenAI(model="gpt-4")
    response = llm.invoke(state["messages"])
    return {"messages": [response]}

# Graph with memory
workflow = StateGraph(AgentState)
workflow.add_node("agent", agent_node)
workflow.set_entry_point("agent")
workflow.add_edge("agent", END)

memory = MemorySaver()
app = workflow.compile(checkpointer=memory)

# First conversation
config = {"configurable": {"thread_id": "user-123"}}
result = app.invoke({"messages": [HumanMessage(content="My name is Ali")]}, config)

# Second conversation — agent yaad rakhega
result = app.invoke({"messages": [HumanMessage(content="What's my name?")]}, config)
# Agent: "Your name is Ali."
```

---

## Section 9: Agent Evaluation & Debugging

:::tip CONCEPT: Evaluate = Tum Pata Karo Agent Sahi Kaam Kar Raha Hai

:::

```python
# File: agent_evaluation.py
def evaluate_agent(agent, test_cases):
    """Evaluate agent performance"""
    results = []
    for test in test_cases:
        response = agent.run(test["input"])
        
        # Check accuracy
        accuracy = test["expected"] in response.content
        
        # Check tool usage
        tools_used = len(response.tool_calls) if hasattr(response, 'tool_calls') else 0
        
        results.append({
            "input": test["input"],
            "expected": test["expected"],
            "actual": response.content,
            "accuracy": accuracy,
            "tools_used": tools_used
        })
    
    # Summary
    total = len(results)
    correct = sum(1 for r in results if r["accuracy"])
    print(f"Accuracy: {correct}/{total} ({correct/total*100:.1f}%)")
    return results

# Test cases
test_cases = [
    {"input": "Check pod status", "expected": "pods"},
    {"input": "Restart deployment", "expected": "restart"},
    {"input": "What is 2+2?", "expected": "4"},
]

# Evaluate
evaluate_agent(agent, test_cases)
```

### Debugging Tips

```
1. Logging enable karo
   - Tool calls log karo
   - LLM inputs/outputs log karo
   - Errors log karo

2. Tracing use karo
   - LangSmith (LangGraph)
   - OpenAI dashboard
   - Custom tracing

3. Common issues:
   - Agent loop (no exit condition)
   - Tool not called (bad descriptions)
   - Wrong tool called (ambiguous names)
   - Context lost (memory issues)
   - Hallucination (no tool validation)
```

---

## Summary: Phase 13 Key Takeaways

| Concept | Tumne Kya Seekha |
|---------|-----------------|
| Agent | LLM + Tools + Memory + Planning |
| OpenAI Agents SDK | Simple agent creation with guardrails |
| MCP | Connect tools to agents (USB port) |
| LangGraph | Complex stateful workflows with memory |
| Google ADK | Google-native agents with Gemini |
| Claude Agent SDK | Anthropic-native agents |
| PydanticAI | Type-safe agents with structured output |
| Memory & Planning | Short-term, long-term, episodic memory |
| Evaluation | Testing agent performance |

---

## MINI-TASKS

### Task 1: Simple Agent (20 min)
OpenAI Agents SDK se agent banao with:
- 2-3 tools (shell commands)
- Input guardrails
- Run and test

### Task 2: MCP Server (25 min)
MCP server banao with:
- Database connection check
- Table statistics
- Test with Claude

### Task 3: LangGraph Workflow (25 min)
LangGraph workflow banao with:
- Agent + Tools nodes
- Conditional edges
- Memory (MemorySaver)

### Task 4: Google ADK Agent (20 min)
Google ADK se agent banao with:
- GCP tools (list clusters, instances)
- Test with Gemini

---

## INCIDENT.md: Practice Scenarios

### Incident #1: Agent Doesn't Use Tools
- **Date:** (Practice Scenario)
- **What Broke:** Agent tool calls nahi kar raha. Sirf text de raha hai.
- **Root Cause:** Tools properly describe nahi kiye. Description vague hai.
- **Fix:**
  ```python
  # Step 1: Tool descriptions check karo
  @function_tool
  def check_server(name: str) -> str:
      """Check the health status of a Kubernetes server.
      Args:
          name: The name of the server to check
      Returns:
          Health status including CPU and memory usage
      """

  # Step 2: Tool name meaningful rakho
  # BAD: def func1(name: str) -> str:
  # GOOD: def check_pod_status(namespace: str) -> str:

  # Step 3: System prompt mein tools mention karo
  instructions = """
  You have access to these tools:
  - check_pod_status: Check K8s pod status
  - restart_deployment: Restart a deployment
  
  Always use tools when available. Don't guess.
  """

  # Step 4: Test with explicit request
  result = Runner.run_sync(agent, "Use the check_pod_status tool to check pods in default namespace")
  ```
- **Prevention:** Tool descriptions clear aur detailed rakho
- **Learning:** Tool descriptions = agent ka instruction manual. Bad description = no tool use.

### Incident #2: Agent Infinite Loop
- **Date:** (Practice Scenario)
- **What Broke:** Agent same action baar baar kar raha hai. CPU usage badh raha hai.
- **Root Cause:** No exit condition. Agent ko pata nahi kab rukna hai.
- **Fix:**
  ```python
  # Step 1: Max turns limit lagao
  result = Runner.run_sync(agent, query, max_turns=10)

  # Step 2: Exit condition define karo
  def should_continue(state):
      last_message = state["messages"][-1]
      if last_message.tool_calls:
          return "tools"
      return END  # Exit

  # Step 3: Timeout lagao
  import signal
  def timeout_handler(signum, frame):
      raise TimeoutError("Agent took too long")
  signal.signal(signal.SIGALRM, timeout_handler)
  signal.alarm(60)  # 60 seconds

  # Step 4: Loop detection
  seen_actions = []
  def detect_loop(action):
      if action in seen_actions[-3:]:
          return True  # Loop detected
      seen_actions.append(action)
      return False
  ```
- **Prevention:** Max turns limit, exit conditions, timeout
- **Learning:** Agents need boundaries. Without limits, they can loop forever.

### Incident #3: MCP Server Connection Failed
- **Date:** (Practice Scenario)
- **What Broke:** Agent MCP server se connect nahi ho pa raha. "Connection refused" error.
- **Root Cause:** Wrong command in config ya server start nahi hua.
- **Fix:**
  ```python
  # Step 1: MCP server standalone test karo
  python mcp_server.py
  # Server start hona chahiye

  # Step 2: Config verify karo
  # claude_desktop_config.json
  {
    "mcpServers": {
      "nexabook-tools": {
        "command": "python",
        "args": ["mcp_server.py"],
        "cwd": "/absolute/path/to/server",
        "env": {
          "DATABASE_URL": "postgresql://localhost/nexabook"
        }
      }
    }
  }

  # Step 3: Path verify karo
  ls -la /absolute/path/to/server/mcp_server.py
  # File exist karni chahiye

  # Step 4: Permissions check
  chmod +x mcp_server.py

  # Step 5: Dependencies install
  pip install mcp asyncpg

  # Step 6: Test connection
  curl http://localhost:8080/health
  # MCP server health endpoint
  ```
- **Prevention:** MCP server ko standalone test karo pehle, absolute paths use karo
- **Learning:** MCP = agent ka USB port. Connection nahi = tools nahi.

### Incident #4: Agent Produces Inconsistent Results
- **Date:** (Practice Scenario)
- **What Broke:** Same query, different answers every time. Deployment status different dikhta hai.
- **Root Cause:** Temperature high hai. Model random answers de raha hai.
- **Fix:**
  ```python
  # Step 1: Temperature set karo
  from langchain_openai import ChatOpenAI
  llm = ChatOpenAI(model="gpt-4", temperature=0)  # Deterministic

  # Step 2: Seed fix karo (if supported)
  # OpenAI: seed parameter
  response = client.chat.completions.create(
      model="gpt-4",
      messages=[...],
      seed=42  # Fixed seed
  )

  # Step 3: Structured output use karo
  from pydantic import BaseModel
  class DeploymentStatus(BaseModel):
      name: str
      replicas: int
      status: str

  # Step 4: Cache results
  cache = {}
  def cached_agent(query):
      if query in cache:
          return cache[query]
      result = agent.run(query)
      cache[query] = result
      return result
  ```
- **Prevention:** Temperature=0 for critical tasks, structured output, caching
- **Learning:** Consistency = reliability. Critical tasks ke liye deterministic output chahiye.

### Incident #5: Agent Hallucinates Tool Results
- **Date:** (Practice Scenario)
- **What Broke:** Agent tool results invent kar raha hai. "Server is healthy" without checking.
- **Root Cause:** Agent tools use nahi kar raha, sirf LLM se guess kar raha hai.
- **Fix:**
  ```python
  # Step 1: Force tool use
  instructions = """
  You MUST use tools to get information.
  NEVER guess or make up information.
  If a tool fails, report the error.
  """

  # Step 2: Validate tool results
  def validate_response(response, tool_results):
      for tool_call in response.tool_calls:
          if tool_call.result not in str(tool_results):
              return False  # Hallucination detected
      return True

  # Step 3: Add verification step
  verification_prompt = """
  After using tools, verify your response:
  1. Did you actually call the tool?
  2. Is the response based on tool output?
  3. Are you guessing anything?
  """

  # Step 4: Temperature reduce
  llm = ChatOpenAI(model="gpt-4", temperature=0)
  ```
- **Prevention:** Force tool use, validate results, reduce temperature
- **Learning:** Agent must use tools, not guess. Verification is key.
