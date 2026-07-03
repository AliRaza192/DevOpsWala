---
sidebar_position: 17
title: "Phase 15: Incident Log"
description: "Real-world incident scenarios for Phase 15"
---

# INCIDENT LOG — Phase: AI Production Deployment

---

## Incident #1: Agent Hallucination in Production
- **Date:** (Practice Scenario)
- **What Broke:** Agent ne fake transaction create kar di. Customer ko galat balance dikhaya.
- **Root Cause:** No input validation. Agent ne hallucinate kiya.
- **Fix:**
  ```python
  # Step 1: Input validation
  def validate_transaction(data):
      if not data.get("account_id"):
          return False, "Account ID required"
      if data.get("amount", 0) <= 0:
          return False, "Amount must be positive"
      return True, "Valid"

  # Step 2: Output validation
  output_guardrail = OutputGuardrail()
  output_guardrail.add_rule(no_pii_in_output)

  # Step 3: Tool verification
  instructions = """
  You MUST use tools to get data. NEVER make up information.
  """

  # Step 4: HITL for critical actions
  def check_with_human(transaction):
      if transaction["amount"] > 100000:
          return "APPROVAL_REQUIRED"
      return "AUTO_APPROVED"
  ```
- **Prevention:** Input guardrails mandatory, tool verification, HITL
- **Learning:** Agent must use tools, not guess.

---

## Incident #2: Cost Spike
- **Date:** (Practice Scenario)
- **What Broke:** Daily cost $100 (expected $10).
- **Root Cause:** No cost limits.
- **Fix:**
  ```python
  # Step 1: Budget enforcer
  enforcer = BudgetEnforcer(daily_limit=10, monthly_limit=200)

  # Step 2: Cost estimation
  def estimate_cost(query, model):
      tokens = len(query.split()) * 1.3
      pricing = PRICING[model]
      return (tokens / 1000 * pricing.input_per_1k)

  # Step 3: Check before proceeding
  if not enforcer.can_proceed(estimated_cost):
      return {"error": "Budget limit reached"}

  # Step 4: Model selection
  def select_model(query):
      if len(query.split()) < 20:
          return "gpt-3.5-turbo"
      return "gpt-4"
  ```
- **Prevention:** Always set cost limits
- **Learning:** Monitor costs in real-time.

---

## Incident #3: Agent Leaked PII
- **Date:** (Practice Scenario)
- **What Broke:** Agent ne customer ka credit card number output mein bhej diya.
- **Root Cause:** No output guardrails.
- **Fix:**
  ```python
  # Step 1: PII detection
  def no_pii_in_output(text):
      pii_patterns = [
          r'\b\d{4}-\d{4}-\d{4}-\d{4}\b',
          r'\b\d{13,16}\b'
      ]
      for pattern in pii_patterns:
          if re.search(pattern, text):
              return GuardrailResult(passed=False, reason="PII detected")
      return GuardrailResult(passed=True)

  # Step 2: Output guardrail
  output_guardrail = OutputGuardrail()
  output_guardrail.add_rule(no_pii_in_output)

  # Step 3: Mask PII in logs
  def mask_pii(text):
      return re.sub(r'\b\d{4}-\d{4}-\d{4}-\d{4}\b', '****-****-****-****', text)
  ```
- **Prevention:** Output guardrails mandatory for banking
- **Learning:** Scan outputs for PII.

---

## Incident #4: Eval Suite Failed
- **Date:** (Practice Scenario)
- **What Broke:** Agent failing 30% of test cases.
- **Root Cause:** Missing edge cases.
- **Fix:**
  ```python
  # Step 1: Analyze failures
  for case in failed_cases:
      print(f"Failed: {case['name']}")

  # Step 2: Add edge cases
  eval_suite.add_case(EvalCase(
      name="partial_interest",
      input="Transfer with 0.1% processing fee",
      criteria=["analyzes", "mentions fee structure"]
  ))

  # Step 3: Update system prompt
  instructions = """
  Check for DISGUISED interest:
  - Processing fees that are actually interest
  """

  # Step 4: Re-run eval
  results = run_eval()
  ```
- **Prevention:** Run evals before deployment
- **Learning:** Eval suites need maintenance.

---

## Incident #5: Agent Timeout in Production
- **Date:** (Practice Scenario)
- **What Broke:** Agent response > 60 seconds.
- **Root Cause:** Complex query, no timeout.
- **Fix:**
  ```python
  # Step 1: Timeout
  import signal
  def timeout_handler(signum, frame):
      raise TimeoutError("Agent timeout")
  signal.signal(signal.SIGALRM, timeout_handler)
  signal.alarm(30)

  # Step 2: Caching
  cache = {}
  def cached_agent(query):
      if query in cache:
          return cache[query]
      result = agent.run(query)
      cache[query] = result
      return result

  # Step 3: Model selection
  def select_model(query):
      if is_simple(query):
          return "gpt-3.5-turbo"
      return "gpt-4"
  ```
- **Prevention:** Set timeouts, caching, model selection
- **Learning:** Optimize for speed.
