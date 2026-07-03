---
sidebar_position: 14
title: "Phase 12: Incident Log"
description: "Real-world incident scenarios for Phase 12"
---

# INCIDENT LOG — Phase: AI Foundations

---

## Incident #1: AI Produces Wrong Output
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

---

## Incident #2: AI Hallucination
- **Date:** (Practice Scenario)
- **What Broke:** Model fake APIs/inventions kar raha hai. Galat commands de raha hai.
- **Root Cause:** No tool descriptions provided.
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
      hallucination_patterns = [
          "I ran the command",
          "I checked the server",
          "The system shows"
      ]
      for pattern in hallucination_patterns:
          if pattern in response:
              return False
      return True
  ```
- **Prevention:** Structured output formats use karo, tool descriptions do
- **Learning:** Hallucination = model invents things. Fix with explicit constraints.

---

## Incident #3: Context Window Overflow
- **Date:** (Practice Scenario)
- **What Broke:** Model purani information bhool raha hai.
- **Root Cause:** Context window limit exceed.
- **Fix:**
  ```python
  # Step 1: Token count karo
  import tiktoken
  enc = tiktoken.encoding_for_model("gpt-4")
  tokens = enc.encode(str(messages))
  print(f"Token count: {len(tokens)}")

  # Step 2: Older messages summarize karo
  def summarize_messages(messages, max_tokens=4000):
      summary = call_llm("Summarize this conversation: " + str(messages[:5]))
      return [{"role": "system", "content": summary}] + messages[-10:]

  # Step 3: Sliding window
  if len(messages) > 20:
      messages = messages[-20:]
  ```
- **Prevention:** Context management strategy banao
- **Learning:** Context window = working memory. Limited hai.

---

## Incident #4: Temperature Too High
- **Date:** (Practice Scenario)
- **What Broke:** Model random/inconsistent answers de raha hai.
- **Root Cause:** Temperature 1.0 set hai.
- **Fix:**
  ```python
  # Deterministic tasks ke liye temperature=0
  response = client.chat.completions.create(
      model="gpt-4",
      messages=[...],
      temperature=0
  )

  # Creative tasks ke liye temperature=0.7-1.0
  response = client.chat.completions.create(
      model="gpt-4",
      messages=[...],
      temperature=0.8
  )
  ```
- **Prevention:** Match temperature to task type
- **Learning:** Temperature = randomness knob.

---

## Incident #5: API Rate Limit Exceeded
- **Date:** (Practice Scenario)
- **What Broke:** Too many API calls. 429 error.
- **Root Cause:** No rate limiting in code.
- **Fix:**
  ```python
  from ratelimit import limits, sleep_and_retry

  @sleep_and_retry
  @limits(calls=10, period=60)
  def call_api(prompt):
      return client.chat.completions.create(
          model="gpt-4",
          messages=[{"role": "user", "content": prompt}]
      )

  # Exponential backoff
  def call_with_backoff(prompt, max_retries=3):
      for attempt in range(max_retries):
          try:
              return call_api(prompt)
          except openai.RateLimitError:
              wait_time = 2 ** attempt
              time.sleep(wait_time)
      raise Exception("Max retries exceeded")

  # Cache results
  cache = {}
  def cached_api(prompt):
      if prompt in cache:
          return cache[prompt]
      result = call_api(prompt)
      cache[prompt] = result
      return result
  ```
- **Prevention:** Always add rate limiting, caching
- **Learning:** API limits exist karte hain. Respect karo.
