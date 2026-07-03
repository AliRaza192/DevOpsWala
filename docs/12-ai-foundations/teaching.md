---
sidebar_position: 13
title: "PHASE 12: AGENTIC AI — Foundations"
description: "**Tumhara level:** Tum already AI agents use kar rahe ho (OpenCode, Claude Code). Ab tum samjho ye kaise kaam karta hai "
---

# PHASE 12: AGENTIC AI — Foundations — TEACHING

> **Tumhara level:** Tum already AI agents use kar rahe ho (OpenCode, Claude Code). Ab tum samjho ye kaise kaam karta hai — LLMs, tokens, context, prompt engineering. Ye tumhe AI ka power user banayega, sirf user nahi. AgentFactory platform pe tum AI-101 se AI-451 tak jaoge.

---

## Section 1: LLMs Kaise Kaam Karte Hain? — The Mental Model

:::tip CONCEPT: LLM = Next Word Predictor (But Very Smart)

LLM (Large Language Model) ek text generator hai. Ye tumhe lagta hai ke samajh raha hai, lekin asal mein ye probability calculate kar raha hai ke agla word kya hona chahiye.

**How it works:**
1. Tum text likhte ho: "The capital of France is"
2. Model probability calculate karta hai: "Paris" = 95%, "London" = 3%, "Berlin" = 1%
3. "Paris" select hota hai

**Key Terms:**
- **Token** — Text ka smallest unit. "Hello" = 1 token. "Artificial Intelligence" = 2 tokens. "Pakistan" = 2 tokens (Paki-stan).
- **Context Window** — Kitne tokens model ek saath yaad rakh sakta hai (4K → 128K → 1M)
- **Temperature** — Kitna creative/random hai response (0 = deterministic, 1 = creative)
- **Transformers** — Architecture jo LLM ko power deta hai (attention mechanism)
- **Fine-tuning** — Pre-trained model ko specific task ke liye train karna
- **System Prompt** — Model ka role aur rules define karta hai
- **Temperature** — Randomness control (0 = deterministic, 1 = creative)
- **Top-p** — Vocabulary diversity control (0.1 = focused, 1.0 = diverse)

**Tokenization (BPE):**
:::

```
"Hello, world!" → ["Hello", ",", " world", "!"] → 4 tokens
"ChatGPT" → ["Chat", "GPT"] → 2 tokens
"tokenization" → ["token", "ization"] → 2 tokens
"xyz123" → ["x", "yz", "123"] → 3 tokens
```

**Context Window Limits:**
- GPT-3.5: 4K tokens (~3,000 words)
- GPT-4: 128K tokens (~100,000 words)
- Claude 3.5: 200K tokens (~150,000 words)
- Gemini 1.5: 1M tokens (~750,000 words)

**Real-world connection:** Tum jab OpenCode se baat karte ho, tumhare messages tokens mein convert hote hain, model respond karta hai, aur tumhe text dikhta hai. Context window limit hai — isliye kabhi kabhi model bhool jaata hai.

:::note HANDS-ON: Token Counting

:::

```python
# File: token_count.py
import tiktoken

# GPT-4 tokenizer
enc = tiktoken.encoding_for_model("gpt-4")

text = "Hello, how are you today?"
tokens = enc.encode(text)
print(f"Text: {text}")
print(f"Tokens: {tokens}")
print(f"Token count: {len(tokens)}")
print(f"Decoded: {[enc.decode([t]) for t in tokens]}")

# Cost estimation
# GPT-4: $0.03 per 1K input tokens, $0.06 per 1K output tokens
input_tokens = len(tokens)
cost = (input_tokens / 1000) * 0.03
print(f"Estimated cost: ${cost:.6f}")
```

:::caution CHECKPOINT:
1. Token kya hai? Agar tumhari prompt 1000 tokens hai to model kitna process karega?
2. Temperature 0 aur 1 mein kya fark hai? Kab kaunsa use karoge?
3. Context window limit kyun hai? Agar limit na ho to kya hoga?
4. Tokenization se cost kaise affect hoti hai?

:::

---

## Section 2: Prompt Engineering — The Art of Talking to AI

:::tip CONCEPT: Prompt = Tumhari Instruction

Jitna achha prompt, utna achha response. Ye tumhari sabse important skill hai AI era mein.

:::

### Zero-Shot Prompting
```
Classify this review as positive, negative, or neutral:
"This movie was absolutely fantastic! Great acting and story."
```
- Koi example nahi diya
- Model khud samajhta hai
- Simple tasks ke liye best

### Few-Shot Prompting
```
Classify these reviews:

Review: "The food was terrible." → Negative
Review: "It was okay, nothing special." → Neutral
Review: "Best restaurant ever!" → Positive

Classify: "The service was slow but food was great."
```
- Examples diye model ko
- Model pattern seekhta hai
- Complex classification ke liye best

### Chain-of-Thought (CoT) Prompting
```
Solve this step by step:

A store has 50 apples. They sell 30% on Monday, 
then receive 20 new apples on Tuesday. 
How many apples do they have?

Think through this step by step before giving the final answer.
```
- Model ko sochne ko bolte hain
- Complex problems ke liye best
- "Let's think step by step" magic phrase hai

### ReAct (Reasoning + Acting)
```
You are a helpful assistant that can use tools.

Question: What is the population of the capital of France?

Thought: I need to find the capital of France first, then its population.
Action: search("capital of France")
Observation: Paris is the capital of France.
Thought: Now I need the population of Paris.
Action: search("population of Paris")
Observation: Paris has approximately 2.1 million people.
Answer: The population of Paris is approximately 2.1 million.
```

### System Prompt Design Patterns

```python
# Pattern 1: Role + Rules + Format
system = """
You are a DevOps assistant. 

Rules:
1. Always provide root cause first
2. Give step-by-step fixes
3. Include prevention tips

Format:
## Root Cause
## Fix Steps
## Prevention
"""

# Pattern 2: Role + Constraints + Examples
system = """
You are a code reviewer. 

Constraints:
- Never approve code with security vulnerabilities
- Always suggest performance improvements
- Use conventional commit format

Example:
Input: "function add(a,b){return a+b}"
Output: "Code review: 
- Missing type hints
- No input validation
- Suggestion: function add(a: number, b: number): number { return a + b; }"
"""

# Pattern 3: XML-like structured prompt
system = """
<role>You are a helpful DevOps assistant</role>
<instructions>
- Analyze the issue
- Provide root cause
- Give step-by-step fix
</instructions>
<output_format>
Use markdown with headers
Include code blocks for commands
</output_format>
"""
```

:::note HANDS-ON: Prompt Engineering Practice

:::

```python
# File: prompt_practice.py
import openai

client = openai.OpenAI()

# Zero-shot
response = client.chat.completions.create(
    model="gpt-4",
    messages=[
        {"role": "user", "content": "Classify as positive/negative: 'Great product!'"}
    ]
)
print("Zero-shot:", response.choices[0].message.content)

# Few-shot
response = client.chat.completions.create(
    model="gpt-4",
    messages=[
        {"role": "user", "content": """
Classify reviews:

Review: "Terrible" → Negative
Review: "Amazing" → Positive
Review: "It's okay" → Neutral

Review: "Not bad, could be better"
"""}
    ]
)
print("Few-shot:", response.choices[0].message.content)

# Chain-of-Thought
response = client.chat.completions.create(
    model="gpt-4",
    messages=[
        {"role": "user", "content": """
Solve step by step:
If a server has 16GB RAM and each container uses 512MB,
how many containers can it run? Consider 2GB for OS.
"""}
    ]
)
print("CoT:", response.choices[0].message.content)
```

:::caution CHECKPOINT:
1. Zero-shot aur few-shot mein kab kaunsa use karoge?
2. Chain-of-Thought kyun effective hai? Kab zaroori nahi hai?
3. System prompt mein kaunsi cheezen zaroori hain?

:::

---

## Section 3: Structured Output & Function Calling

:::tip CONCEPT: Structured Output = AI Se Expected Format Mein Output

:::

### JSON Mode

```python
response = client.chat.completions.create(
    model="gpt-4",
    messages=[
        {"role": "system", "content": "You must respond in valid JSON."},
        {"role": "user", "content": "Extract name and age from: John is 25 years old"}
    ],
    response_format={"type": "json_object"}
)
print(response.choices[0].message.content)
# {"name": "John", "age": 25}
```

### Function Calling (Tool Use)

```python
import json

tools = [
    {
        "type": "function",
        "function": {
            "name": "get_pod_status",
            "description": "Get the status of a Kubernetes pod",
            "parameters": {
                "type": "object",
                "properties": {
                    "namespace": {
                        "type": "string",
                        "description": "Kubernetes namespace"
                    },
                    "pod_name": {
                        "type": "string",
                        "description": "Name of the pod"
                    }
                },
                "required": ["namespace", "pod_name"]
            }
        }
    }
]

response = client.chat.completions.create(
    model="gpt-4",
    messages=[
        {"role": "user", "content": "Check the status of nginx pod in default namespace"}
    ],
    tools=tools,
    tool_choice="auto"
)

# Parse function call
tool_call = response.choices[0].message.tool_calls[0]
function_name = tool_call.function.name
arguments = json.loads(tool_call.function.arguments)
print(f"Function: {function_name}")
print(f"Arguments: {arguments}")
# Function: get_pod_status
# Arguments: {"namespace": "default", "pod_name": "nginx"}
```

:::note HANDS-ON: Function Calling Practice

:::

```python
# File: function_calling.py
import json
import openai

client = openai.OpenAI()

# Define tools
tools = [
    {
        "type": "function",
        "function": {
            "name": "check_disk_usage",
            "description": "Check disk usage of a server",
            "parameters": {
                "type": "object",
                "properties": {
                    "server": {"type": "string", "description": "Server hostname or IP"},
                    "threshold": {"type": "number", "description": "Alert threshold percentage"}
                },
                "required": ["server"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "restart_service",
            "description": "Restart a systemd service",
            "parameters": {
                "type": "object",
                "properties": {
                    "service": {"type": "string", "description": "Service name"},
                    "server": {"type": "string", "description": "Server to restart on"}
                },
                "required": ["service", "server"]
            }
        }
    }
]

# Chat with function calling
messages = [
    {"role": "user", "content": "My nginx server at 192.168.1.10 seems slow. Check disk and restart if needed."}
]

response = client.chat.completions.create(
    model="gpt-4",
    messages=messages,
    tools=tools,
    tool_choice="auto"
)

# Handle tool calls
for tool_call in response.choices[0].message.tool_calls:
    func_name = tool_call.function.name
    args = json.loads(tool_call.function.arguments)
    print(f"Calling: {func_name}({args})")
    # Execute actual function here
```

---

## Section 4: AI Development Spectrum — Where Are You?

:::tip CONCEPT: 3 Levels of AI Usage

:::

```
Level 1: AI-Assisted (Tumhara code, AI suggestions)
├── GitHub Copilot
├── ChatGPT for questions
└── AI suggests, you decide

Level 2: AI-Driven (AI likhta hai, tum review karte ho)
├── Claude Code / OpenCode
├── Cursor
└── You describe, AI builds, you verify

Level 3: AI-Native (AI + Agents autonomously kaam karte hain)
├── AgentFactory
├── Multi-agent systems
└── AI plans, executes, learns
```

**Tum abhi Level 2 pe ho (OpenCode/Claude Code use kar rahe ho). Goal hai Level 3.**

### AgentFactory Platform Overview

```
AgentFactory: https://agentfactory.panaversity.org/

AI-101: AI Foundations (prompting, LLMs)
├── How to Think in the AI Era
├── AI Prompting in 2026
└── What AI Actually Is

AI-251: Type-Driven Development
├── Python type hints
├── Pydantic validation
└── Spec-driven development

AI-301: Agent Building
├── LangGraph
├── OpenAI SDK
├── MCP (Model Context Protocol)
└── Google ADK

AI-451: Production Agents
├── Digital FTEs
├── Eval-driven development
└── Multi-agent systems
```

### Level 2 → Level 3 Transition
- Ab tum `--viibe` mode mein OpenCode chalate ho
- AgentFactory seekhoge
- Autonomous agents banaoge

---

## Section 5: Spec-Driven Development — AI Ko Samjhao

:::tip CONCEPT: Spec = AI Ka Blueprint

Jab tum AI se code karwate ho, tumhe clearly batana hota hai kya chahiye.

:::

```markdown
# Spec: Nexabook Transaction Service

## Endpoint
POST /api/transactions

## Request Body
{
  "account_id": "string (required)",
  "amount": "number (required, > 0)",
  "currency": "string (required, ISO 4217)",
  "type": "enum: transfer | deposit | withdrawal"
}

## Business Rules
- Minimum transaction: 1 PKR
- Maximum single transaction: 1,000,000 PKR
- Daily limit: 5,000,000 PKR
- Islamic compliance: No interest (riba) allowed
- Shari'ah board approval required for transactions > 500,000 PKR

## Response
{
  "transaction_id": "uuid",
  "status": "pending | completed | rejected",
  "timestamp": "ISO 8601",
  "shariah_compliance": true | false
}

## Error Responses
- 400: Invalid request
- 403: Daily limit exceeded
- 422: Shari'ah compliance violation
```

**Why specs matter:**
- AI ko clear instructions milte hain
- Kam errors hote hain
- Review karna aasan hota hai
- Documentation khud ban jaati hai

---

## Section 6: Context Engineering — Tumhari AI Strategy

:::tip CONCEPT: Context = Tumhara Competitive Advantage

Context engineering = tum AI ko sahi information sahi time pe dete ho.

**Types of Context:**
1. **System Prompt** — AI ka role defined karo
2. **Few-shot Examples** — Patterns dikhao
3. **Tool Descriptions** — Available tools describe karo
4. **Memory** — Previous conversations yaad rakho
5. **Retrieved Context** — External documents se relevant info lao

:::

```python
system_prompt = """
You are Nexabook AI Assistant, a banking assistant for Islamic banking.

Rules:
1. Never discuss interest (riba) - it's prohibited in Islam
2. Always mention Shari'ah compliance
3. Use formal, professional language
4. If unsure about compliance, ask for Shari'ah board review

Available tools:
- check_balance(account_id): Check account balance
- create_transaction(account_id, amount, type): Create transaction
- check_shariah_compliance(transaction): Check Islamic compliance
"""
```

:::note HANDS-ON: Context Engineering Practice

:::

```python
# File: context_engineering.py
import openai

client = openai.OpenAI()

system_context = """
You are a DevOps assistant. You help with:
- Docker container issues
- Kubernetes pod debugging
- CI/CD pipeline problems
- Linux server troubleshooting

Always provide:
1. Root cause
2. Step-by-step fix
3. Prevention tips

Use technical language but explain concepts clearly.
"""

examples = [
    {"role": "user", "content": "My pod is in CrashLoopBackOff"},
    {"role": "assistant", "content": """
## Root Cause
Pod is crashing repeatedly. Most common causes:
1. Application error (check logs)
2. Wrong CMD/ENTRYPOINT
3. Missing environment variables

## Fix
```bash
kubectl logs <pod-name> --previous
kubectl describe pod <pod-name>
```

## Prevention
- Test Dockerfile locally
- Use healthchecks
- Set resource limits
"""&#125;,
]

user_query = "My nginx pod shows ImagePullBackOff"

response = client.chat.completions.create(
    model="gpt-4",
    messages=[
        &#123;"role": "system", "content": system_context&#125;,
        *examples,
        &#123;"role": "user", "content": user_query&#125;
    ]
)
print(response.choices[0].message.content)
```

---

## Section 7: Model Selection Guide

:::tip CONCEPT: Right Model for Right Task

:::

```
GPT-4o: Best all-around, expensive
├── Complex reasoning
├── Code generation
├── Multi-modal (text + image)
└── Cost: $5/1M input, $15/1M output

GPT-4o-mini: Fast, cheap
├── Simple tasks
├── High volume
├── Quick responses
└── Cost: $0.15/1M input, $0.60/1M output

Claude 3.5 Sonnet: Best for coding
├── Code generation
├── Long documents
├── Analysis
└── Cost: $3/1M input, $15/1M output

Claude 3.5 Haiku: Fast, cheap
├── Simple queries
├── High volume
├── Quick responses
└── Cost: $0.25/1M input, $1.25/1M output

Gemini 1.5 Pro: Largest context
├── Very long documents
├── Multi-modal
├── Research
└── Cost: $1.25/1M input, $5/1M output

Open Source (Llama 3, Mistral):
├── Self-hosted
├── No API costs
├── Data privacy
└── Cost: Infrastructure only
```

### Decision Framework

```
Task: Generate code
├── Simple function → GPT-4o-mini or Claude Haiku
├── Complex architecture → GPT-4o or Claude Sonnet
└── Long codebase → Claude Sonnet (200K context)

Task: Analyze document
├── Short doc (&lt;10K words) → Any model
├── Long doc (10K-100K words) → Claude Sonnet
└── Very long doc (100K+ words) → Gemini 1.5 Pro

Task: Classification
├── Simple categories → GPT-4o-mini
├── Complex categories → GPT-4o
└── Custom categories → Fine-tuned model
```

---

## Section 8: Evaluation Basics — AI Quality Measure

:::tip CONCEPT: Evaluate = Tum Pata Karo Kya Sahi Hai, Kya Galat

:::

```python
# File: evaluation.py
def evaluate_response(response: str, expected: str) -> dict:
    """Simple evaluation metrics"""
    metrics = {
        "contains_answer": expected.lower() in response.lower(),
        "length_ok": 50 < len(response) < 500,
        "no_hallucination": "I don't know" not in response or "I'm not sure" not in response,
        "format_ok": response.startswith("##") or response.startswith("**"),
    }
    metrics["score"] = sum(metrics.values()) / len(metrics)
    return metrics

# Test with different prompts
prompts = [
    "What is Docker?",
    "Explain Docker in simple terms",
    "Explain Docker to a 5 year old",
]

for prompt in prompts:
    response = get_ai_response(prompt)
    metrics = evaluate_response(response, "Docker is a containerization platform")
    print(f"Prompt: {prompt}")
    print(f"Score: {metrics['score']:.2f}")
    print("---")
```

### Common Evaluation Metrics

```
Accuracy: Correct answers / Total answers
Relevance: How relevant is the response to the query?
Coherence: Is the response well-structured?
Hallucination Rate: How often does AI make things up?
Latency: How fast is the response?
Cost: How much does it cost per query?
```

---

## Section 9: AI Ethics & Safety

:::tip CONCEPT: AI = Power + Responsibility

**Key Principles:**
1. **Transparency** — Batavo ke AI use ho raha hai
2. **Accuracy** — AI outputs verify karo
3. **Privacy** — User data protect karo
4. **Fairness** — Bias check karo
5. **Safety** — Harmful content block karo

**In Islamic Banking Context:**
- AI decisions must be auditable
- Shari'ah compliance must be verified by humans
- No interest-based suggestions
- Data privacy is mandatory (GDPR + Islamic principles)

:::

```python
# Safety guardrails
def check_shariah_compliance(response: str) -> bool:
    """Check if AI response violates Islamic banking principles"""
    forbidden_terms = ["interest", "riba", "usury", "gambling", "maysir"]
    for term in forbidden_terms:
        if term.lower() in response.lower():
            return False
    return True

def add_disclaimer(response: str) -> str:
    """Add compliance disclaimer"""
    return f"{response}\n\n*This is AI-generated advice. Please consult a Shari'ah board for official rulings.*"
```

:::caution CHECKPOINT:
1. AI ethics sirf big companies ke liye hai ya tumhare liye bhi?
2. Islamic banking mein AI use karne ke kya risks hain?
3. AI hallucination se kaise bachoge?

:::

---

## Summary: Phase 12 Key Takeaways

| Concept | Tumne Kya Seekha |
|---------|-----------------|
| LLMs | Tokens, context window, temperature, top-p |
| Prompt Engineering | Zero-shot, few-shot, CoT, ReAct |
| Structured Output | JSON mode, function calling |
| AI Spectrum | AI-Assisted → AI-Driven → AI-Native |
| Specs | Clear instructions for AI |
| Context Engineering | System prompts, examples, memory |
| Model Selection | Right model for right task |
| Evaluation | Measuring AI quality |
| Ethics | Safety, transparency, fairness |

---

## MINI-TASKS

### Task 1: Prompt Engineering (15 min)
3 types of prompts try karo:
- Zero-shot: Simple classification
- Few-shot: Pattern matching
- CoT: Complex problem solving
Compare results.

### Task 2: Function Calling (20 min)
Tools define karo:
- Kubernetes pod status checker
- Disk usage monitor
- Service restart function
Test with natural language queries.

### Task 3: Spec Writing (20 min)
Nexabook ke kisi feature ka spec likho:
- Endpoint definition
- Request/response format
- Business rules
- Error handling

### Task 4: Context Engineering (15 min)
AI assistant banao with:
- System prompt (role defined)
- Few-shot examples (2-3)
- Tool descriptions
Test karo different queries se.

---

## INCIDENT.md: Practice Scenarios

### Incident #1: AI Produces Wrong Output
- **Date:** (Practice Scenario)
- **What Broke:** Model galat answer de raha hai. Classification wrong hai.
- **Root Cause:** Prompt mein information missing hai. Examples nahi diye.
- **Fix:**
  ```python
  # Step 1: Prompt analyze karo
  # Kya information missing hai?

  # Step 2: Few-shot examples add karo
  messages = [
      {"role": "system", "content": "Classify reviews as positive/negative/neutral."},
      {"role": "user", "content": """
  Examples:
  Review: "Terrible" → Negative
  Review: "Amazing" → Positive
  Review: "It's okay" → Neutral

  Now classify: "Not bad, could be better"
  """}
  ]

  # Step 3: CoT add karo for complex tasks
  messages = [
      {"role": "user", "content": """
  Classify this review step by step:
  1. Identify sentiment words
  2. Determine overall tone
  3. Classify as positive/negative/neutral

  Review: "The service was slow but food was great"
  """}
  ]

  # Step 4: Test and iterate
  # Different prompts try karo, best result select karo
  ```
- **Prevention:** Prompt templates banao aur test karo
- **Learning:** Better prompt = better output. Examples help model ko pattern seekhne mein.

### Incident #2: AI Hallucination
- **Date:** (Practice Scenario)
- **What Broke:** Model fake APIs/inventions kar raha hai. Galat commands de raha hai.
- **Root Cause:** No tool descriptions provided. Model ko nahi pata kaunse tools available hain.
- **Fix:**
  ```python
  # Step 1: Explicit tool list do
  tools = [
      {"type": "function", "function": {"name": "kubectl_get_pods", ...}},
      {"type": "function", "function": {"name": "kubectl_logs", ...}}
  ]

  # Step 2: Instructions add karo
  system = """
  You have access to these tools ONLY:
  - kubectl_get_pods
  - kubectl_logs
  - kubectl_describe

  If you need something not in this list, say "I don't have a tool for that."
  """

  # Step 3: Validate output
  def validate_response(response):
      # Check if response contains known hallucination patterns
      hallucination_patterns = [
          "I ran the command",
          "I checked the server",
          "The system shows"
      ]
      for pattern in hallucination_patterns:
          if pattern in response:
              return False  # Likely hallucination
      return True

  # Step 4: Use function calling instead of free text
  # Force model to use tools, not invent them
  ```
- **Prevention:** Structured output formats use karo, tool descriptions do
- **Learning:** Hallucination = model invents things. Fix with explicit constraints.

### Incident #3: Context Window Overflow
- **Date:** (Practice Scenario)
- **What Broke:** Model purani information bhool raha hai. Context lost ho gaya.
- **Root Cause:** Context window limit exceed. 128K tokens ke baad model bhoolta hai.
- **Fix:**
  ```python
  # Step 1: Token count karo
  import tiktoken
  enc = tiktoken.encoding_for_model("gpt-4")
  tokens = enc.encode(str(messages))
  print(f"Token count: {len(tokens)}")

  # Step 2: Older messages summarize karo
  def summarize_messages(messages, max_tokens=4000):
      # First message ko summarize karo
      summary = call_llm("Summarize this conversation: " + str(messages[:5]))
      # Summary ko first message banao
      return [{"role": "system", "content": summary}] + messages[-10:]

  # Step 3: Retrieval use karo
  # Sirf relevant context load karo, sab nahi

  # Step 4: Sliding window
  # Har 10 messages ke baad purane hatao
  if len(messages) > 20:
      messages = messages[-20:]  # Last 20 rakho
  ```
- **Prevention:** Context management strategy banao, token counting karo
- **Learning:** Context window = working memory. Limited hai. Manage karo.

### Incident #4: Temperature Too High
- **Date:** (Practice Scenario)
- **What Broke:** Model random/inconsistent answers de raha hai. Har baar alag answer.
- **Root Cause:** Temperature 1.0 set hai. Too much randomness.
- **Fix:**
  ```python
  # Step 1: Current temperature check
  # Default: temperature=1.0

  # Step 2: Deterministic tasks ke liye temperature=0
  response = client.chat.completions.create(
      model="gpt-4",
      messages=[...],
      temperature=0  # Deterministic
  )

  # Step 3: Creative tasks ke liye temperature=0.7-1.0
  response = client.chat.completions.create(
      model="gpt-4",
      messages=[...],
      temperature=0.8  # Creative
  )

  # Step 4: Balance
  # Code generation: temperature=0
  # Creative writing: temperature=0.8
  # Classification: temperature=0
  # Brainstorming: temperature=1.0
  ```
- **Prevention:** Match temperature to task type
- **Learning:** Temperature = randomness knob. Low = predictable, High = creative.

### Incident #5: API Rate Limit Exceeded
- **Date:** (Practice Scenario)
- **What Broke:** Too many API calls. 429 Too Many Requests error.
- **Root Cause:** No rate limiting in code. Loops mein API calls.
- **Fix:**
  ```python
  # Step 1: Rate limiting add karo
  from ratelimit import limits, sleep_and_retry
  import time

  @sleep_and_retry
  @limits(calls=10, period=60)  # 10 calls per minute
  def call_api(prompt):
      return client.chat.completions.create(
          model="gpt-4",
          messages=[{"role": "user", "content": prompt}]
      )

  # Step 2: Exponential backoff
  def call_with_backoff(prompt, max_retries=3):
      for attempt in range(max_retries):
          try:
              return call_api(prompt)
          except openai.RateLimitError:
              wait_time = 2 ** attempt  # 1, 2, 4 seconds
              print(f"Rate limited. Waiting {wait_time}s...")
              time.sleep(wait_time)
      raise Exception("Max retries exceeded")

  # Step 3: Batch processing
  # Multiple queries ko batch mein process karo
  def batch_process(queries, batch_size=5):
      results = []
      for i in range(0, len(queries), batch_size):
          batch = queries[i:i+batch_size]
          batch_results = [call_api(q) for q in batch]
          results.extend(batch_results)
          time.sleep(1)  # Wait between batches
      return results

  # Step 4: Cache results
  # Same query dubara mat karo, cache karo
  cache = {}
  def cached_api(prompt):
      if prompt in cache:
          return cache[prompt]
      result = call_api(prompt)
      cache[prompt] = result
      return result
  ```
- **Prevention:** Always add rate limiting, exponential backoff, caching
- **Learning:** API limits exist karte hain. Respect karo. Cache karo.
