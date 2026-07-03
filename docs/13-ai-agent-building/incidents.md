---
sidebar_position: 15
title: "Phase 13: Incident Log"
description: "Real-world incident scenarios for Phase 13"
---

# INCIDENT LOG — Phase: AI Agent Building

---

## Incident #1: Agent Doesn't Use Tools
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

  # Step 2: System prompt mein tools mention karo
  instructions = """
  You have access to these tools:
  - check_pod_status: Check K8s pod status
  - restart_deployment: Restart a deployment
  
  Always use tools when available. Don't guess.
  """

  # Step 3: Test with explicit request
  result = Runner.run_sync(agent, "Use the check_pod_status tool to check pods")
  ```
- **Prevention:** Tool descriptions clear aur detailed rakho
- **Learning:** Tool descriptions = agent ka instruction manual.

---

## Incident #2: Agent Infinite Loop
- **Date:** (Practice Scenario)
- **What Broke:** Agent same action baar baar kar raha hai.
- **Root Cause:** No exit condition.
- **Fix:**
  ```python
  # Step 1: Max turns limit
  result = Runner.run_sync(agent, query, max_turns=10)

  # Step 2: Exit condition
  def should_continue(state):
      last_message = state["messages"][-1]
      if last_message.tool_calls:
          return "tools"
      return END

  # Step 3: Timeout
  import signal
  def timeout_handler(signum, frame):
      raise TimeoutError("Agent took too long")
  signal.signal(signal.SIGALRM, timeout_handler)
  signal.alarm(60)
  ```
- **Prevention:** Max turns, exit conditions, timeout
- **Learning:** Agents need boundaries.

---

## Incident #3: MCP Server Connection Failed
- **Date:** (Practice Scenario)
- **What Broke:** Agent MCP server se connect nahi ho pa raha.
- **Root Cause:** Wrong command in config.
- **Fix:**
  ```python
  # Step 1: MCP server standalone test
  python mcp_server.py

  # Step 2: Config verify
  # claude_desktop_config.json
  {
    "mcpServers": {
      "nexabook-tools": {
        "command": "python",
        "args": ["mcp_server.py"],
        "cwd": "/absolute/path/to/server"
      }
    }
  }

  # Step 3: Dependencies install
  pip install mcp asyncpg
  ```
- **Prevention:** Standalone test karo pehle
- **Learning:** MCP = agent ka USB port.

---

## Incident #4: Agent Produces Inconsistent Results
- **Date:** (Practice Scenario)
- **What Broke:** Same query, different answers every time.
- **Root Cause:** Temperature high hai.
- **Fix:**
  ```python
  # Step 1: Temperature set
  llm = ChatOpenAI(model="gpt-4", temperature=0)

  # Step 2: Structured output
  from pydantic import BaseModel
  class DeploymentStatus(BaseModel):
      name: str
      replicas: int
      status: str

  # Step 3: Cache results
  cache = {}
  def cached_agent(query):
      if query in cache:
          return cache[query]
      result = agent.run(query)
      cache[query] = result
      return result
  ```
- **Prevention:** Temperature=0, structured output, caching
- **Learning:** Consistency = reliability.

---

## Incident #5: Agent Hallucinates Tool Results
- **Date:** (Practice Scenario)
- **What Broke:** Agent tool results invent kar raha hai.
- **Root Cause:** Agent tools use nahi kar raha, guess kar raha hai.
- **Fix:**
  ```python
  # Step 1: Force tool use
  instructions = """
  You MUST use tools to get information.
  NEVER guess or make up information.
  """

  # Step 2: Validate tool results
  def validate_response(response, tool_results):
      for tool_call in response.tool_calls:
          if tool_call.result not in str(tool_results):
              return False
      return True

  # Step 3: Temperature reduce
  llm = ChatOpenAI(model="gpt-4", temperature=0)
  ```
- **Prevention:** Force tool use, validate results
- **Learning:** Agent must use tools, not guess.
