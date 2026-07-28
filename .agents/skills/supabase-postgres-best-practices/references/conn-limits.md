---
title: Set Appropriate Connection Limits
impact: CRITICAL
impactDescription: Prevent database crashes and memory exhaustion
tags: connections, max-connections, limits, stability
---

## Set Appropriate Connection Limits

Too many connections exhaust memory and degrade performance. Set limits based on available resources.

**Incorrect (unlimited or excessive connections):**

```sql
-- Default max_connections = 100, but often increased blindly
show max_connections;  -- 500 (way too high for 4GB RAM)

-- Each connection uses RAM for buffers and working memory
-- 500 connections can cause Out Of Memory (OOM) errors under load
```

**Correct (calculate based on resources):**

```sql
-- Recommended settings for 4GB RAM
alter system set max_connections = 100;

-- Size work_mem based on workload analysis (accounting for concurrent sort/hash
-- operations per query, active parallel workers, and active session concurrency)
alter system set work_mem = '8MB';
```

Monitor connection usage:

```sql
select count(*), state from pg_stat_activity group by state;
```

Reference: [Database Connections](https://supabase.com/docs/guides/platform/performance#connection-management)
