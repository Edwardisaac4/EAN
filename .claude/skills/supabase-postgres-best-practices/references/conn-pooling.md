---
title: Use Connection Pooling for All Applications
impact: CRITICAL
impactDescription: Handle 10-100x more concurrent users
tags: connection-pooling, pgbouncer, performance, scalability
---

## Use Connection Pooling for All Applications

Postgres connections are expensive (1-3MB RAM each). Without pooling, applications exhaust connections under load.

**Incorrect (new connection per request):**

```sql
-- Each request creates a new connection
-- Application code: db.connect() per request
-- Result: 500 concurrent users = 500 connections = crashed database

-- Check current connections
select count(*) from pg_stat_activity;  -- 487 connections!
```

**Correct (connection pooling):**

```sql
-- Use a pooler like Supavisor or PgBouncer between app and database
-- Application connects to pooler, pooler reuses a small pool of backend connections

-- Size pools based on measured workload, peak concurrency, and instance tier limits
-- while reserving connections for direct admin/migrations (e.g. 80% pool / 20% reserved)

-- Result: Concurrent application requests share a small pool of active backend connections
select count(*) from pg_stat_activity;
```

Pool modes:

- **Transaction mode**: connection returned after each transaction (best for serverless / stateless web apps)
- **Session mode**: connection held for entire session (needed for prepared statements, temp tables, LISTEN/NOTIFY)

Reference: [Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
