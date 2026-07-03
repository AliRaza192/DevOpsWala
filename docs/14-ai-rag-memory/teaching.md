---
sidebar_position: 15
title: "PHASE 14: AGENTIC AI — RAG, Memory & Multi-Agent Systems"
description: "**Tumhara level:** Tumne agents build kiye (Phase 13). Ab tumhe sikhana hai ke agents ko data kaise do (RAG) aur yaad ka"
---

# PHASE 14: AGENTIC AI — RAG, Memory & Multi-Agent Systems — TEACHING

> **Tumhara level:** Tumne agents build kiye (Phase 13). Ab tumhe sikhana hai ke agents ko data kaise do (RAG) aur yaad kaise rakhe (Memory). Ye tumhare Islamic Banking SaaS ke liye critical hai — customers ko apne data se baat karwana hai.

---

## Section 1: RAG Kya Hai? — The Mental Model

:::tip CONCEPT: RAG = Search + Generate

**Problem:** LLM ka data cutoff hai. Tumhara private data nahi jaanta.
**Solution:** Pehle relevant documents dhundho (Retrieval), phir generate karo (Generation).

:::

```
User: "Mera account balance kitna hai?"

Without RAG: "I don't have access to your account."
With RAG:
  1. Retrieve: Database se account info lao
  2. Context: "Ali ka balance 50,000 PKR hai"
  3. Generate: "Ali, tumhara current balance 50,000 PKR hai."
```

**RAG Pipeline:**
```
Documents → Chunking → Embedding → Vector DB
                                      ↓
User Query → Embedding → Similarity Search → Context + Query → LLM → Response
```

**RAG vs Fine-tuning vs Prompt Engineering:**
```
Prompt Engineering: Context in prompt (limited by context window)
Fine-tuning: Train model on your data (expensive, data security risk)
RAG: Retrieve relevant docs at runtime (best for private data)
```

:::caution CHECKPOINT:
1. RAG aur fine-tuning mein kya fark hai? Kab kaunsa use karoge?
2. Chunking kyun zaroori hai? Agar poora document ek saath embed karo to kya hoga?
3. Islamic Banking SaaS mein RAG kaise use karoge?

:::

---

## Section 2: Embeddings — Text Ko Numbers Mein Badlo

:::tip CONCEPT: Embedding = Text Ka Fingerprint

Embedding text ko numerical vector mein convert karta hai. Similar text ke similar vectors hote hain.

:::

```python
# File: embeddings_example.py
from openai import OpenAI
import numpy as np

client = OpenAI()

# Embedding generate karo
response = client.embeddings.create(
    model="text-embedding-3-small",
    input="Islamic banking prohibits interest (riba)"
)

vector = response.data[0].embedding
print(f"Vector dimension: {len(vector)}")  # 1536

# Similarity check
def cosine_similarity(vec1, vec2):
    return np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))

# Two similar texts
text1 = "Islamic banking prohibits interest"
text2 = "Riba is forbidden in Islam"

emb1 = client.embeddings.create(model="text-embedding-3-small", input=text1)
emb2 = client.embeddings.create(model="text-embedding-3-small", input=text2)

similarity = cosine_similarity(emb1.data[0].embedding, emb2.data[0].embedding)
print(f"Similarity: {similarity}")  # High value = similar
```

### Embedding Models Comparison

```
OpenAI text-embedding-3-small:
├── Dimension: 1536
├── Speed: Fast
├── Cost: $0.02/1M tokens
└── Best for: General use

OpenAI text-embedding-3-large:
├── Dimension: 3072
├── Speed: Slower
├── Cost: $0.13/1M tokens
└── Best for: High accuracy

Cohere embed-v3:
├── Dimension: 1024
├── Speed: Fast
├── Cost: Free tier available
└── Best for: Multilingual

Sentence Transformers (open source):
├── Dimension: 384-768
├── Speed: Fast (local)
├── Cost: Free
└── Best for: Self-hosted
```

:::note HANDS-ON: Batch Embedding

:::

```python
# Batch embedding for efficiency
texts = [
    "Islamic banking prohibits interest",
    "Riba is forbidden in Islam",
    "Profit-and-loss sharing is allowed",
    "Conventional banking uses interest rates",
    "Murabaha is a cost-plus financing"
]

response = client.embeddings.create(
    model="text-embedding-3-small",
    input=texts
)

embeddings = [item.embedding for item in response.data]
print(f"Generated {len(embeddings)} embeddings")
print(f"Each dimension: {len(embeddings[0])}")
```

---

## Section 3: Vector Databases — Where to Store Embeddings

:::tip CONCEPT: Vector DB = Embeddings Ka Warehouse

:::

```bash
# pgvector install (PostgreSQL extension)
# NeonDB pe already available hai!

# Enable extension
psql -d your_database
CREATE EXTENSION vector;
```

```python
# File: pgvector_setup.py
import asyncpg
import numpy as np

async def setup_pgvector():
    conn = await asyncpg.connect("postgresql://localhost/nexabook")
    
    # Table banao with vector column
    await conn.execute("""
        CREATE TABLE IF NOT EXISTS documents (
            id SERIAL PRIMARY KEY,
            content TEXT,
            embedding vector(1536),
            metadata JSONB,
            created_at TIMESTAMP DEFAULT NOW()
        )
    """)
    
    # Index banao (fast search ke liye)
    await conn.execute("""
        CREATE INDEX IF NOT EXISTS documents_embedding_idx 
        ON documents 
        USING ivfflat (embedding vector_cosine_ops)
        WITH (lists = 100)
    """)
    
    await conn.close()

# Search function
async def search_documents(query_embedding: list, top_k: int = 5):
    conn = await asyncpg.connect("postgresql://localhost/nexabook")
    
    results = await conn.fetch("""
        SELECT content, metadata,
               1 - (embedding <=> $1::vector) as similarity
        FROM documents
        ORDER BY embedding <=> $1::vector
        LIMIT $2
    """, str(query_embedding), top_k)
    
    await conn.close()
    return results
```

### Vector DB Comparison

```
pgvector (PostgreSQL extension):
├── Pros: Already using PostgreSQL, SQL queries, ACID
├── Cons: Slower than dedicated vector DBs
└── Best for: Small-medium datasets, existing PostgreSQL

Pinecone:
├── Pros: Managed, fast, scalable
├── Cons: Expensive, vendor lock-in
└── Best for: Production, large scale

Chroma:
├── Pros: Open source, easy to use, embedded mode
├── Cons: Limited scalability
└── Best for: Development, prototyping

Qdrant:
├── Pros: Open source, fast, filtering
├- Cons: Newer, smaller community
└── Best for: Production, self-hosted

Weaviate:
├── Pros: GraphQL API, modules, hybrid search
├── Cons: Complex setup
└── Best for: Complex search requirements
```

:::note HANDS-ON: Simple RAG Pipeline

:::

```python
# File: simple_rag.py
from openai import OpenAI
import asyncpg
import json

client = OpenAI()

class RAGPipeline:
    def __init__(self, db_url: str):
        self.db_url = db_url
    
    async def ingest_document(self, content: str, metadata: dict = None):
        """Document ko database mein daalo"""
        response = client.embeddings.create(
            model="text-embedding-3-small",
            input=content
        )
        embedding = response.data[0].embedding
        
        conn = await asyncpg.connect(self.db_url)
        await conn.execute("""
            INSERT INTO documents (content, embedding, metadata)
            VALUES ($1, $2::vector, $3)
        """, content, str(embedding), json.dumps(metadata or {}))
        await conn.close()
    
    async def search(self, query: str, top_k: int = 5):
        """Query se relevant documents dhundho"""
        response = client.embeddings.create(
            model="text-embedding-3-small",
            input=query
        )
        query_embedding = response.data[0].embedding
        
        conn = await asyncpg.connect(self.db_url)
        results = await conn.fetch("""
            SELECT content, metadata,
                   1 - (embedding <=> $1::vector) as similarity
            FROM documents
            ORDER BY embedding <=> $1::vector
            LIMIT $2
        """, str(query_embedding), top_k)
        await conn.close()
        
        return [{"content": r["content"], "metadata": r["metadata"], "similarity": r["similarity"]} for r in results]
    
    async def generate(self, query: str, context: str):
        """RAG response generate karo"""
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": f"Answer based on this context:\n{context}"},
                {"role": "user", "content": query}
            ]
        )
        return response.choices[0].message.content

# Usage
async def main():
    rag = RAGPipeline("postgresql://localhost/nexabook")
    
    await rag.ingest_document(
        "Islamic banking prohibits interest (riba). All transactions must be Shari'ah compliant.",
        {"type": "policy", "topic": "compliance"}
    )
    
    results = await rag.search("What is the policy on interest?")
    print(results)
```

---

## Section 4: Chunking Strategies — Documents Ko Todna

:::tip CONCEPT: Chunk = Document Ka Piece

:::

```python
# 1. Fixed-size chunking
def fixed_size_chunk(text: str, chunk_size: int = 1000, overlap: int = 200):
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start = end - overlap
    return chunks

# 2. Semantic chunking (by paragraphs/sentences)
def semantic_chunk(text: str):
    paragraphs = text.split("\n\n")
    return [p.strip() for p in paragraphs if p.strip()]

# 3. Recursive chunking (LangChain style)
from langchain.text_splitter import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
    length_function=len,
    separators=["\n\n", "\n", ". ", " ", ""]
)

chunks = splitter.split_text(document)

# 4. Markdown-aware chunking
def markdown_chunk(text: str):
    """Split by markdown headers"""
    import re
    sections = re.split(r'\n(?=#{1,3}\s)', text)
    return [s.strip() for s in sections if s.strip()]

# 5. Code-aware chunking
def code_chunk(text: str):
    """Split by functions/classes"""
    import re
    chunks = re.split(r'\n(?=def |class |async def )', text)
    return [c.strip() for c in chunks if c.strip()]
```

:::caution CHECKPOINT:
1. Chunk size kitna rakhna chahiye? Zyada bada ya chhota — kya effect padega?
2. Overlap kyun hota hai? Bina overlap ke kya problem aa sakti hai?

:::

---

## Section 5: Advanced RAG — Hybrid Search & Reranking

:::tip CONCEPT: Hybrid Search = Best of Both Worlds

:::

```python
# Hybrid search: Keyword + Semantic
async def hybrid_search(query: str, top_k: int = 5):
    # Semantic search
    semantic_results = await semantic_search(query, top_k * 2)
    
    # Keyword search (BM25)
    keyword_results = await bm25_search(query, top_k * 2)
    
    # Combine with reciprocal rank fusion
    combined = reciprocal_rank_fusion(semantic_results, keyword_results)
    
    return combined[:top_k]

def reciprocal_rank_fusion(result_lists, k=60):
    """Combine multiple result lists"""
    scores = {}
    for results in result_lists:
        for rank, result in enumerate(results):
            doc_id = result["id"]
            if doc_id not in scores:
                scores[doc_id] = 0
            scores[doc_id] += 1 / (k + rank)
    
    # Sort by score
    sorted_docs = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    return [{"id": doc_id, "score": score} for doc_id, score in sorted_docs]
```

:::tip CONCEPT: Reranking — Results Ko Improve Karo

:::

```python
# Rerank retrieved results
from sentence_transformers import CrossEncoder

reranker = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')

def rerank(query: str, documents: list, top_k: int = 3):
    """Rerank documents based on relevance"""
    pairs = [(query, doc["content"]) for doc in documents]
    scores = reranker.predict(pairs)
    
    # Sort by reranker score
    ranked = sorted(zip(documents, scores), key=lambda x: x[1], reverse=True)
    return [doc for doc, score in ranked[:top_k]]
```

:::caution CHECKPOINT:
1. Hybrid search kab use karoge? Sirf semantic search kaafi kyun nahi?
2. Reranking kya karta hai? Pehle retrieval kyun nahi hota accurate?

:::

---

## Section 6: Agent Memory — Short-term vs Long-term

:::tip CONCEPT: Memory = Agent Ki Yaaddaash

**Short-term Memory (Session):**
- Current conversation
- Context window mein fit hota hai
- Session khatam hone pe gayab

**Long-term Memory (Persistent):**
- Important information store karta hai
- Vector database mein hota hai
- Sessions ke across yaad rehta hai

**Episodic Memory:**
- Past experiences
- What worked, what didn't
- Self-improvement ke liye

:::

```python
# File: agent_memory.py
from openai import OpenAI
import asyncpg
import json
from datetime import datetime

class AgentMemory:
    def __init__(self, db_url: str):
        self.db_url = db_url
        self.client = OpenAI()
    
    async def remember(self, key: str, value: str, memory_type: str = "fact"):
        """Information store karo"""
        response = self.client.embeddings.create(
            model="text-embedding-3-small",
            input=f"{key}: {value}"
        )
        embedding = response.data[0].embedding
        
        conn = await asyncpg.connect(self.db_url)
        await conn.execute("""
            INSERT INTO agent_memory (key, value, memory_type, embedding, created_at)
            VALUES ($1, $2, $3, $4::vector, $5)
        """, key, value, memory_type, str(embedding), datetime.now())
        await conn.close()
    
    async def recall(self, query: str, memory_type: str = None, top_k: int = 5):
        """Relevant memories recall karo"""
        response = self.client.embeddings.create(
            model="text-embedding-3-small",
            input=query
        )
        query_embedding = response.data[0].embedding
        
        conn = await asyncpg.connect(self.db_url)
        
        if memory_type:
            results = await conn.fetch("""
                SELECT key, value, memory_type,
                       1 - (embedding <=> $1::vector) as similarity
                FROM agent_memory
                WHERE memory_type = $2
                ORDER BY embedding <=> $1::vector
                LIMIT $3
            """, str(query_embedding), memory_type, top_k)
        else:
            results = await conn.fetch("""
                SELECT key, value, memory_type,
                       1 - (embedding <=> $1::vector) as similarity
                FROM agent_memory
                ORDER BY embedding <=> $1::vector
                LIMIT $2
            """, str(query_embedding), top_k)
        
        await conn.close()
        return results
    
    async def forget(self, key: str):
        """Memory delete karo"""
        conn = await asyncpg.connect(self.db_url)
        await conn.execute("DELETE FROM agent_memory WHERE key = $1", key)
        await conn.close()

# Usage
async def main():
    memory = AgentMemory("postgresql://localhost/nexabook")
    
    await memory.remember("user_name", "Ali", "fact")
    await memory.remember("user_preference", "Prefers formal language", "preference")
    
    memories = await memory.recall("What is the user's name?")
    print(memories)
```

### Memory Management

```python
# TTL-based cleanup
async def cleanup_old_memories(max_age_days: int = 30):
    conn = await asyncpg.connect(db_url)
    await conn.execute("""
        DELETE FROM agent_memory 
        WHERE created_at < NOW() - INTERVAL '%s days'
    """, max_age_days)
    await conn.close()

# Importance-based memory
async def remember_with_importance(key: str, value: str, importance: float):
    """Importance score ke saath store karo"""
    conn = await asyncpg.connect(db_url)
    await conn.execute("""
        INSERT INTO agent_memory (key, value, importance, embedding, created_at)
        VALUES ($1, $2, $3, $4::vector, $5)
    """, key, value, importance, str(embedding), datetime.now())
    await conn.close()

# Recall with importance threshold
async def recall_important(query: str, min_importance: float = 0.7):
    """Sirf important memories recall karo"""
    # ... similarity search + importance filter
```

---

## Section 7: Multi-Agent Orchestration

:::tip CONCEPT: Supervisor = Agent Ka Manager

:::

```python
# File: supervisor_agent.py
from openai import OpenAI
from openai.agents import Agent, Runner

client = OpenAI()

researcher = Agent(
    name="Researcher",
    instructions="You research information and provide factual data.",
    model="gpt-4"
)

analyst = Agent(
    name="Analyst",
    instructions="You analyze data and provide insights.",
    model="gpt-4"
)

writer = Agent(
    name="Writer",
    instructions="You write clear, concise reports.",
    model="gpt-4"
)

supervisor = Agent(
    name="Supervisor",
    instructions="""You are a supervisor managing a team of agents.
    
    Team members:
    - Researcher: Gathers information
    - Analyst: Analyzes data
    - Writer: Creates reports
    
    Your job:
    1. Understand the task
    2. Delegate to appropriate agent(s)
    3. Coordinate their work
    4. Ensure quality output""",
    model="gpt-4"
)

result = Runner.run_sync(supervisor, "Research latest AI trends, analyze impact on DevOps, write summary.")
print(result.final_output)
```

### A2A (Agent-to-Agent) Protocol

```python
# Agent-to-Agent communication
class AgentA2A:
    def __init__(self, agent_id: str):
        self.agent_id = agent_id
        self.peers = {}
    
    def register_peer(self, peer_id: str, agent):
        """Register a peer agent"""
        self.peers[peer_id] = agent
    
    async def send_message(self, peer_id: str, message: str):
        """Send message to peer agent"""
        if peer_id in self.peers:
            return await self.peers[peer_id].process(message)
        return "Peer not found"
    
    async def process(self, message: str):
        """Process incoming message"""
        # Handle message from peer
        return f"Processed: {message}"
```

:::caution CHECKPOINT:
1. Supervisor pattern aur peer-to-peer pattern mein kya fark hai?
2. A2A protocol kya hai? Kab use karoge?

:::

---

## Section 8: Reflection & Self-Improvement

:::tip CONCEPT: Reflexion = Agent Apne Aap Ko Improve Kare

:::

```python
# Reflection agent
class ReflexionAgent:
    def __init__(self, llm):
        self.llm = llm
        self.memory = []
    
    async def act(self, task: str):
        """Task perform karo"""
        # Previous reflections se context lo
        context = "\n".join([f"Reflection: {r}" for r in self.memory[-3:]])
        
        response = await self.llm.invoke([
            {"role": "system", "content": f"Previous reflections:\n{context}"},
            {"role": "user", "content": task}
        ])
        return response
    
    async def reflect(self, task: str, result: str, success: bool):
        """Result pe reflect karo"""
        reflection = await self.llm.invoke([
            {"role": "system", "content": "Reflect on this task result. What went well? What could be improved?"},
            {"role": "user", "content": f"Task: {task}\nResult: {result}\nSuccess: {success}"}
        ])
        self.memory.append(reflection.content)
        return reflection.content

# Usage
agent = ReflexionAgent(llm)
result = await agent.act("Deploy nexabook to production")
reflection = await agent.reflect("Deploy nexabook", result, success=True)
```

:::caution CHECKPOINT:
1. Reflexion kaise kaam karta hai? Memory mein kya store hota hai?

:::

---

## Section 9: RAG Evaluation & Production Patterns

:::tip CONCEPT: Evaluate = Tum Pata Karo RAG Sahi Kaam Kar Raha Hai

:::

```python
# RAG evaluation metrics
def evaluate_rag(rag_pipeline, test_cases):
    """Evaluate RAG system"""
    results = {
        "precision": [],
        "recall": [],
        "relevance": [],
        "answer_quality": []
    }
    
    for test in test_cases:
        # Retrieve
        retrieved = await rag_pipeline.search(test["query"])
        
        # Precision: Kitne retrieved relevant hain
        relevant_retrieved = sum(1 for r in retrieved if r["content"] in test["relevant_docs"])
        precision = relevant_retrieved / len(retrieved) if retrieved else 0
        results["precision"].append(precision)
        
        # Recall: Kitne relevant docs retrieve hue
        recall = relevant_retrieved / len(test["relevant_docs"]) if test["relevant_docs"] else 0
        results["recall"].append(recall)
        
        # Answer quality (LLM as judge)
        answer = await rag_pipeline.generate(test["query"], str(retrieved))
        quality = await judge_answer(answer, test["expected_answer"])
        results["answer_quality"].append(quality)
    
    # Average
    for metric in results:
        results[metric] = sum(results[metric]) / len(results[metric])
    
    return results
```

### Production RAG Patterns

```
1. Query Rewriting:
   User query → LLM rewrites → Better retrieval

2. HyDE (Hypothetical Document Embeddings):
   User query → LLM generates hypothetical answer → Embed hypothetical → Search

3. Multi-step Retrieval:
   Query → Retrieve → Refine query → Retrieve again → Combine

4. Contextual Compression:
   Retrieved docs → LLM extracts relevant parts → Smaller context

5. Self-RAG:
   Agent decides when to retrieve, when to use LLM knowledge
```

```python
# Query rewriting
async def rewrite_query(query: str) -> str:
    """Rewrite query for better retrieval"""
    response = await llm.invoke([
        {"role": "system", "content": "Rewrite this query for better search results. Keep it concise."},
        {"role": "user", "content": query}
    ])
    return response.content

# Usage
original_query = "How does Islamic banking work?"
rewritten = await rewrite_query(original_query)
# "Islamic banking principles riba prohibition profit-loss sharing murabaha"
```

:::caution CHECKPOINT:
1. RAG evaluate kaise karoge? Kaunse metrics important hain?
2. Query rewriting kyun zaroori hai?

:::

---

## Summary: Phase 14 Key Takeaways

| Concept | Tumne Kya Seekha |
|---------|-----------------|
| RAG | Retrieval + Generation |
| Embeddings | Text → Vector, similarity |
| Vector DB | pgvector, Pinecone, Chroma |
| Chunking | Fixed, semantic, recursive, markdown |
| Advanced RAG | Hybrid search, reranking |
| Memory | Short-term, long-term, episodic |
| Multi-Agent | Supervisor, A2A protocol |
| Reflexion | Self-improving agents |
| Evaluation | Precision, recall, relevance |

---

## MINI-TASKS

### Task 1: RAG Pipeline (25 min)
Simple RAG banao with:
- pgvector setup
- Document ingestion
- Query → Retrieve → Generate

### Task 2: Hybrid Search (20 min)
Hybrid search implement karo:
- Semantic + keyword search
- Reciprocal rank fusion
- Compare with semantic-only

### Task 3: Agent Memory (20 min)
Memory system banao with:
- Remember facts
- Recall relevant memories
- TTL-based cleanup

### Task 4: Multi-Agent (20 min)
Supervisor agent banao with:
- 3 specialist agents
- Task delegation
- Coordinated output

---

## INCIDENT.md: Practice Scenarios

### Incident #1: Irrelevant Results
- **Date:** (Practice Scenario)
- **What Broke:** RAG irrelevant documents return kar raha hai
- **Root Cause:** Poor chunking or wrong embedding model
- **Fix:**
  ```python
  # Step 1: Chunk size check
  # Zyada bada = irrelevant context
  # Zyada chhota = context loss
  splitter = RecursiveCharacterTextSplitter(
      chunk_size=500,
      chunk_overlap=100
  )

  # Step 2: Embedding model upgrade
  model="text-embedding-3-large"  # More accurate

  # Step 3: Reranking add
  reranker = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')
  reranked = rerank(query, retrieved_docs)

  # Step 4: Metadata filtering
  results = await conn.fetch("""
      SELECT * FROM documents
      WHERE metadata->>'type' = 'policy'
      ORDER BY embedding <=> $1::vector
      LIMIT 5
  """, str(query_embedding))
  ```
- **Prevention:** Chunking strategy test karo, reranking add karo
- **Learning:** Chunk size affects relevance. Reranking improves accuracy.

### Incident #2: Agent Memory Leak
- **Date:** (Practice Scenario)
- **What Broke:** Agent old memories bhool raha hai. Memory bhar rahi hai.
- **Root Cause:** No memory cleanup. TTL nahi hai.
- **Fix:**
  ```python
  # Step 1: TTL add karo
  async def cleanup_old_memories(max_age_days: int = 30):
      conn = await asyncpg.connect(db_url)
      await conn.execute("""
          DELETE FROM agent_memory 
          WHERE created_at < NOW() - INTERVAL '%s days'
      """, max_age_days)
      await conn.close()

  # Step 2: Importance-based cleanup
  async def cleanup_low_importance(min_importance: float = 0.3):
      conn = await asyncpg.connect(db_url)
      await conn.execute("""
          DELETE FROM agent_memory 
          WHERE importance < $1
      """, min_importance)
      await conn.close()

  # Step 3: Memory limit
  async def enforce_memory_limit(max_memories: int = 1000):
      conn = await asyncpg.connect(db_url)
      await conn.execute("""
          DELETE FROM agent_memory 
          WHERE id NOT IN (
              SELECT id FROM agent_memory 
              ORDER BY importance DESC, created_at DESC 
              LIMIT $1
          )
      """, max_memories)
      await conn.close()

  # Step 4: Cron job for cleanup
  # Run daily
  ```
- **Prevention:** Memory management strategy banao, TTL, importance-based
- **Learning:** Memory needs management. Without cleanup, it grows forever.

### Incident #3: Multi-Agent Coordination Failure
- **Date:** (Practice Scenario)
- **What Broke:** Agents ek dusre se baat nahi kar pa rahe. Tasks lost ho rahe hain.
- **Root Cause:** No shared context. Agents isolated hain.
- **Fix:**
  ```python
  # Step 1: Shared state banao
  shared_context = {
      "current_task": None,
      "completed_steps": [],
      "pending_steps": [],
      "results": {}
  }

  # Step 2: Communication protocol
  class AgentMessage:
      def __init__(self, sender: str, recipient: str, content: str):
          self.sender = sender
          self.recipient = recipient
          self.content = content
          self.timestamp = datetime.now()

  # Step 3: Message queue
  message_queue = []

  def send_message(msg: AgentMessage):
      message_queue.append(msg)

  def process_messages(agent_id: str):
      agent_messages = [m for m in message_queue if m.recipient == agent_id]
      for msg in agent_messages:
          # Process message
          pass

  # Step 4: Shared memory
  shared_memory = {}
  def store_result(key: str, value: str):
      shared_memory[key] = value
  def get_result(key: str):
      return shared_memory.get(key)
  ```
- **Prevention:** Clear communication protocol, shared state, message queue
- **Learning:** Multi-agent = team. Team needs communication.

### Incident #4: Vector DB Slow Queries
- **Date:** (Practice Scenario)
- **What Broke:** RAG response > 5 seconds. Users waiting.
- **Root Cause:** No index on vector column. Full table scan.
- **Fix:**
  ```sql
  -- Step 1: Index create
  CREATE INDEX ON documents 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

  -- Step 2: HNSW index (better for small datasets)
  CREATE INDEX ON documents 
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 200);

  -- Step 3: Analyze
  ANALYZE documents;
  ```

  ```python
  # Step 4: Connection pooling
  import asyncpg
  pool = await asyncpg.create_pool(
      "postgresql://localhost/nexabook",
      min_size=5,
      max_size=20
  )

  # Step 5: Caching
  from functools import lru_cache

  @lru_cache(maxsize=100)
  def cached_search(query_hash: str):
      return await search_documents(query_embedding, top_k=5)
  ```
- **Prevention:** Indexes during setup, connection pooling, caching
- **Learning:** Vector search without index = full table scan = slow.

### Incident #5: Embedding Dimension Mismatch
- **Date:** (Practice Scenario)
- **What Broke:** Cannot insert embeddings. "dimension mismatch" error.
- **Root Cause:** Wrong vector dimension in DB column.
- **Fix:**
  ```python
  # Step 1: Check embedding dimension
  embedding = client.embeddings.create(
      model="text-embedding-3-small",
      input="test"
  )
  dim = len(embedding.data[0].embedding)
  print(f"Dimension: {dim}")  # 1536

  # Step 2: Verify DB column
  # ALTER TABLE documents ALTER COLUMN embedding TYPE vector(1536);

  # Step 3: Re-create if needed
  DROP TABLE IF EXISTS documents;
  CREATE TABLE documents (
      id SERIAL PRIMARY KEY,
      content TEXT,
      embedding vector(1536),  -- Match model dimension
      metadata JSONB
  );

  # Step 4: Re-ingest documents
  # All existing embeddings need to be regenerated
  ```
- **Prevention:** Verify dimensions during setup, test with sample data first
- **Learning:** Different models = different dimensions. Always verify.
