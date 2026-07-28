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

> Note: The settings below are illustrative examples for a 4GB RAM node. Both `max_connections` and `work_mem` must be calculated based on deployment resources and workload concurrency. For managed Supabase instances, connection limits are managed automatically via Dashboard settings.

```sql
-- Illustrative example settings (derived from server memory & concurrency):
-- max_connections = 100;
-- work_mem = '8MB'; (based on workload analysis accounting for active parallel workers)
```

Monitor connection usage:

```sql
select count(*), state from pg_stat_activity group by state;
```

Reference: [Database Connections](https://supabase.com/docs/guides/platform/performance#connection-management)
