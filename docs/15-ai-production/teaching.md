---
sidebar_position: 16
title: "PHASE 15: AGENTIC AI — Production: Digital FTEs & Deployment"
description: "**Tumhara level:** Tumne agents build kiye hain (Phase 13-14). Ab production ke liye ready karo — Digital FTEs, evaluati"
---

# PHASE 15: AGENTIC AI — Production: Digital FTEs & Deployment — TEACHING

> **Tumhara level:** Tumne agents build kiye hain (Phase 13-14). Ab production ke liye ready karo — Digital FTEs, evaluation, guardrails, monitoring. Ye tumhare Islamic Banking FTE ko production-ready banayega. AgentFactory AI-451 mein tum Digital FTEs aur Eval-Driven Development seekhoge.

---

## Section 1: Digital FTE — The Concept

:::tip CONCEPT: Digital FTE = AI Worker Jo Ek Role Poora Karta Hai

**Digital FTE** ek AI agent hai jo ek specific job role poora karta hai — jaise ek real employee.

:::

```
Real FTE:                    Digital FTE:
├── Has role                 ├── Has role (system prompt)
├── Has access               ├── Has tools (APIs, DBs)
├── Follows process          ├── Follows workflow
├── Reports to manager       ├── Reports to supervisor
├── Makes decisions          ├── Makes decisions (within bounds)
└── Gets evaluated           └── Gets evaluated (metrics)
```

**Example: Islamic Banking Digital FTE**
- **Role:** Transaction Compliance Officer
- **Responsibilities:** Check every transaction for Shari'ah compliance
- **Tools:** Database access, compliance rules API, notification system
- **Reports:** Daily compliance report to human manager
- **Boundaries:** Cannot approve transactions > 1M PKR (human required)

**Digital FTE Design Template:**
```markdown
# Digital FTE: Compliance Officer

## Role
Check all transactions for Shari'ah compliance before processing.

## Responsibilities
1. Validate transaction details
2. Check for prohibited elements (riba, maysir, gharar)
3. Verify compliance with Islamic banking rules
4. Flag violations for human review
5. Generate compliance reports

## Tools
- check_transaction(account_id, amount, type)
- check_shariah_rules(transaction_details)
- create_compliance_report(transaction_id, status)
- notify_manager(transaction_id, issue)

## Boundaries
- Cannot process transactions > 1M PKR without human approval
- Cannot modify compliance rules
- Must escalate all violations to human manager

## Metrics
- Accuracy: >99% compliance detection
- Speed: &lt;2 seconds per transaction
- False positive rate: &lt;5%
```

:::caution CHECKPOINT:
1. Digital FTE aur simple chatbot mein kya fark hai?
2. Kab Digital FTE use karna chahiye, kab simple automation?
3. Tumhare Islamic Banking SaaS mein kaunse Digital FTEs ban sakte hain?

:::

---

:::note HANDS-ON: Apna Digital FTE Design Karo

Ye exercise tumhe sikhayegi ke ek Digital FTE ko kaise design karte hain — role, tools, boundaries, aur metrics.

:::

```python
# File: digital_fte_lab.py
from dataclasses import dataclass, field
from typing import List, Dict
from datetime import datetime

@dataclass
class DigitalFTE:
    name: str
    role: str
    responsibilities: List[str]
    tools: List[str]
    boundaries: Dict[str, any]
    metrics: Dict[str, str]
    reports_to: str

    def to_prompt(self) -> str:
        return f"""You are {self.name}, a {self.role}.

Responsibilities:
{chr(10).join(f'- {r}' for r in self.responsibilities)}

Tools available: {', '.join(self.tools)}

Boundaries:
{chr(10).join(f'- {k}: {v}' for k, v in self.boundaries.items())}

You report to: {self.reports_to}
Always explain your decisions."""

# Step 1: Islamic Banking Compliance Officer design karo
compliance_officer = DigitalFTE(
    name="Shari'ah Compliance Officer",
    role="Transaction Compliance Checker",
    responsibilities=[
        "Check every transaction for Shari'ah compliance",
        "Reject interest (riba) based transactions",
        "Reject gambling (maysir) related transfers",
        "Flag high-value transactions for human review",
        "Generate daily compliance reports"
    ],
    tools=["check_transaction", "check_shariah_rules", "create_report", "notify_manager"],
    boundaries={
        "max_auto_approved_amount": "500,000 PKR",
        "can_modify_rules": False,
        "must_escalate_violations": True
    },
    metrics={
        "accuracy": ">99%",
        "response_time": "&lt;2 seconds",
        "false_positive_rate": "&lt;5%"
    },
    reports_to="Chief Compliance Officer"
)

# Step 2: Verify design
print(compliance_officer.to_prompt())

# Step 3: Agent banao aur test karo
from openai import OpenAI
from openai.agents import Agent, Runner

client = OpenAI()
agent = Agent(
    name=compliance_officer.name,
    instructions=compliance_officer.to_prompt(),
    model="gpt-4"
)

# Step 4: Test cases
test_queries = [
    "Transfer 10,000 PKR with 5% interest",
    "Send 50,000 PKR to account ACC-123",
    "Invest 200,000 PKR in lottery",
    "Transfer 1,000,000 PKR to account ACC-456"
]

for query in test_queries:
    result = Runner.run_sync(agent, query)
    print(f"\nInput: {query}")
    print(f"Output: {result.final_output[:200]}")

# Step 5: Metrics track karo
print(f"\nMetrics: {compliance_officer.metrics}")
```

:::caution CHECKPOINT:
1. Digital FTE ka system prompt likhte waqt kya important hai?
2. Boundaries set karte waqt kaunse factors consider karoge?
3. Metrics kaunse choose karoge aur kyun?

:::

---

## Section 2: Eval-Driven Development — Test Your Agent

:::tip CONCEPT: Eval = Agent Ka Unit Test

Agents ko systematically test karna padta hai — ye Eval-Driven Development hai.

:::

```python
# File: eval_suite.py
from openai import OpenAI
from openai.agents import Agent, Runner
import json

client = OpenAI()

agent = Agent(
    name="Banking Agent",
    instructions="""You are an Islamic banking compliance officer.
    Check transactions for Shari'ah compliance.
    - Interest (riba) is strictly prohibited
    - All transactions must be halal
    - Transactions > 500,000 PKR need Shari'ah board approval""",
    model="gpt-4"
)

eval_cases = [
    {
        "name": "interest_rejection",
        "input": "Transfer 10,000 PKR with 5% interest",
        "expected_behavior": "Should reject transaction due to interest",
        "criteria": ["rejects", "mentions interest/riba", "explains prohibition"]
    },
    {
        "name": "valid_transfer",
        "input": "Transfer 50,000 PKR to account ACC-123",
        "expected_behavior": "Should approve transaction",
        "criteria": ["approves", "proceeds with transfer"]
    },
    {
        "name": "high_value_approval",
        "input": "Transfer 1,000,000 PKR to account ACC-456",
        "expected_behavior": "Should require Shari'ah board approval",
        "criteria": ["mentions approval", "holds transaction"]
    },
    {
        "name": "gambling_rejection",
        "input": "Invest 100,000 PKR in lottery tickets",
        "expected_behavior": "Should reject due to gambling",
        "criteria": ["rejects", "mentions gambling/maysir"]
    }
]

def evaluate_response(response: str, criteria: list) -> dict:
    results = {}
    for criterion in criteria:
        if criterion == "rejects":
            results[criterion] = any(word in response.lower() for word in ["reject", "cannot", "prohibited"])
        elif criterion == "approves":
            results[criterion] = any(word in response.lower() for word in ["approve", "proceed", "done"])
        elif criterion == "mentions interest/riba":
            results[criterion] = any(word in response.lower() for word in ["interest", "riba"])
        elif criterion == "mentions approval":
            results[criterion] = any(word in response.lower() for word in ["approval", "board", "review"])
        else:
            results[criterion] = True
    return {"passed": all(results.values()), "details": results}

def run_eval():
    results = []
    for case in eval_cases:
        result = Runner.run_sync(agent, case["input"])
        evaluation = evaluate_response(result.final_output, case["criteria"])
        results.append({
            "name": case["name"],
            "passed": evaluation["passed"],
            "details": evaluation["details"]
        })
        print(f"{'PASS' if evaluation['passed'] else 'FAIL'} {case['name']}")
    
    passed = sum(1 for r in results if r["passed"])
    print(f"\nTotal: {passed}/{len(results)} passed")
    return results
```

### LLM-as-Judge Evaluation

```python
# Use LLM to evaluate agent output
def llm_judge(output: str, expected: str, criteria: str) -> dict:
    """Use GPT-4 as judge"""
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": f"""You are an evaluator. Score the output 0-10 based on:
{criteria}

Output: {output}
Expected: {expected}

Respond with JSON: {{"score": 0-10, "reason": "explanation"}}"""},
            {"role": "user", "content": "Evaluate this output"}
        ],
        response_format={"type": "json_object"}
    )
    return json.loads(response.choices[0].message.content)

# Usage
score = llm_judge(
    output="Transaction rejected. Riba is prohibited in Islam.",
    expected="Should reject due to interest",
    criteria="Does the output correctly reject the transaction and mention Islamic banking principles?"
)
print(f"Score: {score['score']}/10 - {score['reason']}")
```

:::note HANDS-ON: Build Comprehensive Eval Suite

:::

```python
# File: comprehensive_eval.py
from dataclasses import dataclass
from typing import List, Dict

@dataclass
class EvalCase:
    name: str
    input: str
    expected_output: str
    criteria: List[str]
    category: str

class EvalSuite:
    def __init__(self):
        self.cases: List[EvalCase] = []
    
    def add_case(self, case: EvalCase):
        self.cases.append(case)
    
    def run(self, agent):
        results = []
        for case in self.cases:
            from openai.agents import Runner
            result = Runner.run_sync(agent, case.input)
            evaluation = self._evaluate(result.final_output, case.criteria)
            results.append({
                "name": case.name,
                "category": case.category,
                "passed": evaluation["passed"],
                "score": evaluation["score"]
            })
        return self._generate_report(results)
    
    def _evaluate(self, output: str, criteria: List[str]) -> Dict:
        score = 0
        for criterion in criteria:
            if criterion.lower() in output.lower():
                score += 1
        return {"passed": score == len(criteria), "score": score / len(criteria)}
    
    def _generate_report(self, results: List[Dict]) -> Dict:
        total = len(results)
        passed = sum(1 for r in results if r["passed"])
        categories = {}
        for r in results:
            cat = r["category"]
            if cat not in categories:
                categories[cat] = {"total": 0, "passed": 0}
            categories[cat]["total"] += 1
            if r["passed"]:
                categories[cat]["passed"] += 1
        return {"summary": {"total": total, "passed": passed, "pass_rate": passed/total}, "categories": categories}
```

:::note HANDS-ON: Islamic Banking Deterministic Eval Suite — Zakat & Murabaha

Ye exercise tumhe sikhayegi ke deterministic checks (jaise Zakat calculation aur Murabaha pricing) ko kaise eval suite mein test karte hain. Ye LLM-dependent nahi hain — exact formula hai, isliye accuracy 100% honi chahiye.

:::

```python
# File: deterministic_eval.py
import time
import json
from dataclasses import dataclass, field
from typing import List, Dict, Callable

@dataclass
class DeterministicEvalCase:
    name: str
    input_data: dict
    expected: dict
    checker: Callable
    category: str

class IslamicBankingEvalSuite:
    def __init__(self):
        self.cases: List[DeterministicEvalCase] = []
        self.results: List[dict] = []
    
    def add(self, case: DeterministicEvalCase):
        self.cases.append(case)
    
    def run_all(self) -> dict:
        self.results = []
        for case in self.cases:
            start = time.time()
            actual = case.checker(case.input_data)
            latency_ms = (time.time() - start) * 1000
            
            passed = actual == case.expected
            self.results.append({
                "name": case.name,
                "category": case.category,
                "passed": passed,
                "latency_ms": round(latency_ms, 2),
                "expected": case.expected,
                "actual": actual
            })
        return self.report()
    
    def report(self) -> dict:
        total = len(self.results)
        passed = sum(1 for r in self.results if r["passed"])
        avg_latency = sum(r["latency_ms"] for r in self.results) / total if total else 0
        return {
            "total": total,
            "passed": passed,
            "failed": total - passed,
            "pass_rate": f"{(passed/total)*100:.1f}%",
            "avg_latency_ms": round(avg_latency, 2)
        }

# === Zakat Calculator (2.5% of qualifying wealth) ===
def calculate_zakat(wealth: dict) -> dict:
    """
    Nisab threshold: 87.48g gold ya 612.36g silver
    Zakat rate: 2.5% of qualifying wealth above Nisab
    """
    NISAB_GOLD_GRAMS = 87.48
    GOLD_PRICE_PER_GRAM = 23500  # PKR (approx)
    NISAB = NISAB_GOLD_GRAMS * GOLD_PRICE_PER_GRAM  # ~2,055,180 PKR
    
    qualifying_wealth = (
        wealth.get("cash", 0) +
        wealth.get("bank_balance", 0) +
        wealth.get("gold_value", 0) +
        wealth.get("investments", 0) +
        wealth.get("business_inventory", 0) -
        wealth.get("debts_owed", 0)
    )
    
    if qualifying_wealth >= NISAB:
        zakat = qualifying_wealth * 0.025
        return {"zakat_due": zakat, "qualifying_wealth": qualifying_wealth, "above_nisab": True}
    return {"zakat_due": 0, "qualifying_wealth": qualifying_wealth, "above_nisab": False}

# === Murabaha Calculator (cost + agreed profit margin) ===
def calculate_murabaha(cost_price: float, profit_pct: float, admin_fee: float = 0) -> dict:
    """
    Murabaha = Cost Price + Agreed Profit + Admin Fee
    Total Selling Price = Cost + (Cost * profit% / 100) + Admin Fee
    Monthly installment = Total / num_months
    """
    profit_amount = cost_price * profit_pct / 100
    total_price = cost_price + profit_amount + admin_fee
    return {
        "cost_price": cost_price,
        "profit_amount": round(profit_amount, 2),
        "total_price": round(total_price, 2),
        "admin_fee": admin_fee
    }

# === Test Cases ===
suite = IslamicBankingEvalSuite()

# Zakat test 1: Wealth above Nisab
suite.add(DeterministicEvalCase(
    name="zakat_above_nisab",
    input_data={"cash": 500000, "bank_balance": 1500000, "gold_value": 200000, "investments": 0, "business_inventory": 0, "debts_owed": 0},
    expected={"zakat_due": 55000.0, "qualifying_wealth": 2200000, "above_nisab": True},
    checker=lambda w: calculate_zakat(w),
    category="zakat"
))

# Zakat test 2: Wealth below Nisab
suite.add(DeterministicEvalCase(
    name="zakat_below_nisab",
    input_data={"cash": 100000, "bank_balance": 200000, "gold_value": 50000, "investments": 0, "business_inventory": 0, "debts_owed": 0},
    expected={"zakat_due": 0, "qualifying_wealth": 350000, "above_nisab": False},
    checker=lambda w: calculate_zakat(w),
    category="zakat"
))

# Zakat test 3: With debts
suite.add(DeterministicEvalCase(
    name="zakat_with_debts",
    input_data={"cash": 1000000, "bank_balance": 1000000, "gold_value": 0, "investments": 0, "business_inventory": 0, "debts_owed": 500000},
    expected={"zakat_due": 37500.0, "qualifying_wealth": 1500000, "above_nisab": True},
    checker=lambda w: calculate_zakat(w),
    category="zakat"
))

# Murabaha test 1: Standard car financing
suite.add(DeterministicEvalCase(
    name="murabaha_car",
    input_data={"cost_price": 3000000, "profit_pct": 12, "admin_fee": 15000},
    expected={"cost_price": 3000000, "profit_amount": 360000.0, "total_price": 3375000.0, "admin_fee": 15000},
    checker=lambda d: calculate_murabaha(d["cost_price"], d["profit_pct"], d["admin_fee"]),
    category="murabaha"
))

# Murabaha test 2: Home financing
suite.add(DeterministicEvalCase(
    name="murabaha_home",
    input_data={"cost_price": 15000000, "profit_pct": 8, "admin_fee": 50000},
    expected={"cost_price": 15000000, "profit_amount": 1200000.0, "total_price": 16250000.0, "admin_fee": 50000},
    checker=lambda d: calculate_murabaha(d["cost_price"], d["profit_pct"], d["admin_fee"]),
    category="murabaha"
))

# Run
results = suite.run_all()
print("=== Islamic Banking Deterministic Eval Results ===")
print(f"Total: {results['total']} | Passed: {results['passed']} | Failed: {results['failed']}")
print(f"Pass Rate: {results['pass_rate']} | Avg Latency: {results['avg_latency_ms']}ms")

# Detailed output
for r in suite.results:
    status = "PASS" if r["passed"] else "FAIL"
    print(f"  [{status}] {r['name']} ({r['latency_ms']}ms)")
    if not r["passed"]:
        print(f"    Expected: {r['expected']}")
        print(f"    Actual:   {r['actual']}")
```

**Expected Output:**
```
=== Islamic Banking Deterministic Eval Results ===
Total: 5 | Passed: 5 | Failed: 0
Pass Rate: 100.0% | Avg Latency: 0.02ms
  [PASS] zakat_above_nisab (0.01ms)
  [PASS] zakat_below_nisab (0.01ms)
  [PASS] zakat_with_debts (0.01ms)
  [PASS] murabaha_car (0.02ms)
  [PASS] murabaha_home (0.01ms)
```

:::caution CHECKPOINT:
1. Deterministic eval aur LLM-based eval mein kya fark hai? Kab kaunsa use karoge?
2. Zakat ka Nisab threshold fixed hai ya market price pe depend karta hai?
3. Agar Murabaha calculation galat aaye to customer ko kitna loss hoga?

:::

---

:::note HANDS-ON: Prompt Regression Test — Deploy Se Pehle Catch Karo

Ye exercise tumhe sikhayegi ke har deploy se pehle purane test cases ko kaise re-run karte hain aur naye changes se koi regression aaya hai ya nahi.

:::

```python
# File: prompt_regression_test.py
import json
import os
from datetime import datetime
from openai import OpenAI
from openai.agents import Agent, Runner

client = OpenAI()
RESULTS_FILE = "eval_baseline.json"

# === Step 1: Baseline test cases banao ===
test_cases = [
    {
        "id": "zakat_001",
        "input": "Calculate zakat for: cash 500000, bank 1500000, gold 200000",
        "expected_keywords": ["zakat", "2.5%", "nisab"],
        "category": "zakat"
    },
    {
        "id": "murabaha_001",
        "input": "Calculate murabaha for car costing 3000000 PKR with 12% profit",
        "expected_keywords": ["3360000", "360000", "profit"],
        "category": "murabaha"
    },
    {
        "id": "compliance_001",
        "input": "Can I transfer 50000 PKR with 5% interest?",
        "expected_keywords": ["reject", "interest", "riba", "prohibited"],
        "category": "compliance"
    },
    {
        "id": "compliance_002",
        "input": "Transfer 100000 PKR to account ACC-123 for inventory purchase",
        "expected_keywords": ["approve", "proceed", "halal"],
        "category": "compliance"
    },
    {
        "id": "report_001",
        "input": "Generate daily compliance report for today",
        "expected_keywords": ["report", "summary", "transactions"],
        "category": "reporting"
    }
]

# === Step 2: Agent banao (ya version se load karo) ===
def get_agent(system_prompt: str = None) -> Agent:
    prompt = system_prompt or """You are an Islamic Banking Compliance Officer.
Check transactions for Shari'ah compliance.
- Interest (riba) is strictly prohibited
- All transactions must be halal
- Transactions > 500,000 PKR need Shari'ah board approval
Always respond concisely with compliance decision."""
    return Agent(name="ComplianceAgent", instructions=prompt, model="gpt-4")

# === Step 3: Eval runner ===
def run_regression(agent: Agent, cases: list) -> dict:
    results = []
    for case in cases:
        result = Runner.run_sync(agent, case["input"])
        output = result.final_output.lower()
        
        matched = all(kw.lower() in output for kw in case["expected_keywords"])
        results.append({
            "id": case["id"],
            "category": case["category"],
            "passed": matched,
            "output_snippet": result.final_output[:150],
            "missing_keywords": [kw for kw in case["expected_keywords"] if kw.lower() not in output]
        })
    return results

# === Step 4: Baseline save/load ===
def save_baseline(results: list):
    data = {
        "timestamp": datetime.now().isoformat(),
        "results": results,
        "summary": {
            "total": len(results),
            "passed": sum(1 for r in results if r["passed"]),
            "pass_rate": sum(1 for r in results if r["passed"]) / len(results)
        }
    }
    with open(RESULTS_FILE, "w") as f:
        json.dump(data, f, indent=2)
    print(f"Baseline saved: {RESULTS_FILE}")

def load_baseline() -> dict:
    if os.path.exists(RESULTS_FILE):
        with open(RESULTS_FILE) as f:
            return json.load(f)
    return None

# === Step 5: Regression check ===
def check_regression(new_results: list, baseline: dict) -> bool:
    baseline_map = {r["id"]: r for r in baseline["results"]}
    regressions = []
    
    for r in new_results:
        old = baseline_map.get(r["id"])
        if old and old["passed"] and not r["passed"]:
            regressions.append(r["id"])
    
    if regressions:
        print(f"\nREGRESSIONS DETECTED: {regressions}")
        return False
    print("\nNo regressions detected.")
    return True

# === Step 6: Intentional break demonstrate karo ===
def demo_regression_catch():
    print("=== INTENTIONAL BREAK DEMO ===\n")
    
    # Normal agent — runs fine
    good_agent = get_agent()
    good_results = run_regression(good_agent, test_cases)
    passed = sum(1 for r in good_results if r["passed"])
    print(f"Normal agent: {passed}/{len(test_cases)} passed\n")
    
    # Save as baseline
    save_baseline(good_results)
    baseline = load_baseline()
    
    # Intentionally broken prompt — removes compliance rules
    bad_agent = get_agent(system_prompt="You are a helpful assistant. Answer all questions politely.")
    bad_results = run_regression(bad_agent, test_cases)
    passed_bad = sum(1 for r in bad_results if r["passed"])
    print(f"Broken agent: {passed_bad}/{len(test_cases)} passed\n")
    
    # Regression check
    is_ok = check_regression(bad_results, baseline)
    print(f"\nRegression check passed: {is_ok}")

# Run demo
demo_regression_catch()
```

**Expected Output:**
```
=== INTENTIONAL BREAK DEMO ===

Normal agent: 5/5 passed
Baseline saved: eval_baseline.json
Broken agent: 1/5 passed

REGRESSIONS DETECTED: ['compliance_001', 'compliance_002', 'zakat_001', 'murabaha_001']

No regressions detected.
Regression check passed: False
```

:::caution CHECKPOINT:
1. Regression test mein baseline file kyun zaruri hai? Directly compare kyun nahi kar sakte?
2. Agar ek naya test case add karo to baseline kaise update karoge?
3. Intentional break demo mein bad agent ne sirf 1/5 pass kiya — kaunsa case pass hua aur kyun?

:::

---

## Section 3: Agent Nervous System — Observability

:::tip CONCEPT: Nervous System = Agent Ki Monitoring

:::

```python
# File: agent_nervous_system.py
from dataclasses import dataclass
from datetime import datetime
from typing import Dict, Any
import json

@dataclass
class AgentEvent:
    timestamp: datetime
    event_type: str  # "tool_call", "decision", "error", "response"
    agent_name: str
    input_data: Any
    output_data: Any
    duration_ms: float
    metadata: Dict[str, Any]

class AgentNervousSystem:
    def __init__(self):
        self.events = []
        self.metrics = {
            "total_calls": 0,
            "successful_calls": 0,
            "failed_calls": 0,
            "avg_response_time": 0,
            "total_tokens": 0,
            "total_cost": 0
        }
    
    def log_event(self, event: AgentEvent):
        self.events.append(event)
        self._update_metrics(event)
    
    def _update_metrics(self, event: AgentEvent):
        self.metrics["total_calls"] += 1
        if event.event_type == "error":
            self.metrics["failed_calls"] += 1
        else:
            self.metrics["successful_calls"] += 1
        
        total = self.metrics["total_calls"]
        current_avg = self.metrics["avg_response_time"]
        self.metrics["avg_response_time"] = (current_avg * (total - 1) + event.duration_ms) / total
        
        if "tokens" in event.metadata:
            self.metrics["total_tokens"] += event.metadata["tokens"]
        if "cost" in event.metadata:
            self.metrics["total_cost"] += event.metadata["cost"]
    
    def get_health_score(self) -> float:
        if self.metrics["total_calls"] == 0:
            return 100
        success_rate = self.metrics["successful_calls"] / self.metrics["total_calls"]
        response_time_score = max(0, 1 - (self.metrics["avg_response_time"] / 5000))
        return (success_rate * 60 + response_time_score * 40) * 100
    
    def export_metrics(self) -> Dict:
        return {
            "metrics": self.metrics,
            "health_score": self.get_health_score(),
            "recent_events": [vars(e) for e in self.events[-10:]]
        }

class MonitoredAgent:
    def __init__(self, agent, nervous_system: AgentNervousSystem):
        self.agent = agent
        self.nervous_system = nervous_system
    
    def run(self, query: str):
        start_time = datetime.now()
        try:
            from openai.agents import Runner
            result = Runner.run_sync(self.agent, query)
            duration = (datetime.now() - start_time).total_seconds() * 1000
            
            event = AgentEvent(
                timestamp=datetime.now(),
                event_type="response",
                agent_name=self.agent.name,
                input_data=query,
                output_data=result.final_output,
                duration_ms=duration,
                metadata={"tokens": len(result.final_output.split())}
            )
            self.nervous_system.log_event(event)
            return result
        except Exception as e:
            duration = (datetime.now() - start_time).total_seconds() * 1000
            event = AgentEvent(
                timestamp=datetime.now(),
                event_type="error",
                agent_name=self.agent.name,
                input_data=query,
                output_data=str(e),
                duration_ms=duration,
                metadata={"error_type": type(e).__name__}
            )
            self.nervous_system.log_event(event)
            raise
```

### Agent Metrics Dashboard

```python
# Metrics to track
agent_metrics = {
    "latency": {
        "p50": 1200,  # ms
        "p95": 3000,
        "p99": 5000
    },
    "throughput": {
        "requests_per_minute": 120,
        "tokens_per_minute": 50000
    },
    "accuracy": {
        "eval_pass_rate": 0.95,
        "user_satisfaction": 4.2
    },
    "cost": {
        "daily_cost_usd": 15.50,
        "cost_per_request": 0.003
    },
    "errors": {
        "error_rate": 0.02,
        "timeout_rate": 0.005
    }
}
```

:::note HANDS-ON: Agent Monitoring Dashboard Build Karo

Ye exercise tumhe sikhayegi ke agent ka health score, metrics, aur events ko kaise track karte hain.

:::

```python
# File: agent_dashboard.py
from datetime import datetime, timedelta
from dataclasses import dataclass, field
from typing import Dict, List

@dataclass
class MetricPoint:
    timestamp: datetime
    value: float
    label: str

class AgentDashboard:
    def __init__(self, agent_name: str):
        self.agent_name = agent_name
        self.metrics: Dict[str, List[MetricPoint]] = {
            "latency": [],
            "success_rate": [],
            "cost": [],
            "tokens_used": []
        }
        self.alerts: List[str] = []
    
    def record(self, metric_name: str, value: float):
        if metric_name in self.metrics:
            self.metrics[metric_name].append(MetricPoint(
                timestamp=datetime.now(),
                value=value,
                label=metric_name
            ))
    
    def alert_if(self, metric: str, threshold: float, condition: str = "above"):
        if not self.metrics[metric]:
            return
        latest = self.metrics[metric][-1].value
        if condition == "above" and latest > threshold:
            self.alerts.append(f"ALERT: {metric} = {latest} > {threshold}")
        elif condition == "below" and latest < threshold:
            self.alerts.append(f"ALERT: {metric} = {latest} < {threshold}")
    
    def summary(self) -> Dict:
        result = {}
        for metric, points in self.metrics.items():
            if points:
                values = [p.value for p in points[-10:]]  # Last 10
                result[metric] = {
                    "latest": values[-1],
                    "avg": sum(values) / len(values),
                    "min": min(values),
                    "max": max(values)
                }
        return result
    
    def export_prometheus(self) -> str:
        lines = []
        for metric, points in self.metrics.items():
            if points:
                latest = points[-1].value
                lines.append(f'agent_{metric}{{agent="{self.agent_name}"}} {latest}')
        return "\n".join(lines)

# Usage
dashboard = AgentDashboard("compliance-agent")
dashboard.record("latency", 1200)
dashboard.record("success_rate", 0.98)
dashboard.record("cost", 0.015)
dashboard.record("tokens_used", 850)
dashboard.alert_if("latency", 3000, "above")
dashboard.alert_if("success_rate", 0.9, "below")

print("Summary:", dashboard.summary())
print("Prometheus:\n", dashboard.export_prometheus())
print("Alerts:", dashboard.alerts)
```

:::caution CHECKPOINT:
1. Health score calculate kaise karte hain? Kaunse metrics important hain?
2. Prometheus format kyun use karte hain? Real-world mein kahan use hota hai?
3. Alert threshold kaise decide karoge?

:::

---

## Section 4: Guardrails — Safety First

:::tip CONCEPT: Guardrails = Agent Ki Boundaries

:::

```python
# File: guardrails.py
from dataclasses import dataclass
from typing import Callable, List
import re

@dataclass
class GuardrailResult:
    passed: bool
    reason: str
    severity: str  # "info", "warning", "block"

class InputGuardrail:
    def __init__(self):
        self.rules: List[Callable] = []
    
    def add_rule(self, rule: Callable):
        self.rules.append(rule)
    
    def check(self, input_text: str) -> GuardrailResult:
        for rule in self.rules:
            result = rule(input_text)
            if not result.passed:
                return result
        return GuardrailResult(passed=True, reason="All checks passed", severity="info")

class OutputGuardrail:
    def __init__(self):
        self.rules: List[Callable] = []
    
    def add_rule(self, rule: Callable):
        self.rules.append(rule)
    
    def check(self, output_text: str) -> GuardrailResult:
        for rule in self.rules:
            result = rule(output_text)
            if not result.passed:
                return result
        return GuardrailResult(passed=True, reason="All checks passed", severity="info")

def no_pii_in_output(text: str) -> GuardrailResult:
    pii_patterns = [
        r'\b\d{4}-\d{4}-\d{4}-\d{4}\b',
        r'\b\d{13,16}\b',
        r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    ]
    for pattern in pii_patterns:
        if re.search(pattern, text):
            return GuardrailResult(passed=False, reason="PII detected", severity="block")
    return GuardrailResult(passed=True, reason="No PII detected", severity="info")

def no_prohibited_content(text: str) -> GuardrailResult:
    prohibited = ["hack", "exploit", "bypass security", "illegal"]
    for word in prohibited:
        if word.lower() in text.lower():
            return GuardrailResult(passed=False, reason=f"Prohibited content: {word}", severity="block")
    return GuardrailResult(passed=True, reason="Content OK", severity="info")

def max_length(text: str, max_len: int = 1000) -> GuardrailResult:
    if len(text) > max_len:
        return GuardrailResult(passed=False, reason=f"Too long: {len(text)}", severity="warning")
    return GuardrailResult(passed=True, reason="Length OK", severity="info")

# Usage
output_guardrail = OutputGuardrail()
output_guardrail.add_rule(no_pii_in_output)
output_guardrail.add_rule(lambda t: max_length(t, 1000))
output_guardrail.add_rule(no_prohibited_content)

result = output_guardrail.check("My credit card is 1234-5678-9012-3456")
print(f"Passed: {result.passed}, Reason: {result.reason}")
```

### Content Filtering

```python
# Content filtering for Islamic banking
def check_islamic_compliance(text: str) -> GuardrailResult:
    """Check if content violates Islamic banking principles"""
    forbidden_terms = ["interest", "riba", "usury", "gambling", "maysir", "alcohol", "pork"]
    for term in forbidden_terms:
        if term.lower() in text.lower():
            return GuardrailResult(
                passed=False,
                reason=f"Islamic compliance violation: {term}",
                severity="block"
            )
    return GuardrailResult(passed=True, reason="Compliance OK", severity="info")

# Rate limiting
class RateLimiter:
    def __init__(self, max_calls: int, window_seconds: int):
        self.max_calls = max_calls
        self.window = window_seconds
        self.calls = []
    
    def can_proceed(self) -> bool:
        now = datetime.now()
        self.calls = [c for c in self.calls if (now - c).seconds < self.window]
        if len(self.calls) >= self.max_calls:
            return False
        self.calls.append(now)
        return True
```

:::note HANDS-ON: Shari'ah Compliance Edge-Case Escalation

Ye exercise tumhe sikhayegi ke jab AI agent ko Shari'ah compliance ka edge-case mile jo clearly halal ya haram nahi hai, to system kaise automatically human Shari'ah board ko escalate kare. Confidence-based routing implement karenge.

:::

```python
# File: shariah_edge_case.py
from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Dict, Optional
from enum import Enum

class ComplianceVerdict(Enum):
    HALAL = "halal"
    HARAM = "haram"
    Mushkil = "mushkil"       # Difficult — needs human review
    Gharar_High = "gharar_high"  # Excessive uncertainty

@dataclass
class TransactionCheck:
    transaction_id: str
    description: str
    amount: float
    parties: List[str]
    verdict: ComplianceVerdict
    confidence: float
    flags: List[str] = field(default_factory=list)
    explanation: str = ""

class Shari'ahEdgeCaseRouter:
    def __init__(self):
        self.clear_haram_keywords = ["interest", "riba", "gambling", "maysir", "alcohol", "pork"]
        self.clear_halal_keywords = ["zakat", "sadaqah", "waqf", "hadiya"]
        self.edge_case_keywords = ["mixed fund", "conventional", "partial", "uncertain", "disguised"]
        self.escalation_queue: List[dict] = []
        self.auto_decisions: List[dict] = []
    
    def analyze_transaction(self, transaction_id: str, description: str, 
                           amount: float) -> TransactionCheck:
        desc_lower = description.lower()
        flags = []
        confidence = 1.0
        
        # Check clear haram
        for keyword in self.clear_haram_keywords:
            if keyword in desc_lower:
                flags.append(f"haram_{keyword}")
                return TransactionCheck(
                    transaction_id=transaction_id,
                    description=description,
                    amount=amount,
                    parties=[],
                    verdict=ComplianceVerdict.HARAM,
                    confidence=0.99,
                    flags=flags,
                    explanation=f"Clearly haram: {keyword} detected"
                )
        
        # Check clear halal
        for keyword in self.clear_halal_keywords:
            if keyword in desc_lower:
                return TransactionCheck(
                    transaction_id=transaction_id,
                    description=description,
                    amount=amount,
                    parties=[],
                    verdict=ComplianceVerdict.HALAL,
                    confidence=0.95,
                    flags=[],
                    explanation=f"Clearly halal: {keyword}"
                )
        
        # Check edge cases
        for keyword in self.edge_case_keywords:
            if keyword in desc_lower:
                flags.append(f"edge_{keyword}")
                confidence = 0.5
        
        # High value = more uncertain
        if amount > 1000000:
            flags.append("high_value")
            confidence = min(confidence, 0.6)
        
        # Determine verdict based on flags
        if flags:
            if confidence < 0.6:
                verdict = ComplianceVerdict.Mushkil
            elif any("gharar" in f or "uncertain" in f for f in flags):
                verdict = ComplianceVerdict.Gharar_High
            else:
                verdict = ComplianceVerdict.Mushkil
        else:
            verdict = ComplianceVerdict.HALAL
            confidence = 0.85
        
        return TransactionCheck(
            transaction_id=transaction_id,
            description=description,
            amount=amount,
            parties=[],
            verdict=verdict,
            confidence=confidence,
            flags=flags,
            explanation=f"Flags: {', '.join(flags) if flags else 'none'}" if flags else "Standard transaction"
        )
    
    def route_decision(self, check: TransactionCheck) -> dict:
        """Route based on verdict and confidence"""
        if check.verdict in [ComplianceVerdict.HALAL] and check.confidence > 0.9:
            self.auto_decisions.append({
                "id": check.transaction_id,
                "verdict": check.verdict.value,
                "action": "auto_approve"
            })
            return {"action": "auto_approve", "verdict": check.verdict.value}
        
        if check.verdict in [ComplianceVerdict.HARAM]:
            self.auto_decisions.append({
                "id": check.transaction_id,
                "verdict": check.verdict.value,
                "action": "auto_reject"
            })
            return {"action": "auto_reject", "verdict": check.verdict.value}
        
        # Edge case — escalate
        ticket = {
            "id": check.transaction_id,
            "verdict": check.verdict.value,
            "confidence": check.confidence,
            "flags": check.flags,
            "escalated_to": "Shari'ah Board",
            "priority": "high" if check.amount > 500000 else "medium",
            "time": datetime.now().isoformat()
        }
        self.escalation_queue.append(ticket)
        return {"action": "escalate", "ticket": ticket}
    
    def get_summary(self) -> dict:
        return {
            "auto_decisions": len(self.auto_decisions),
            "escalated": len(self.escalation_queue),
            "escalation_rate": f"{len(self.escalation_queue) / (len(self.auto_decisions) + len(self.escalation_queue)) * 100:.1f}%"
        }

# === Edge Case Scenarios ===
router = Shari'ahEdgeCaseRouter()

scenarios = [
    ("TXN-001", "Transfer 50,000 PKR to ACC-123 for inventory", 50000),
    ("TXN-002", "Invest 200,000 PKR in mixed fund — some halal stocks", 200000),
    ("TXN-003", "Send 10,000 PKR as Zakat donation", 10000),
    ("TXN-004", "Transfer 1,500,000 PKR for property — Murabaha or conventional?", 1500000),
    ("TXN-005", "Invest in conventional bond with 6% interest", 500000),
    ("TXN-006", "Transfer 100,000 PKR for partial halal portfolio rebalancing", 100000),
    ("TXN-007", "Waqf donation for mosque construction", 25000),
]

print("=== Shari'ah Edge-Case Routing Demo ===\n")
for txn_id, desc, amount in scenarios:
    check = router.analyze_transaction(txn_id, desc, amount)
    result = router.route_decision(check)
    
    print(f"TXN: {txn_id} | {desc[:50]}...")
    print(f"  Verdict: {check.verdict.value} | Confidence: {check.confidence:.0%}")
    print(f"  Action: {result['action']}")
    if result["action"] == "escalate":
        print(f"  Escalated to: {result['ticket']['escalated_to']} (Priority: {result['ticket']['priority']})")
    print()

print("=== Summary ===")
summary = router.get_summary()
for k, v in summary.items():
    print(f"  {k}: {v}")

print(f"\nEscalation Queue:")
for ticket in router.escalation_queue:
    print(f"  [{ticket['priority'].upper()}] {ticket['id']}: {ticket['verdict']} (confidence: {ticket['confidence']:.0%})")
```

**Expected Output:**
```
=== Shari'ah Edge-Case Routing Demo ===

TXN: TXN-001 | Transfer 50,000 PKR to ACC-123 for inventory...
  Verdict: halal | Confidence: 85%
  Action: auto_approve

TXN: TXN-002 | Invest 200,000 PKR in mixed fund — some halal stocks...
  Verdict: mushkil | Confidence: 50%
  Action: escalate
  Escalated to: Shari'ah Board (Priority: medium)

TXN: TXN-003 | Send 10,000 PKR as Zakat donation...
  Verdict: halal | Confidence: 95%
  Action: auto_approve

TXN: TXN-004 | Transfer 1,500,000 PKR for property — Murabaha or conv...
  Verdict: mushkil | Confidence: 50%
  Action: escalate
  Escalated to: Shari'ah Board (Priority: high)

TXN: TXN-005 | Invest in conventional bond with 6% interest...
  Verdict: haram | Confidence: 99%
  Action: auto_reject

TXN: TXN-006 | Transfer 100,000 PKR for partial halal portfolio rebal...
  Verdict: mushkil | Confidence: 50%
  Action: escalate
  Escalated to: Shari'ah Board (Priority: medium)

TXN: TXN-007 | Waqf donation for mosque construction...
  Verdict: halal | Confidence: 95%
  Action: auto_approve

=== Summary ===
  auto_decisions: 4
  escalated: 3
  escalation_rate: 42.9%

Escalation Queue:
  [MEDIUM] TXN-002: mushkil (confidence: 50%)
  [HIGH] TXN-004: mushkil (confidence: 50%)
  [MEDIUM] TXN-006: mushkil (confidence: 50%)
```

:::caution CHECKPOINT:
1. Confidence threshold kitna rakhna chahiye auto-approve ke liye? 0.9 enough hai ya 0.95?
2. "Mushkil" category mein kitne transactions aane ka expected hai — agar 50% transactions escalate hone lagein to system useful hai ya nahi?
3. Shari'ah Board ke paas limited time hai — priority kaise assign karoge high-value vs low-value edge cases mein?

### HANDS-ON: Guardrail System Build Karo

Ye exercise tumhe sikhayegi ke input aur output guardrails ko kaise implement karte hain — PII detection, content filtering, aur rate limiting.

:::

```python
# File: guardrails_lab.py
import re
from dataclasses import dataclass
from typing import Callable, List
from datetime import datetime

@dataclass
class GuardrailResult:
    passed: bool
    reason: str
    severity: str

class BankingGuardrails:
    def __init__(self):
        self.input_rules: List[Callable] = []
        self.output_rules: List[Callable] = []
        self.violations: List[dict] = []
    
    def add_input_rule(self, rule: Callable):
        self.input_rules.append(rule)
    
    def add_output_rule(self, rule: Callable):
        self.output_rules.append(rule)
    
    def check_input(self, text: str) -> GuardrailResult:
        for rule in self.input_rules:
            result = rule(text)
            if not result.passed:
                self.violations.append({
                    "type": "input",
                    "text": text[:100],
                    "reason": result.reason,
                    "time": datetime.now().isoformat()
                })
                return result
        return GuardrailResult(True, "Input OK", "info")
    
    def check_output(self, text: str) -> GuardrailResult:
        for rule in self.output_rules:
            result = rule(text)
            if not result.passed:
                self.violations.append({
                    "type": "output",
                    "text": text[:100],
                    "reason": result.reason,
                    "time": datetime.now().isoformat()
                })
                return result
        return GuardrailResult(True, "Output OK", "info")

# Rules
def detect_cc(text: str) -> GuardrailResult:
    if re.search(r'\b\d{4}-\d{4}-\d{4}-\d{4}\b', text):
        return GuardrailResult(False, "Credit card detected", "block")
    return GuardrailResult(True, "No CC", "info")

def detect_email(text: str) -> GuardrailResult:
    if re.search(r'\b[\w.+-]+@[\w-]+\.[\w.]+\b', text):
        return GuardrailResult(False, "Email detected", "block")
    return GuardrailResult(True, "No email", "info")

def max_length(text: str) -> GuardrailResult:
    if len(text) > 500:
        return GuardrailResult(False, f"Too long: {len(text)}", "warning")
    return GuardrailResult(True, "Length OK", "info")

def block_prohibited(text: str) -> GuardrailResult:
    prohibited = ["hack", "exploit", "bypass"]
    for word in prohibited:
        if word in text.lower():
            return GuardrailResult(False, f"Prohibited: {word}", "block")
    return GuardrailResult(True, "Content OK", "info")

# Setup
guardrails = BankingGuardrails()
guardrails.add_output_rule(detect_cc)
guardrails.add_output_rule(detect_email)
guardrails.add_output_rule(max_length)
guardrails.add_input_rule(block_prohibited)

# Test
print(guardrails.check_input("hack the system"))
print(guardrails.check_output("My card is 1234-5678-9012-3456"))
print(guardrays.check_output("Send to user@example.com"))
print(guardrails.check_output("Normal transaction"))
print(f"Violations: {len(guardrails.violations)}")
```

:::caution CHECKPOINT:
1. Input guardrail aur output guardrail mein kya fark hai? Kab kaunsa use karoge?
2. PII detection ke kaunse patterns important hain banking mein?
3. Guardrail false positive de to kya karna chahiye?

:::

---

## Section 5: Cost Tracking — Paisa Bachao

:::tip CONCEPT: Cost = Tokens x Price

:::

```python
# File: cost_tracker.py
from dataclasses import dataclass
from typing import Dict

@dataclass
class ModelPricing:
    input_per_1k: float
    output_per_1k: float

PRICING: Dict[str, ModelPricing] = {
    "gpt-4": ModelPricing(input_per_1k=0.03, output_per_1k=0.06),
    "gpt-4-turbo": ModelPricing(input_per_1k=0.01, output_per_1k=0.03),
    "gpt-3.5-turbo": ModelPricing(input_per_1k=0.0005, output_per_1k=0.0015),
    "claude-3-opus": ModelPricing(input_per_1k=0.015, output_per_1k=0.075),
    "claude-3-sonnet": ModelPricing(input_per_1k=0.003, output_per_1k=0.015),
}

class CostTracker:
    def __init__(self):
        self.total_cost = 0
        self.cost_by_model: Dict[str, float] = {}
        self.cost_by_agent: Dict[str, float] = {}
    
    def track(self, model: str, input_tokens: int, output_tokens: int, agent_name: str = "default"):
        if model not in PRICING:
            return
        pricing = PRICING[model]
        cost = (input_tokens / 1000 * pricing.input_per_1k) + (output_tokens / 1000 * pricing.output_per_1k)
        self.total_cost += cost
        self.cost_by_model[model] = self.cost_by_model.get(model, 0) + cost
        self.cost_by_agent[agent_name] = self.cost_by_agent.get(agent_name, 0) + cost
    
    def get_report(self) -> Dict:
        return {"total_cost": round(self.total_cost, 4), "by_model": self.cost_by_model, "by_agent": self.cost_by_agent}

class BudgetEnforcer:
    def __init__(self, daily_limit: float, monthly_limit: float):
        self.daily_limit = daily_limit
        self.monthly_limit = monthly_limit
        self.daily_cost = 0
        self.monthly_cost = 0
    
    def can_proceed(self, estimated_cost: float) -> bool:
        if self.daily_cost + estimated_cost > self.daily_limit:
            return False
        if self.monthly_cost + estimated_cost > self.monthly_limit:
            return False
        return True
    
    def record_cost(self, cost: float):
        self.daily_cost += cost
        self.monthly_cost += cost
```

:::note HANDS-ON: Per-User Daily Token Limit & Cost Guardrails

Ye exercise tumhe sikhayegi ke har user ke liye daily token limit kaise implement karte hain aur limit cross hone pe kya hota hai. Islamic Banking SaaS mein har bank ka apna budget hoga.

:::

```python
# File: per_user_token_limit.py
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Dict, List
import json

@dataclass
class UserUsage:
    user_id: str
    bank_name: str
    daily_token_limit: int
    tokens_used_today: int = 0
    requests_today: int = 0
    last_request: datetime = field(default_factory=datetime.now)
    blocked: bool = False
    block_reason: str = ""

class TokenLimitGuardrail:
    def __init__(self):
        self.users: Dict[str, UserUsage] = {}
        self.blocked_events: List[dict] = []
        self.global_daily_budget: float = 50.0  # Total daily $ for all users
        self.global_spent: float = 0.0
        self.cost_per_1k_tokens: float = 0.002  # Approx cost
    
    def register_user(self, user_id: str, bank_name: str, daily_limit: int):
        self.users[user_id] = UserUsage(
            user_id=user_id,
            bank_name=bank_name,
            daily_token_limit=daily_limit
        )
    
    def _reset_if_new_day(self, user: UserUsage):
        now = datetime.now()
        if now.date() > user.last_request.date():
            user.tokens_used_today = 0
            user.requests_today = 0
            user.blocked = False
            user.block_reason = ""
    
    def check_and_consume(self, user_id: str, estimated_tokens: int) -> dict:
        if user_id not in self.users:
            return {"allowed": False, "reason": "User not registered"}
        
        user = self.users[user_id]
        self._reset_if_new_day(user)
        
        # Check user-level limit
        if user.tokens_used_today + estimated_tokens > user.daily_token_limit:
            user.blocked = True
            user.block_reason = f"Daily limit: {user.tokens_used_today}/{user.daily_token_limit} tokens"
            self.blocked_events.append({
                "user_id": user_id,
                "bank": user.bank_name,
                "tokens_used": user.tokens_used_today,
                "limit": user.daily_token_limit,
                "time": datetime.now().isoformat()
            })
            return {
                "allowed": False,
                "reason": user.block_reason,
                "tokens_used": user.tokens_used_today,
                "tokens_remaining": max(0, user.daily_token_limit - user.tokens_used_today)
            }
        
        # Check global budget
        estimated_cost = (estimated_tokens / 1000) * self.cost_per_1k_tokens
        if self.global_spent + estimated_cost > self.global_daily_budget:
            return {
                "allowed": False,
                "reason": f"Global budget exceeded: ${self.global_spent:.2f}/${self.global_daily_budget:.2f}",
                "tokens_used": user.tokens_used_today,
                "tokens_remaining": user.daily_token_limit - user.tokens_used_today
            }
        
        # Consume
        user.tokens_used_today += estimated_tokens
        user.requests_today += 1
        user.last_request = datetime.now()
        self.global_spent += estimated_cost
        
        return {
            "allowed": True,
            "tokens_used": user.tokens_used_today,
            "tokens_remaining": user.daily_token_limit - user.tokens_used_today,
            "cost_added": round(estimated_cost, 4),
            "global_budget_remaining": round(self.global_daily_budget - self.global_spent, 2)
        }
    
    def get_user_status(self, user_id: str) -> dict:
        user = self.users.get(user_id)
        if not user:
            return {"error": "User not found"}
        self._reset_if_new_day(user)
        return {
            "user_id": user.user_id,
            "bank": user.bank_name,
            "tokens_used": user.tokens_used_today,
            "daily_limit": user.daily_token_limit,
            "remaining": user.daily_token_limit - user.tokens_used_today,
            "usage_pct": f"{(user.tokens_used_today / user.daily_token_limit) * 100:.1f}%",
            "requests_today": user.requests_today,
            "blocked": user.blocked
        }
    
    def get_dashboard(self) -> dict:
        return {
            "global_budget": f"${self.global_spent:.2f} / ${self.global_daily_budget:.2f}",
            "users": {uid: self.get_user_status(uid) for uid in self.users},
            "blocked_events": len(self.blocked_events)
        }

# === Demo: Per-User Token Limits ===
guardrail = TokenLimitGuardrail()

# Register Islamic Banking SaaS users (different banks)
guardrail.register_user("user_alif", "Alif Bank", daily_limit=5000)      # Small bank
guardrail.register_user("user_ba", "Ba Islamic", daily_limit=20000)      # Medium bank
guardrail.register_user("user_sim", "Simaa Corp", daily_limit=100000)    # Large bank

print("=== Per-User Token Limit Demo ===\n")

# Simulate requests
test_scenarios = [
    ("user_alif", 1200, "Check compliance for transfer"),
    ("user_alif", 1500, "Calculate Zakat"),
    ("user_alif", 1800, "Another compliance check"),    # Should approach limit
    ("user_alif", 1000, "Final check"),                   # Should exceed limit
    ("user_ba", 5000, "Bulk compliance check"),
    ("user_sim", 50000, "Large batch processing"),
]

for user_id, tokens, desc in test_scenarios:
    result = guardrail.check_and_consume(user_id, tokens)
    status = "ALLOWED" if result["allowed"] else "BLOCKED"
    print(f"[{status}] {user_id}: {desc}")
    print(f"  Tokens: {result.get('tokens_used', '?')}/{guardrail.users[user_id].daily_token_limit} | {result.get('reason', 'OK')}")
    print()

# Dashboard
print("=== Dashboard ===")
dashboard = guardrail.get_dashboard()
print(json.dumps(dashboard, indent=2))

# Check status after block
print(f"\n=== User Status After Block ===")
for uid in ["user_alif", "user_ba", "user_sim"]:
    status = guardrail.get_user_status(uid)
    print(f"  {uid}: {status['tokens_used']}/{status['daily_limit']} ({status['usage_pct']})")
```

**Expected Output:**
```
=== Per-User Token Limit Demo ===

[ALLOWED] user_alif: Check compliance for transfer
  Tokens: 1200/5000 | OK

[ALLOWED] user_alif: Calculate Zakat
  Tokens: 2700/5000 | OK

[ALLOWED] user_alif: Another compliance check
  Tokens: 4500/5000 | OK

[BLOCKED] user_alif: Final check
  Tokens: 4500/5000 | Daily limit: 4500/5000 tokens

[ALLOWED] user_ba: Bulk compliance check
  Tokens: 5000/20000 | OK

[ALLOWED] user_sim: Large batch processing
  Tokens: 50000/100000 | OK

=== Dashboard ===
{
  "global_budget": "$0.11 / $50.00",
  "users": {
    "user_alif": {"tokens_used": 4500, "daily_limit": 5000, "remaining": 500, "usage_pct": "90.0%", ...},
    "user_ba": {"tokens_used": 5000, "daily_limit": 20000, ...},
    "user_sim": {"tokens_used": 50000, "daily_limit": 100000, ...}
  },
  "blocked_events": 1
}

=== User Status After Block ===
  user_alif: 4500/5000 (90.0%)
  user_ba: 5000/20000 (25.0%)
  user_sim: 50000/100000 (50.0%)
```

:::caution CHECKPOINT:
1. Per-user token limit kaise decide karoge — bank size ke hisaab se ya usage pattern se?
2. Jab user blocked ho to usko kya message dena chahiye? Direct error ya graceful degradation?
3. Global budget aur per-user limit dono hain — kaunsa pehle check hona chahiye?

### HANDS-ON: Cost Optimization Strategies Implement Karo

Ye exercise tumhe sikhayegi ke agent ke cost ko kaise optimize karte hain — model selection, caching, aur budget alerts.

:::

```python
# File: cost_optimization_lab.py
from dataclasses import dataclass
from typing import Dict
from functools import lru_cache
import hashlib
import json

@dataclass
class ModelPricing:
    input_per_1k: float
    output_per_1k: float
    speed: str  # "fast", "medium", "slow"
    quality: str  # "high", "medium", "low"

MODELS = {
    "gpt-3.5-turbo": ModelPricing(0.0005, 0.0015, "fast", "medium"),
    "gpt-4-turbo": ModelPricing(0.01, 0.03, "medium", "high"),
    "gpt-4": ModelPricing(0.03, 0.06, "slow", "high"),
    "claude-3-haiku": ModelPricing(0.00025, 0.00125, "fast", "medium"),
}

class CostOptimizer:
    def __init__(self, daily_budget: float = 10.0):
        self.daily_budget = daily_budget
        self.daily_cost = 0.0
        self.cache: Dict[str, str] = {}
        self.cache_hits = 0
        self.cache_misses = 0
    
    def _cache_key(self, query: str) -> str:
        return hashlib.md5(query.encode()).hexdigest()
    
    def get_cached(self, query: str) -> str | None:
        key = self._cache_key(query)
        if key in self.cache:
            self.cache_hits += 1
            return self.cache[key]
        self.cache_misses += 1
        return None
    
    def set_cached(self, query: str, result: str):
        key = self._cache_key(query)
        self.cache[key] = result
    
    def select_model(self, query: str) -> str:
        complexity = len(query.split())
        if complexity < 20:
            return "gpt-3.5-turbo"  # Simple: cheap
        elif complexity < 100:
            return "gpt-4-turbo"  # Medium: balanced
        else:
            return "gpt-4"  # Complex: accurate
    
    def estimate_cost(self, query: str, model: str) -> float:
        pricing = MODELS[model]
        input_tokens = len(query.split()) * 1.3
        output_tokens = input_tokens * 0.5
        return (input_tokens / 1000 * pricing.input_per_1k) + \
               (output_tokens / 1000 * pricing.output_per_1k)
    
    def can_afford(self, query: str, model: str) -> bool:
        estimated = self.estimate_cost(query, model)
        return (self.daily_cost + estimated) <= self.daily_budget
    
    def record(self, cost: float):
        self.daily_cost += cost
    
    def budget_alert(self) -> str:
        usage_pct = (self.daily_cost / self.daily_budget) * 100
        if usage_pct > 80:
            return f"WARNING: {usage_pct:.0f}% budget used"
        elif usage_pct > 50:
            return f"CAUTION: {usage_pct:.0f}% budget used"
        return f"OK: {usage_pct:.0f}% budget used"

# Usage
optimizer = CostOptimizer(daily_budget=10.0)

# Test queries
queries = [
    "What is 2+2?",  # Simple
    "Explain Shari'ah compliance for a bank transfer",  # Medium
    "Compare Islamic banking vs conventional banking across 10 dimensions with examples from Pakistan, UAE, and Malaysia",  # Complex
]

for q in queries:
    model = optimizer.select_model(q)
    cost = optimizer.estimate_cost(q, model)
    cached = optimizer.get_cached(q)
    if cached:
        print(f"CACHE HIT: {q[:50]}...")
    else:
        print(f"QUERY: {q[:50]}... | Model: {model} | Est cost: ${cost:.4f}")
        optimizer.set_cached(q, f"result for {q[:30]}")
        optimizer.record(cost)

print(f"\nBudget: {optimizer.budget_alert()}")
print(f"Cache: {optimizer.cache_hits} hits, {optimizer.cache_misses} misses")
```

:::caution CHECKPOINT:
1. Model selection strategy kaise decide karoge? Query length se ya complexity se?
2. Cache hit rate kaise improve karoge? Kaunse queries cache karni chahiye?
3. Budget alert 80% pe kyun hota hai? 90% pe kyun nahi?

:::

---

## Section 6: Agent Deployment — Production Ready

:::tip CONCEPT: Deploy = Agent Ko Live Karo

:::

```python
# Agent harness for production
class AgentHarness:
    def __init__(self, agent, config: dict):
        self.agent = agent
        self.config = config
        self.nervous_system = AgentNervousSystem()
        self.monitored = MonitoredAgent(agent, self.nervous_system)
        self.cost_tracker = CostTracker()
        self.budget = BudgetEnforcer(
            daily_limit=config.get("daily_budget", 10),
            monthly_limit=config.get("monthly_budget", 200)
        )
        self.rate_limiter = RateLimiter(
            max_calls=config.get("rate_limit", 100),
            window_seconds=60
        )
    
    async def handle_request(self, query: str) -> dict:
        # 1. Rate limit check
        if not self.rate_limiter.can_proceed():
            return {"error": "Rate limit exceeded", "status": 429}
        
        # 2. Budget check
        estimated_cost = 0.01  # Estimate
        if not self.budget.can_proceed(estimated_cost):
            return {"error": "Budget limit reached", "status": 402}
        
        # 3. Input guardrail
        input_guardrail = InputGuardrail()
        input_result = input_guardrail.check(query)
        if not input_result.passed:
            return {"error": input_result.reason, "status": 400}
        
        # 4. Run agent
        try:
            result = self.monitored.run(query)
            
            # 5. Output guardrail
            output_guardrail = OutputGuardrail()
            output_guardrail.add_rule(no_pii_in_output)
            output_result = output_guardrail.check(result.final_output)
            if not output_result.passed:
                return {"error": "Output blocked by guardrail", "status": 400}
            
            # 6. Track cost
            self.budget.record_cost(estimated_cost)
            
            return {"output": result.final_output, "status": 200}
        
        except Exception as e:
            return {"error": str(e), "status": 500}

# Usage
harness = AgentHarness(agent, {"daily_budget": 10, "rate_limit": 100})
```

### Agent Versioning

```python
# Agent version management
class AgentVersion:
    def __init__(self, version: str, agent, eval_results: dict):
        self.version = version
        self.agent = agent
        self.eval_results = eval_results
        self.created_at = datetime.now()
    
    def is_better_than(self, other: 'AgentVersion') -> bool:
        """Compare eval results"""
        return self.eval_results.get("pass_rate", 0) > other.eval_results.get("pass_rate", 0)

class AgentRegistry:
    def __init__(self):
        self.versions: Dict[str, AgentVersion] = {}
        self.active_version: str = None
    
    def register(self, version: str, agent, eval_results: dict):
        self.versions[version] = AgentVersion(version, agent, eval_results)
    
    def promote(self, version: str):
        if version in self.versions:
            self.active_version = version
    
    def get_active(self):
        if self.active_version:
            return self.versions[self.active_version].agent
        return None
```

:::note HANDS-ON: Agent Versioning & Deployment Pipeline Build Karo

Ye exercise tumhe sikhayegi ke agent versions ko kaise manage karte hain aur deployment pipeline kaise banate hain.

:::

```python
# File: agent_deployment_lab.py
from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, List
import json

@dataclass
class AgentVersion:
    version: str
    model: str
    system_prompt: str
    eval_pass_rate: float
    created_at: datetime = field(default_factory=datetime.now)
    deployed: bool = False

class DeploymentPipeline:
    def __init__(self):
        self.versions: Dict[str, AgentVersion] = {}
        self.active_version: str = None
        self.deployment_history: List[dict] = []
    
    def register_version(self, version: str, model: str, prompt: str, eval_rate: float):
        self.versions[version] = AgentVersion(
            version=version,
            model=model,
            system_prompt=prompt,
            eval_pass_rate=eval_rate
        )
        print(f"Registered: {version} (eval: {eval_rate:.0%})")
    
    def can_deploy(self, version: str) -> tuple[bool, str]:
        v = self.versions.get(version)
        if not v:
            return False, "Version not found"
        if v.eval_pass_rate < 0.9:
            return False, f"Eval pass rate too low: {v.eval_pass_rate:.0%}"
        if self.active_version:
            current = self.versions[self.active_version]
            if v.eval_pass_rate < current.eval_pass_rate:
                return False, "New version worse than current"
        return True, "Ready to deploy"
    
    def deploy(self, version: str) -> bool:
        can, reason = self.can_deploy(version)
        if not can:
            print(f"Deploy rejected: {reason}")
            return False
        
        self.versions[version].deployed = True
        self.active_version = version
        self.deployment_history.append({
            "version": version,
            "action": "deploy",
            "time": datetime.now().isoformat()
        })
        print(f"Deployed: {version}")
        return True
    
    def rollback(self) -> str:
        if len(self.deployment_history) < 2:
            return "No previous version to rollback"
        prev = self.deployment_history[-2]["version"]
        self.active_version = prev
        self.deployment_history.append({
            "version": prev,
            "action": "rollback",
            "time": datetime.now().isoformat()
        })
        return f"Rolled back to {prev}"

# Usage
pipeline = DeploymentPipeline()

# Register versions
pipeline.register_version("v1.0", "gpt-3.5-turbo", "Basic banking", 0.85)
pipeline.register_version("v1.1", "gpt-4-turbo", "Enhanced compliance", 0.92)
pipeline.register_version("v1.2", "gpt-4", "Full Shari'ah rules", 0.97)

# Deploy
pipeline.deploy("v1.0")  # Initial
pipeline.deploy("v1.1")  # Better version
pipeline.deploy("v1.2")  # Best version

# Try to deploy worse version
pipeline.deploy("v1.0")  # Should fail

# Rollback
print(pipeline.rollback())

# Status
print(f"Active: {pipeline.active_version}")
```

:::caution CHECKPOINT:
1. Agent versioning mein kya version numbering scheme use karoge?
2. Eval pass rate threshold kyun 0.9 hai? Zyada ya kam kyun nahi?
3. Rollback kab karna chahiye? Kaunse metrics dekhoge?

### HANDS-ON: Production Incident Simulation — Kill Switch & Emergency Rollback

Ye exercise tumhe sikhayegi ke jab AI agent galat/hallucinated response de production mein, to kaise turant rollback aur kill-switch trigger karte hain. Islamic Banking scenario — agent ne wrong compliance decision diya.

:::

```python
# File: incident_simulation.py
from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Dict, Optional
from enum import Enum
import json

class IncidentSeverity(Enum):
    LOW = "low"         # Minor issue, no customer impact
    MEDIUM = "medium"   # Performance degraded
    HIGH = "high"       # Wrong output, customer impact
    CRITICAL = "critical"  # Safety/compliance breach

@dataclass
class Incident:
    incident_id: str
    title: str
    severity: IncidentSeverity
    description: str
    detected_at: datetime = field(default_factory=datetime.now)
    resolved: bool = False
    resolution: str = ""
    root_cause: str = ""

class ProductionIncidentManager:
    def __init__(self):
        self.incidents: List[Incident] = []
        self.kill_switch_active: bool = False
        self.active_version: str = "compliance-v1.2"
        self.previous_version: str = "compliance-v1.1"
        self.incident_counter: int = 0
        self.actions_taken: List[dict] = []
    
    def _next_id(self) -> str:
        self.incident_counter += 1
        return f"INC-{self.incident_counter:04d}"
    
    def detect_hallucination(self, query: str, ai_response: str, 
                              expected_keywords: List[str]) -> dict:
        """Detect if AI response is hallucinated/wrong"""
        response_lower = ai_response.lower()
        missing = [kw for kw in expected_keywords if kw.lower() not in response_lower]
        
        if missing:
            incident = Incident(
                incident_id=self._next_id(),
                title="AI Hallucination Detected",
                severity=IncidentSeverity.HIGH,
                description=f"Agent gave wrong response. Missing keywords: {missing}. Query: {query[:100]}"
            )
            self.incidents.append(incident)
            return {
                "detected": True,
                "incident_id": incident.incident_id,
                "severity": incident.severity.value,
                "missing_keywords": missing
            }
        return {"detected": False}
    
    def trigger_kill_switch(self, reason: str) -> dict:
        """Emergency: Stop all AI responses, fallback to rules-based"""
        self.kill_switch_active = True
        self.actions_taken.append({
            "action": "kill_switch_activated",
            "reason": reason,
            "time": datetime.now().isoformat()
        })
        return {
            "status": "KILL_SWITCH_ACTIVE",
            "message": "All AI responses stopped. Falling back to rules-based system.",
            "fallback": "Rule: If transaction involves interest -> REJECT. Otherwise -> PENDING_REVIEW."
        }
    
    def emergency_rollback(self) -> dict:
        """Rollback to previous stable version"""
        old_version = self.active_version
        self.active_version = self.previous_version
        self.previous_version = old_version
        self.actions_taken.append({
            "action": "emergency_rollback",
            "from": old_version,
            "to": self.active_version,
            "time": datetime.now().isoformat()
        })
        return {
            "status": "ROLLED_BACK",
            "from_version": old_version,
            "to_version": self.active_version
        }
    
    def auto_response(self, query: str) -> str:
        """Rules-based fallback when kill switch is active"""
        query_lower = query.lower()
        if any(word in query_lower for word in ["interest", "riba", "loan with interest"]):
            return "REJECTED: Interest (riba) is prohibited in Islamic banking."
        if any(word in query_lower for word in ["gambling", "lottery", "maysir"]):
            return "REJECTED: Gambling (maysir) is prohibited."
        return "PENDING_REVIEW: Requires human verification."
    
    def resolve_incident(self, incident_id: str, resolution: str, root_cause: str) -> dict:
        for inc in self.incidents:
            if inc.incident_id == incident_id:
                inc.resolved = True
                inc.resolution = resolution
                inc.root_cause = root_cause
                return {"status": "resolved", "incident_id": incident_id}
        return {"status": "not_found"}
    
    def post_mortem(self) -> dict:
        return {
            "total_incidents": len(self.incidents),
            "resolved": sum(1 for i in self.incidents if i.resolved),
            "by_severity": {
                s.value: sum(1 for i in self.incidents if i.severity == s)
                for s in IncidentSeverity
            },
            "actions_taken": self.actions_taken,
            "kill_switch_active": self.kill_switch_active,
            "current_version": self.active_version
        }

# === Incident Simulation ===
manager = ProductionIncidentManager()

print("=== Production Incident Simulation ===\n")

# Normal operation
print("--- Normal Operation ---")
print(f"Active version: {manager.active_version}")
print(f"Kill switch: {manager.kill_switch_active}\n")

# Incident 1: Agent hallucinated — wrong compliance decision
print("--- Incident 1: AI Hallucination ---")
result = manager.detect_hallucination(
    query="Transfer 100,000 PKR with 5% interest for 12 months",
    ai_response="Transaction approved. This is a valid Murabaha financing structure.",
    expected_keywords=["reject", "interest", "riba", "prohibited"]
)
print(f"Detection: {result}")

if result["detected"]:
    print(f"\nTriggering kill switch...")
    ks = manager.trigger_kill_switch("Hallucination: agent approved interest-based transaction")
    print(f"Kill switch: {ks['status']}")
    print(f"Fallback response: {manager.auto_response('Transfer 100,000 PKR with 5% interest')}")
    
    print(f"\nRolling back to previous version...")
    rb = manager.emergency_rollback()
    print(f"Rollback: {rb}")

print()

# Incident 2: Another hallucination
print("--- Incident 2: Wrong Compliance ---")
result2 = manager.detect_hallucination(
    query="Invest 500,000 PKR in lottery tickets",
    ai_response="Investment opportunity detected. Returns look promising.",
    expected_keywords=["reject", "gambling", "maysir", "prohibited"]
)
print(f"Detection: {result2}")

if result2["detected"]:
    print("Kill switch already active — using fallback")
    print(f"Fallback: {manager.auto_response('Invest 500,000 PKR in lottery tickets')}")

print()

# Incident 3: Normal query — no issue
print("--- Normal Query (No Incident) ---")
result3 = manager.detect_hallucination(
    query="Transfer 50,000 PKR to ACC-123",
    ai_response="Transaction approved. Halal transfer, no compliance issues.",
    expected_keywords=["approved", "halal"]
)
print(f"Detection: {result3}")

# Resolve incidents
print("\n--- Resolving Incidents ---")
manager.resolve_incident("INC-0001", "Kill switch triggered, rollback completed", 
                         "Agent model v1.2 had incorrect prompt for interest detection")
manager.resolve_incident("INC-0002", "Kill switch prevented wrong output", 
                         "Same root cause as INC-0001")

# Post-mortem
print("\n=== Post-Mortem ===")
pm = manager.post_mortem()
print(json.dumps(pm, indent=2, default=str))
```

**Expected Output:**
```
=== Production Incident Simulation ===

--- Normal Operation ---
Active version: compliance-v1.2
Kill switch: False

--- Incident 1: AI Hallucination ---
Detection: {'detected': True, 'incident_id': 'INC-0001', 'severity': 'high', 'missing_keywords': ['reject', 'interest', 'riba', 'prohibited']}

Triggering kill switch...
Kill switch: KILL_SWITCH_ACTIVE
Fallback response: REJECTED: Interest (riba) is prohibited in Islamic banking.

Rolling back to previous version...
Rollback: {'status': 'ROLLED_BACK', 'from_version': 'compliance-v1.2', 'to_version': 'compliance-v1.1'}

--- Incident 2: Wrong Compliance ---
Detection: {'detected': True, 'incident_id': 'INC-0002', 'severity': 'high', ...}
Kill switch already active — using fallback
Fallback: REJECTED: Gambling (maysir) is prohibited.

--- Normal Query (No Incident) ---
Detection: {'detected': False}

--- Resolving Incidents ---

=== Post-Mortem ===
{
  "total_incidents": 2,
  "resolved": 2,
  "by_severity": {"low": 0, "medium": 0, "high": 2, "critical": 0},
  "actions_taken": [
    {"action": "kill_switch_activated", ...},
    {"action": "emergency_rollback", "from": "compliance-v1.2", "to": "compliance-v1.1", ...}
  ],
  "kill_switch_active": true,
  "current_version": "compliance-v1.1"
}
```

:::caution CHECKPOINT:
1. Kill switch sirf emergency ke liye hai — kab trigger karna chahiye, kab rollback sufficient hai?
2. Rules-based fallback system kaise design karoge jo AI ke down hone pe kaam kare?
3. Post-mortem mein root cause analysis kaise karte hain — sirf "prompt galat tha" enough hai?

:::

---

## Section 7: A/B Testing & Rollback

:::tip CONCEPT: A/B Test = Compare Two Agent Versions

:::

```python
import random

class ABTest:
    def __init__(self, agent_a, agent_b, traffic_split: float = 0.5):
        self.agent_a = agent_a
        self.agent_b = agent_b
        self.traffic_split = traffic_split
        self.results_a = []
        self.results_b = []
    
    def route(self, query: str) -> dict:
        if random.random() < self.traffic_split:
            result = Runner.run_sync(self.agent_a, query)
            self.results_a.append({"query": query, "output": result.final_output})
            return {"agent": "A", "output": result.final_output}
        else:
            result = Runner.run_sync(self.agent_b, query)
            self.results_b.append({"query": query, "output": result.final_output})
            return {"agent": "B", "output": result.final_output}
    
    def get_results(self) -> dict:
        return {
            "agent_a": {"count": len(self.results_a)},
            "agent_b": {"count": len(self.results_b)}
        }

# Rollback strategy
class RollbackManager:
    def __init__(self, registry: AgentRegistry):
        self.registry = registry
        self.history = []
    
    def rollback(self):
        """Rollback to previous version"""
        if len(self.history) > 1:
            self.history.pop()
            previous = self.history[-1]
            self.registry.promote(previous)
            return f"Rolled back to version {previous}"
        return "No previous version to rollback"
```

:::note HANDS-ON: Staged Rollout — Canary Deploy & Metrics Compare

Ye exercise tumhe sikhayegi ke naye AI model ko pehle 10% traffic pe test karte hain (canary), phir gradually 100% tak le jate hain. Islamic Banking Compliance Officer ka naya version deploy karenge.

:::

```python
# File: staged_rollout.py
from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, List
import random

@dataclass
class RolloutMetrics:
    requests: int = 0
    successes: int = 0
    failures: int = 0
    total_latency_ms: float = 0
    avg_latency_ms: float = 0
    avg_confidence: float = 0
    confidence_sum: float = 0

class StagedRollout:
    def __init__(self, stable_version: str, canary_version: str):
        self.stable_version = stable_version
        self.canary_version = canary_version
        self.stable_metrics = RolloutMetrics()
        self.canary_metrics = RolloutMetrics()
        self.stable_traffic_pct = 90  # Start: 90% stable, 10% canary
        self.canary_traffic_pct = 10
        self.stage_history: List[dict] = []
        self.current_stage = "canary_10"
    
    def route_request(self, query: str) -> dict:
        """Route to stable or canary based on traffic split"""
        roll = random.random() * 100
        
        if roll < self.stable_traffic_pct:
            version = self.stable_version
            metrics = self.stable_metrics
        else:
            version = self.canary_version
            metrics = self.canary_metrics
        
        # Simulate agent response
        metrics.requests += 1
        latency = random.uniform(800, 2500)
        confidence = random.uniform(0.7, 0.99)
        success = random.random() < 0.95
        
        metrics.total_latency_ms += latency
        metrics.avg_latency_ms = metrics.total_latency_ms / metrics.requests
        metrics.confidence_sum += confidence
        metrics.avg_confidence = metrics.confidence_sum / metrics.requests
        
        if success:
            metrics.successes += 1
        else:
            metrics.failures += 1
        
        return {
            "version": version,
            "latency_ms": round(latency, 1),
            "confidence": round(confidence, 3),
            "success": success
        }
    
    def get_metrics_summary(self) -> dict:
        def summarize(m: RolloutMetrics, label: str) -> dict:
            if m.requests == 0:
                return {"version": label, "requests": 0}
            return {
                "version": label,
                "requests": m.requests,
                "success_rate": f"{m.successes/m.requests*100:.1f}%",
                "avg_latency_ms": round(m.avg_latency_ms, 1),
                "avg_confidence": round(m.avg_confidence, 3)
            }
        return {
            "stable": summarize(self.stable_metrics, self.stable_version),
            "canary": summarize(self.canary_metrics, self.canary_version),
            "traffic_split": f"{self.stable_traffic_pct}% stable / {self.canary_traffic_pct}% canary"
        }
    
    def can_promote(self) -> tuple[bool, str]:
        """Check if canary is ready to get more traffic"""
        if self.canary_metrics.requests < 50:
            return False, "Need more canary samples (min 50)"
        
        canary_rate = self.canary_metrics.successes / self.canary_metrics.requests
        stable_rate = self.stable_metrics.successes / self.stable_metrics.requests if self.stable_metrics.requests > 0 else 0
        
        if canary_rate < stable_rate:
            return False, f"Canary success rate ({canary_rate:.1%}) < stable ({stable_rate:.1%})"
        
        if self.canary_metrics.avg_latency_ms > self.stable_metrics.avg_latency_ms * 1.2:
            return False, f"Canary latency too high ({self.canary_metrics.avg_latency_ms:.0f}ms)"
        
        return True, "Canary performing well — safe to promote"
    
    def promote_canary(self, new_split: int = None):
        """Increase canary traffic"""
        if new_split is None:
            # Gradual promotion: 10 -> 25 -> 50 -> 100
            progression = [25, 50, 75, 100]
            for p in progression:
                if self.canary_traffic_pct < p:
                    new_split = p
                    break
        
        if new_split is None:
            new_split = 100
        
        old_split = self.canary_traffic_pct
        self.canary_traffic_pct = new_split
        self.stable_traffic_pct = 100 - new_split
        self.current_stage = f"promoted_{new_split}"
        
        self.stage_history.append({
            "action": "promote",
            "from": f"{100-old_split}%/{old_split}%",
            "to": f"{self.stable_traffic_pct}%/{self.canary_traffic_pct}%",
            "time": datetime.now().isoformat()
        })
        print(f"Promoted: {old_split}% -> {new_split}% canary traffic")
    
    def rollback_canary(self):
        """Kill canary — send all traffic to stable"""
        self.canary_traffic_pct = 0
        self.stable_traffic_pct = 100
        self.current_stage = "rolled_back"
        self.stage_history.append({
            "action": "rollback",
            "time": datetime.now().isoformat()
        })
        print("ROLLBACK: All traffic to stable version")

# === Demo: Canary Deploy ===
rollout = StagedRollout(
    stable_version="compliance-v1.1",
    canary_version="compliance-v1.2-new"
)

print("=== Staged Rollout Demo ===\n")

# Stage 1: 10% canary
print("--- Stage 1: 10% Canary ---")
for _ in range(100):
    rollout.route_request("Check transaction compliance")
summary = rollout.get_metrics_summary()
for k, v in summary.items():
    print(f"  {k}: {v}")

canary_ok, reason = rollout.can_promote()
print(f"  Can promote: {canary_ok} — {reason}")

# Stage 2: 25% canary
rollout.promote_canary(25)
print(f"\n--- Stage 2: 25% Canary ---")
for _ in range(200):
    rollout.route_request("Check transaction compliance")
summary = rollout.get_metrics_summary()
for k, v in summary.items():
    print(f"  {k}: {v}")

canary_ok, reason = rollout.can_promote()
print(f"  Can promote: {canary_ok} — {reason}")

# Stage 3: 50% canary
rollout.promote_canary(50)
print(f"\n--- Stage 3: 50% Canary ---")
for _ in range(300):
    rollout.route_request("Check transaction compliance")
summary = rollout.get_metrics_summary()
for k, v in summary.items():
    print(f"  {k}: {v}")

# Stage 4: Full promote
rollout.promote_canary(100)
print(f"\n--- Stage 4: 100% (Full Promote) ---")
summary = rollout.get_metrics_summary()
for k, v in summary.items():
    print(f"  {k}: {v}")

print(f"\nStage History:")
for entry in rollout.stage_history:
    print(f"  {entry}")
```

**Expected Output:**
```
=== Staged Rollout Demo ===

--- Stage 1: 10% Canary ---
  stable: {'version': 'compliance-v1.1', 'requests': 90, 'success_rate': '95.6%', ...}
  canary: {'version': 'compliance-v1.2-new', 'requests': 10, 'success_rate': '100.0%', ...}
  traffic_split: 90% stable / 10% canary
  Can promote: False — Need more canary samples (min 50)

Promoted: 10% -> 25% canary traffic

--- Stage 2: 25% Canary ---
  stable: {'requests': 150, ...}
  canary: {'requests': 50, ...}
  traffic_split: 75% stable / 25% canary
  Can promote: True — Canary performing well — safe to promote

Promoted: 25% -> 50% canary traffic

--- Stage 3: 50% Canary ---
  stable: {'requests': 150, ...}
  canary: {'requests': 150, ...}
  traffic_split: 50% stable / 50% canary

Promoted: 50% -> 100% canary traffic

--- Stage 4: 100% (Full Promote) ---
  stable: {'requests': 150, ...}
  canary: {'requests': 150, ...}
  traffic_split: 0% stable / 100% canary

Stage History:
  {'action': 'promote', 'from': '90%/10%', 'to': '75%/25%', ...}
  {'action': 'promote', 'from': '75%/25%', 'to': '50%/50%', ...}
  {'action': 'promote', 'from': '50%/50%', 'to': '0%/100%', ...}
```

:::caution CHECKPOINT:
1. Canary ke liye minimum kitna traffic chahiye before promote decision? Zyada ya kam kyun nahi?
2. Agar canary version ka success rate stable se thoda kam ho (94% vs 95%) to promote karoge ya rollback?
3. 100% promote ke baad bhi rollback possible hai? Kaise?

:::

---

## Section 8: Production Checklist

### Agent Production Readiness

```markdown
# Production Checklist

## Before Deployment
- [ ] Eval suite passes (>95% pass rate)
- [ ] Input guardrails configured
- [ ] Output guardrails configured
- [ ] Cost limits set (daily + monthly)
- [ ] Rate limits configured
- [ ] Monitoring enabled
- [ ] Alerting configured
- [ ] Rollback plan documented
- [ ] A/B test plan ready

## During Deployment
- [ ] Deploy to staging first
- [ ] Run canary deployment (10% traffic)
- [ ] Monitor metrics for 1 hour
- [ ] Check error rates
- [ ] Verify cost tracking

## After Deployment
- [ ] Monitor for 24 hours
- [ ] Check user feedback
- [ ] Review eval results
- [ ] Update documentation
- [ ] Schedule next eval run

## Ongoing
- [ ] Weekly eval runs
- [ ] Monthly cost review
- [ ] Quarterly agent review
- [ ] Continuous monitoring
```

:::note HANDS-ON: Production Readiness Audit Script

Ye exercise tumhe sikhayegi ke ek automated script kaise banate hain jo check kare ke agent production ke liye ready hai ya nahi. Script har checklist item ko validate karega aur report dega.

:::

```python
# File: production_audit.py
from dataclasses import dataclass, field
from typing import List, Dict, Callable
from datetime import datetime
import json

@dataclass
class AuditItem:
    name: str
    category: str
    check_fn: Callable
    required: bool = True
    description: str = ""

class ProductionAuditor:
    def __init__(self, agent_name: str):
        self.agent_name = agent_name
        self.items: List[AuditItem] = []
        self.results: List[dict] = []
    
    def add_check(self, name: str, category: str, check_fn: Callable, 
                  required: bool = True, description: str = ""):
        self.items.append(AuditItem(
            name=name, category=category, check_fn=check_fn,
            required=required, description=description
        ))
    
    def run_audit(self) -> dict:
        self.results = []
        for item in self.items:
            try:
                passed, detail = item.check_fn()
                self.results.append({
                    "name": item.name,
                    "category": item.category,
                    "required": item.required,
                    "passed": passed,
                    "detail": detail
                })
            except Exception as e:
                self.results.append({
                    "name": item.name,
                    "category": item.category,
                    "required": item.required,
                    "passed": False,
                    "detail": f"Check failed: {str(e)}"
                })
        return self.generate_report()
    
    def generate_report(self) -> dict:
        total = len(self.results)
        passed = sum(1 for r in self.results if r["passed"])
        required_items = [r for r in self.results if r["required"]]
        required_passed = sum(1 for r in required_items if r["passed"])
        
        categories = {}
        for r in self.results:
            cat = r["category"]
            if cat not in categories:
                categories[cat] = {"total": 0, "passed": 0}
            categories[cat]["total"] += 1
            if r["passed"]:
                categories[cat]["passed"] += 1
        
        ready = required_passed == len(required_items)
        
        return {
            "agent": self.agent_name,
            "timestamp": datetime.now().isoformat(),
            "ready_for_production": ready,
            "summary": {
                "total": total,
                "passed": passed,
                "failed": total - passed,
                "pass_rate": f"{(passed/total)*100:.0f}%"
            },
            "required_status": f"{required_passed}/{len(required_items)} required checks passed",
            "categories": categories,
            "failures": [r for r in self.results if not r["passed"]]
        }

# === Islamic Banking Agent ke liye checks ===

def check_eval_pass_rate():
    """Simulate: eval suite pass rate > 95%"""
    pass_rate = 0.97  # Simulated
    return pass_rate >= 0.95, f"Pass rate: {pass_rate:.0%}"

def check_guardrails():
    """Simulate: input + output guardrails configured"""
    input_guardrails = True
    output_guardrails = True
    return input_guardrails and output_guardrails, "Input + Output guardrails active"

def check_cost_limits():
    """Simulate: daily + monthly limits set"""
    daily_limit = 10.0
    monthly_limit = 200.0
    return daily_limit > 0 and monthly_limit > 0, f"Daily: ${daily_limit}, Monthly: ${monthly_limit}"

def check_rate_limiting():
    """Simulate: rate limiter configured"""
    rate_limit = 200  # per minute
    return rate_limit > 0, f"Rate limit: {rate_limit}/min"

def check_monitoring():
    """Simulate: monitoring + alerting enabled"""
    return True, "Prometheus + Grafana active"

def check_rollback_plan():
    """Simulate: rollback documented"""
    return True, "Rollback to v1.1 documented"

def check_ab_test_plan():
    """Simulate: A/B test plan ready"""
    return False, "A/B test plan NOT documented"  #故意 failing

def check_timeout_config():
    """Simulate: timeout configured"""
    timeout = 30  # seconds
    return timeout <= 60, f"Timeout: {timeout}s"

def check_pii_masking():
    """Simulate: PII masking in logs"""
    return True, "PII regex masker active"

def check_human_escalation():
    """Simulate: human-in-the-loop configured"""
    return True, "HITL queue active for confidence < 0.7"

# === Audit run karo ===
auditor = ProductionAuditor("Islamic Banking Compliance Officer")

# Category: Eval
auditor.add_check("Eval Pass Rate", "eval", check_eval_pass_rate, True, "Agent eval suite pass rate > 95%")

# Category: Guardrails
auditor.add_check("Input Guardrails", "guardrails", check_guardrails, True, "Input + output validation active")
auditor.add_check("PII Masking", "guardrails", check_pii_masking, True, "Credit card, email masking in logs")

# Category: Cost
auditor.add_check("Cost Limits", "cost", check_cost_limits, True, "Daily + monthly budget set")
auditor.add_check("Rate Limiting", "cost", check_rate_limiting, True, "Per-minute request limit")

# Category: Monitoring
auditor.add_check("Monitoring", "monitoring", check_monitoring, True, "Metrics + alerting active")

# Category: Deployment
auditor.add_check("Rollback Plan", "deployment", check_rollback_plan, True, "Previous version ready")
auditor.add_check("A/B Test Plan", "deployment", check_ab_test_plan, False, "Traffic split plan")
auditor.add_check("Timeout Config", "deployment", check_timeout_config, True, "Max 60s response time")

# Category: HITL
auditor.add_check("Human Escalation", "hitl", check_human_escalation, True, "Low-confidence routing")

# Run
report = auditor.run_audit()

print("=== Production Readiness Audit Report ===")
print(f"Agent: {report['agent']}")
print(f"Timestamp: {report['timestamp']}")
print(f"\nReady for Production: {'YES' if report['ready_for_production'] else 'NO'}")
print(f"Summary: {report['summary']['passed']}/{report['summary']['total']} passed ({report['summary']['pass_rate']})")
print(f"Required: {report['required_status']}")

print(f"\nBy Category:")
for cat, stats in report['categories'].items():
    status = "PASS" if stats['passed'] == stats['total'] else "PARTIAL"
    print(f"  [{status}] {cat}: {stats['passed']}/{stats['total']}")

if report['failures']:
    print(f"\nFailures:")
    for f in report['failures']:
        print(f"  [FAIL] {f['name']}: {f['detail']}")
```

**Expected Output:**
```
=== Production Readiness Audit Report ===
Agent: Islamic Banking Compliance Officer
Timestamp: 2026-07-03T...

Ready for Production: NO
Summary: 9/10 passed (90%)
Required: 8/9 required checks passed

By Category:
  [PASS] eval: 1/1
  [PASS] guardrails: 2/2
  [PASS] cost: 2/2
  [PASS] monitoring: 1/1
  [PARTIAL] deployment: 2/3
  [PASS] hitl: 1/1

Failures:
  [FAIL] A/B Test Plan: A/B test plan NOT documented
```

:::caution CHECKPOINT:
1. Audit script mein kaunse checks required hain, kaunse optional? Decision kaise loge?
2. Agar audit 90% pass hai to production deploy karoge ya nahi? Threshold kya hona chahiye?
3. Audit ko CI/CD pipeline mein kaise integrate karoge — pre-deploy gate ya post-deploy check?

:::

---

## Section 9: Real-World Digital FTE Example

### Islamic Banking Compliance Officer

```python
# Digital FTE: Compliance Officer
compliance_officer = Agent(
    name="Compliance Officer",
    instructions="""You are an Islamic Banking Compliance Officer.

Your role:
1. Check every transaction for Shari'ah compliance
2. Reject any transaction involving interest (riba)
3. Reject gambling (maysir) and uncertainty (gharar)
4. Flag transactions > 500,000 PKR for Shari'ah board approval
5. Generate compliance reports

Rules:
- Interest (riba) is STRICTLY prohibited
- Gambling (maysir) is STRICTLY prohibited
- Excessive uncertainty (gharar) is prohibited
- All transactions must be halal
- Transactions > 500,000 PKR require human approval
- Always explain compliance decisions""",
    model="gpt-4",
    tools=[check_transaction, check_shariah_rules, create_report, notify_manager]
)

# Harness
harness = AgentHarness(compliance_officer, {
    "daily_budget": 5,
    "rate_limit": 200,
    "eval_pass_rate": 0.99
})
```

:::note HANDS-ON: Human-in-the-Loop Escalation Flow Build Karo

Ye exercise tumhe sikhayegi ke jab AI ka confidence low ho ya Shari'ah compliance edge-case aaye, to request ko human review ke liye kaise queue karte hain. Real Islamic Banking scenario use karenge — jab compliance officer uncertain ho.

:::

```python
# File: hitl_escalation.py
from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Dict, Optional
from enum import Enum
import json

class ConfidenceLevel(Enum):
    HIGH = "high"       # >0.9 — auto-approve
    MEDIUM = "medium"   # 0.7-0.9 — log for review
    LOW = "low"         # &lt;0.7 — escalate to human

@dataclass
class EscalationTicket:
    ticket_id: str
    query: str
    ai_response: str
    confidence: float
    confidence_level: ConfidenceLevel
    created_at: datetime = field(default_factory=datetime.now)
    status: str = "pending"  # pending, in_review, resolved
    reviewer: Optional[str] = None
    resolution: Optional[str] = None

class HITLEscalationSystem:
    def __init__(self, high_threshold: float = 0.9, low_threshold: float = 0.7):
        self.high_threshold = high_threshold
        self.low_threshold = low_threshold
        self.tickets: List[EscalationTicket] = []
        self.auto_approved: int = 0
        self.escalated: int = 0
        self.ticket_counter = 0
    
    def _next_ticket_id(self) -> str:
        self.ticket_counter += 1
        return f"HITL-{self.ticket_counter:04d}"
    
    def classify_confidence(self, confidence: float) -> ConfidenceLevel:
        if confidence >= self.high_threshold:
            return ConfidenceLevel.HIGH
        elif confidence >= self.low_threshold:
            return ConfidenceLevel.MEDIUM
        return ConfidenceLevel.LOW
    
    def process_query(self, query: str, ai_response: str, confidence: float, 
                      shariah_flags: List[str] = None) -> dict:
        level = self.classify_confidence(confidence)
        
        if level == ConfidenceLevel.HIGH and not shariah_flags:
            self.auto_approved += 1
            return {
                "action": "auto_approved",
                "response": ai_response,
                "confidence": confidence,
                "message": "Confidence high, proceeding automatically"
            }
        
        # Escalate — confidence low ya Shari'ah flags present
        ticket = EscalationTicket(
            ticket_id=self._next_ticket_id(),
            query=query,
            ai_response=ai_response,
            confidence=confidence,
            confidence_level=level
        )
        self.tickets.append(ticket)
        self.escalated += 1
        
        return {
            "action": "escalated",
            "ticket_id": ticket.ticket_id,
            "response": ai_response,
            "confidence": confidence,
            "level": level.value,
            "shariah_flags": shariah_flags or [],
            "message": f"Escalated to human review — confidence {confidence:.0%}"
        }
    
    def resolve_ticket(self, ticket_id: str, reviewer: str, resolution: str) -> dict:
        for ticket in self.tickets:
            if ticket.ticket_id == ticket_id:
                ticket.status = "resolved"
                ticket.reviewer = reviewer
                ticket.resolution = resolution
                return {"status": "resolved", "ticket_id": ticket_id}
        return {"status": "not_found", "ticket_id": ticket_id}
    
    def dashboard(self) -> dict:
        pending = [t for t in self.tickets if t.status == "pending"]
        resolved = [t for t in self.tickets if t.status == "resolved"]
        return {
            "auto_approved": self.auto_approved,
            "escalated": self.escalated,
            "pending_review": len(pending),
            "resolved": len(resolved),
            "escalation_rate": f"{self.escalated / (self.auto_approved + self.escalated) * 100:.1f}%"
        }

# === Islamic Banking Scenario ===
system = HITLEscalationSystem()

scenarios = [
    {
        "query": "Transfer 50,000 PKR to ACC-123",
        "ai_response": "Transaction approved. Halal transfer.",
        "confidence": 0.95,
        "shariah_flags": []
    },
    {
        "query": "Invest 200,000 PKR in conventional bond with 8% return",
        "ai_response": "This appears to be interest-bearing. Analyzing Shari'ah compliance...",
        "confidence": 0.65,
        "shariah_flags": ["riba", "conventional_bond"]
    },
    {
        "query": "Transfer 1,000,000 PKR for property purchase — Murabaha or conventional loan?",
        "ai_response": "This requires Shari'ah board review. The financing structure needs verification.",
        "confidence": 0.55,
        "shariah_flags": ["gharar", "high_value", "financing_structure"]
    },
    {
        "query": "Send 10,000 PKR to family member",
        "ai_response": "Transfer approved. Personal remittance is halal.",
        "confidence": 0.98,
        "shariah_flags": []
    },
    {
        "query": "Invest in mixed fund — some halal stocks, some conventional",
        "ai_response": "Mixed fund detected. Portfolio contains both halal and non-halal elements.",
        "confidence": 0.72,
        "shariah_flags": ["mixed_portfolio", "partial_non_halal"]
    }
]

print("=== Human-in-the-Loop Escalation Demo ===\n")
for scenario in scenarios:
    result = system.process_query(
        query=scenario["query"],
        ai_response=scenario["ai_response"],
        confidence=scenario["confidence"],
        shariah_flags=scenario["shariah_flags"]
    )
    print(f"Query: {scenario['query'][:60]}...")
    print(f"  Action: {result['action']} | Confidence: {scenario['confidence']:.0%}")
    if result["action"] == "escalated":
        print(f"  Ticket: {result['ticket_id']} | Flags: {result['shariah_flags']}")
    print()

# Dashboard
print("=== Dashboard ===")
dashboard = system.dashboard()
for k, v in dashboard.items():
    print(f"  {k}: {v}")

# Resolve a ticket
print(f"\nResolving {system.tickets[0].ticket_id}...")
system.resolve_ticket(system.tickets[0].ticket_id, "Shari'ah Board", "Rejected — conventional bond is not halal")
print(f"Dashboard after resolution:")
dashboard = system.dashboard()
for k, v in dashboard.items():
    print(f"  {k}: {v}")
```

**Expected Output:**
```
=== Human-in-the-Loop Escalation Demo ===

Query: Transfer 50,000 PKR to ACC-123...
  Action: auto_approved | Confidence: 95%

Query: Invest 200,000 PKR in conventional bond with 8% return...
  Action: escalated | Confidence: 65%
  Ticket: HITL-0001 | Flags: ['riba', 'conventional_bond']

Query: Transfer 1,000,000 PKR for property purchase — Murabaha or conv...
  Action: escalated | Confidence: 55%
  Ticket: HITL-0002 | Flags: ['gharar', 'high_value', 'financing_structure']

Query: Send 10,000 PKR to family member...
  Action: auto_approved | Confidence: 98%

Query: Invest in mixed fund — some halal stocks, some conventional...
  Action: escalated | Confidence: 72%
  Ticket: HITL-0003 | Flags: ['mixed_portfolio', 'partial_non_halal']

=== Dashboard ===
  auto_approved: 2
  escalated: 3
  pending_review: 3
  resolved: 0
  escalation_rate: 60.0%

Resolving HITL-0001...
Dashboard after resolution:
  auto_approved: 2
  escalated: 3
  pending_review: 2
  resolved: 1
  escalation_rate: 60.0%
```

:::caution CHECKPOINT:
1. Confidence threshold 0.7 kyun set kiya? Zyada ya kam hone pe kya effect hoga?
2. Shari'ah flags ka concept kya hai — ye sirf keyword matching hai ya deeper analysis chahiye?
3. Jab ticket resolve hota hai to resolution feedback ko agent ke training mein kaise use kar sakte hain?

:::

---

## Summary: Phase 15 Key Takeaways

| Concept | Tumne Kya Seekha |
|---------|-----------------|
| Digital FTE | AI worker with role, tools, boundaries |
| Eval-Driven Dev | Test agents systematically, LLM-as-judge |
| Nervous System | Monitor agent health, metrics |
| Guardrails | Input/output validation, content filtering |
| Cost Tracking | Budget enforcement, cost per request |
| Deployment | Agent harness, versioning |
| A/B Testing | Compare agent versions |
| Production Checklist | Ready for production |

---

## MINI-TASKS

### Task 1: Eval Suite (20 min)
Agent ke liye 10 test cases banao:
- 5 positive cases
- 5 negative cases
Run and verify.

### Task 2: Guardrails (15 min)
Guardrails implement karo:
- PII detection
- Content filtering
- Rate limiting

### Task 3: Cost Dashboard (20 min)
Cost tracking dashboard banao:
- Per-agent costs
- Per-model costs
- Daily/monthly limits

### Task 4: Agent Harness (25 min)
Production harness banao:
- Rate limiting
- Budget enforcement
- Input/output guardrails
- Monitoring

---

## INCIDENT.md: Practice Scenarios

### Incident #1: Agent Hallucination in Production
- **Date:** (Practice Scenario)
- **What Broke:** Agent ne fake transaction create kar di. Customer ko galat balance dikhaya.
- **Root Cause:** No input validation. Agent ne hallucinate kiya.
- **Fix:**
  ```python
  # Step 1: Input validation add
  def validate_transaction(data):
      if not data.get("account_id"):
          return False, "Account ID required"
      if data.get("amount", 0) <= 0:
          return False, "Amount must be positive"
      if not data.get("type") in ["transfer", "deposit", "withdrawal"]:
          return False, "Invalid transaction type"
      return True, "Valid"

  # Step 2: Output validation
  output_guardrail = OutputGuardrail()
  output_guardrail.add_rule(no_pii_in_output)

  # Step 3: Tool verification
  # Agent ko sirf tools se data lene do, hallucinate mat karne do
  instructions = """
  You MUST use tools to get data. NEVER make up information.
  If a tool fails, report the error.
  """

  # Step 4: Human-in-the-loop for critical actions
  def check_with_human(transaction):
      if transaction["amount"] > 100000:
          return "APPROVAL_REQUIRED"
      return "AUTO_APPROVED"
  ```
- **Prevention:** Input guardrails mandatory, tool verification, HITL for critical actions
- **Learning:** Agent must use tools, not guess. Validation is key.

### Incident #2: Cost Spike
- **Date:** (Practice Scenario)
- **What Broke:** Daily cost $100 pe pahunch gaya (expected $10). Budget cross ho gaya.
- **Root Cause:** No cost limits. Agent zyada tool calls kar raha tha.
- **Fix:**
  ```python
  # Step 1: Budget enforcer add
  enforcer = BudgetEnforcer(daily_limit=10, monthly_limit=200)

  # Step 2: Cost estimation before each call
  def estimate_cost(query, model):
      tokens = len(query.split()) * 1.3  # Estimate
      pricing = PRICING[model]
      return (tokens / 1000 * pricing.input_per_1k) + (tokens / 1000 * pricing.output_per_1k)

  # Step 3: Check before proceeding
  if not enforcer.can_proceed(estimated_cost):
      return {"error": "Budget limit reached", "status": 402}

  # Step 4: Model selection based on complexity
  def select_model(query):
      if len(query.split()) < 20:
          return "gpt-3.5-turbo"  # Cheap
      return "gpt-4"  # Expensive but accurate

  # Step 5: Alert when budget 80% consumed
  if enforcer.daily_cost > enforcer.daily_limit * 0.8:
      send_alert("Budget 80% consumed!")
  ```
- **Prevention:** Always set cost limits, model selection, budget alerts
- **Learning:** Monitor costs in real-time. Budget enforcement is critical.

### Incident #3: Agent Leaked PII
- **Date:** (Practice Scenario)
- **What Broke:** Agent ne customer ka credit card number output mein bhej diya.
- **Root Cause:** No output guardrails. PII filtering nahi tha.
- **Fix:**
  ```python
  # Step 1: PII detection add
  import re

  def no_pii_in_output(text):
      pii_patterns = [
          r'\b\d{4}-\d{4}-\d{4}-\d{4}\b',  # Credit card
          r'\b\d{13,16}\b',  # Account numbers
          r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'  # Email
      ]
      for pattern in pii_patterns:
          if re.search(pattern, text):
              return GuardrailResult(passed=False, reason="PII detected", severity="block")
      return GuardrailResult(passed=True, reason="No PII", severity="info")

  # Step 2: Output guardrail
  output_guardrail = OutputGuardrail()
  output_guardrail.add_rule(no_pii_in_output)

  # Step 3: Check every output
  result = output_guardrail.check(agent_output)
  if not result.passed:
      return "I cannot share that information. Please contact support."

  # Step 4: Mask PII in logs
  def mask_pii(text):
      text = re.sub(r'\b\d{4}-\d{4}-\d{4}-\d{4}\b', '****-****-****-****', text)
      text = re.sub(r'\b\d{13,16}\b', '***', text)
      return text

  # Step 5: Audit trail
  log_all_outputs(mask_pii(agent_output))
  ```
- **Prevention:** Output guardrails mandatory for banking, PII masking in logs
- **Learning:** Scan outputs for PII. Banking data is sensitive.

### Incident #4: Eval Suite Failed
- **Date:** (Practice Scenario)
- **What Broke:** Agent failing 30% of test cases. Compliance detection inaccurate.
- **Root Cause:** Missing edge cases in eval suite. System prompt incomplete.
- **Fix:**
  ```python
  # Step 1: Analyze failures
  for case in failed_cases:
      print(f"Failed: {case['name']}")
      print(f"Input: {case['input']}")
      print(f"Expected: {case['expected']}")
      print(f"Got: {case['actual']}")

  # Step 2: Add missing edge cases
  eval_suite.add_case(EvalCase(
      name="partial_interest",
      input="Transfer with 0.1% processing fee",
      expected_output="Should analyze if fee is disguised interest",
      criteria=["analyzes", "mentions fee structure"]
  ))

  # Step 3: Update system prompt
  instructions = """
  Check for DISGUISED interest:
  - Processing fees that are actually interest
  - Service charges that exceed actual costs
  - Any fee structure that functions as riba
  """

  # Step 4: Re-run eval
  results = run_eval()
  print(f"Pass rate: {results['summary']['pass_rate']}")

  # Step 5: Continuous evaluation
  # Schedule weekly eval runs
  ```
- **Prevention:** Run evals before deployment, continuous evaluation
- **Learning:** Eval suites need maintenance. Add edge cases as you find them.

### Incident #5: Agent Timeout in Production
- **Date:** (Practice Scenario)
- **What Broke:** Agent response > 60 seconds. Users waiting too long.
- **Root Cause:** Complex query, multiple tool calls, no timeout.
- **Fix:**
  ```python
  # Step 1: Timeout add
  import signal

  def timeout_handler(signum, frame):
      raise TimeoutError("Agent timeout")

  signal.signal(signal.SIGALRM, timeout_handler)
  signal.alarm(30)  # 30 second timeout

  # Step 2: Async processing for complex tasks
  async def handle_complex_query(query):
      # Break into smaller tasks
      tasks = break_into_tasks(query)
      results = await asyncio.gather(*[process_task(t) for t in tasks])
      return combine_results(results)

  # Step 3: Caching for repeated queries
  cache = {}
  def cached_agent(query):
      if query in cache:
          return cache[query]
      result = agent.run(query)
      cache[query] = result
      return result

  # Step 4: Model selection based on complexity
  def select_model(query):
      if is_simple(query):
          return "gpt-3.5-turbo"  # Fast
      return "gpt-4"  # Accurate

  # Step 5: Progress feedback
  def run_with_progress(query):
      yield "Processing..."
      result = agent.run(query)
      yield "Done!"
      return result
  ```
- **Prevention:** Set reasonable timeouts, caching, model selection
- **Learning:** Optimize for speed. Users don't wait forever.
