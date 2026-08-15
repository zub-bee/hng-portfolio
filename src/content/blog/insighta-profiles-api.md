# Quick Context

Insighta Profiles API is a simulated high-performance demographic intelligence engine built as a hands-on backend engineering case study to practice production-grade system design. It mimics a real-world platform for processing, querying, and managing large-scale demographic datasets. Over three stages of development, I built the relational profile database, added a rule-based Natural Language Query (NLQ) engine, established a secure RBAC system with GitHub OAuth + PKCE, and optimized the platform to handle concurrent traffic with 1M+ profiles and large-scale CSV ingestion of up to 500,000 rows.

# Problem Statement

To simulate realistic growth constraints on demographic intelligence services, the challenge required solving several key system problems:

- Clients cannot filter or query profiles across multiple combined conditions efficiently.
- Clients lack a way to express queries in natural language, forcing them to use complex parameters.
- Standard authentication is insufficient for both browser-based and command-line clients.
- Remotely-hosted database latency and repeated identical queries under heavy load threaten availability.
- Operations require bulk CSV data uploads (up to 500,000 rows) without degrading concurrent read query performance.

# Architecture Decisions

- **Express.js + PostgreSQL + Redis**: I utilized PostgreSQL to store structured profile records with custom indexes, paired with Redis to handle session storage, access token blacklisting, and response caching. Redis caching cuts latency to under 10ms for repeated queries, shielding PostgreSQL from simulated read pressure under load.
- **Unified Auth with GitHub OAuth + PKCE (S256)**: To support both the Web Portal and the CLI securely under one auth provider, I implemented GitHub OAuth 2.0 using the Proof Key for Code Exchange (PKCE) flow.
  - **Trade-off**: The Web Portal stores short-lived tokens in HTTP-only, Secure, SameSite cookies to protect against XSS and CSRF. The CLI, which has no cookies, exchanges the PKCE code and verifier via a dedicated CLI callback and stores credentials locally in `~/.insighta/credentials.json`, communicating via the `Authorization: Bearer` header.
- **Rule-Based Natural Language Query Parser**: To support search without the overhead of slow, expensive, and non-deterministic LLMs, I built a rule-based parser that maps plain English queries (e.g., _"young males from nigeria"_) to structured SQL filter criteria.

# Implementation Highlights

- **Canonical Query Normalization**: Users search for the same data in different ways (e.g., _"Nigerian females between 20 and 45"_ and _"Women aged 20-45 living in Nigeria"_). To prevent redundant cache misses, I implemented a normalization middleware. The parser translates any query into a canonical filter object with sorted keys. This object is hashed using SHA-1 to generate a deterministic cache key. If the hash matches, Redis serves the response instantly, bypassing PostgreSQL entirely.
- **Memory-Efficient Streaming CSV Ingest**: Inserting 500,000 rows could easily crash a server if fully loaded into memory. I constructed a pipeline where `busboy` streams `multipart/form-data` uploads, piping the stream into `csv-parse` as an async iterator. The parser processes rows in chunks, validates them, and pushes them in 500-row batches using a multi-row `INSERT ... ON CONFLICT (name) DO NOTHING` statement.
- **Role-Based Access Control**: Standardized middlewares enforce `admin` and `analyst` scopes. Analysts are restricted to query and dashboard endpoints, while Admins retain full write operations and CSV export permissions.

# Challenges and Fixes

- **The Challenge (Transient Database Errors and Memory Bloat during CSV Uploads)**: During early testing, large CSV file uploads caused memory spikes and blocked all read query endpoints, resulting in server timeouts.
- **How I Debugged It**: I used Node's built-in heap profile analyzer and database logs. I realized that loading the entire CSV into memory before parsing, coupled with single-row SQL inserts, exhausted the connection pool and led to full-table write-locks.
- **Final Fix**: I refactored the CSV upload handler to use streaming parsing. I established a batch buffer of 500 records. Using `pg.Pool` connection pooling and batch inserts dramatically reduced query overhead. By writing a custom deduplication `Set` for names within each batch and using `ON CONFLICT DO NOTHING`, I prevented database lock contention. The ingestion process now runs concurrently without degrading the read endpoints' performance.

# Outcomes

- **Query Latency Reduction**: P50 query latency dropped from **515ms** (unindexed, no cache) to **450ms** with Redis caching, and down to under **10ms** on hot cache hits.
- **Resource Consumption**: CSV ingestion processes files up to 500,000 rows with a memory footprint capped under **100MB**, achieving a throughput of over **5,000 rows/second** while maintaining 99.9% uptime for read requests.
- **Zero-Interruption Partial Ingestion**: Malformed rows, duplicate names, or database failures within a chunk are logged and skipped, allowing valid rows to insert successfully and returning a detailed execution summary.

# Lessons Learned

- **Plan for Scale Early**: Designing composite indexes (like `(country_id, gender)`) and setting up connection pools before scaling the database saved significant effort when the dataset reached 1M+ rows.
- **Deter Deterministic Caching**: Caching raw strings is a trap. Normalizing the underlying filters before caching is critical to achieving high cache hit rates in demographic search systems.
- **Simplicity Wins**: Avoiding LLMs for parsing and instead writing a deterministic regex-based NLP parser made the system incredibly fast, cheap, and robust.
