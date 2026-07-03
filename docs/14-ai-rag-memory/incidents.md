---
sidebar_position: 16
title: "Phase 14: Incident Log"
description: "Real-world incident scenarios for Phase 14"
---

# INCIDENT LOG — Phase: AI RAG & Memory

---

## Incident #1: Irrelevant Results
- **Date:** (Practice Scenario)
- **What Broke:** RAG irrelevant documents return kar raha hai
- **Root Cause:** Poor chunking or wrong embedding model
- **Fix:**
  ```python
  # Step 1: Chunk size check
  splitter = RecursiveCharacterTextSplitter(
      chunk_size=500,
      chunk_overlap=100
  )

  # Step 2: Embedding model upgrade
  model="text-embedding-3-large"

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
- **Learning:** Chunk size affects relevance.

---

## Incident #2: Agent Memory Leak
- **Date:** (Practice Scenario)
- **What Broke:** Agent old memories bhool raha hai. Memory bhar rahi hai.
- **Root Cause:** No memory cleanup.
- **Fix:**
  ```python
  # Step 1: TTL add
  async def cleanup_old_memories(max_age_days: int = 30):
      conn = await asyncpg.connect(db_url)
      await conn.execute("""
          DELETE FROM agent_memory 
          WHERE created_at < NOW() - INTERVAL '%s days'
      """, max_age_days)

  # Step 2: Importance-based cleanup
  async def cleanup_low_importance(min_importance: float = 0.3):
      conn = await asyncpg.connect(db_url)
      await conn.execute("""
          DELETE FROM agent_memory 
          WHERE importance < $1
      """, min_importance)

  # Step 3: Memory limit
  async def enforce_memory_limit(max_memories: int = 1000):
      conn = await asyncpg.connect(db_url)
      await conn.execute("""
          DELETE FROM agent_memory 
          WHERE id NOT IN (
              SELECT id FROM agent_memory 
              ORDER BY importance DESC 
              LIMIT $1
          )
      """, max_memories)
  ```
- **Prevention:** Memory management strategy banao
- **Learning:** Memory needs management.

---

## Incident #3: Multi-Agent Coordination Failure
- **Date:** (Practice Scenario)
- **What Broke:** Agents ek dusre se baat nahi kar pa rahe
- **Root Cause:** No shared context
- **Fix:**
  ```python
  # Step 1: Shared state
  shared_context = {
      "current_task": None,
      "completed_steps": [],
      "results": {}
  }

  # Step 2: Communication protocol
  class AgentMessage:
      def __init__(self, sender, recipient, content):
          self.sender = sender
          self.recipient = recipient
          self.content = content

  # Step 3: Message queue
  message_queue = []

  # Step 4: Shared memory
  shared_memory = {}
  ```
- **Prevention:** Clear communication protocol
- **Learning:** Multi-agent = team. Team needs communication.

---

## Incident #4: Vector DB Slow Queries
- **Date:** (Practice Scenario)
- **What Broke:** RAG response > 5 seconds
- **Root Cause:** No index on vector column
- **Fix:**
  ```sql
  CREATE INDEX ON documents 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

  ANALYZE documents;
  ```

  ```python
  # Connection pooling
  pool = await asyncpg.create_pool(
      "postgresql://localhost/nexabook",
      min_size=5,
      max_size=20
  )

  # Caching
  @lru_cache(maxsize=100)
  def cached_search(query_hash):
      return await search_documents(query_embedding)
  ```
- **Prevention:** Indexes during setup, connection pooling
- **Learning:** Vector search without index = slow.

---

## Incident #5: Embedding Dimension Mismatch
- **Date:** (Practice Scenario)
- **What Broke:** Cannot insert embeddings. Dimension mismatch error.
- **Root Cause:** Wrong vector dimension in DB column.
- **Fix:**
  ```python
  # Step 1: Check dimension
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
      embedding vector(1536),
      metadata JSONB
  );
  ```
- **Prevention:** Verify dimensions during setup
- **Learning:** Different models = different dimensions.
