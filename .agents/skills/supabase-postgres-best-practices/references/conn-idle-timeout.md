---
title: Configure Idle Connection Timeouts
impact: HIGH
impactDescription: Reclaim 30-50% of connection slots from idle clients
tags: connections, timeout, idle, resource-management
---

## Configure Idle Connection Timeouts

Idle connections waste resources. Configure timeouts to automatically reclaim them. Note: In pooled Supabase deployments, avoid global `idle_session_timeout` via `ALTER SYSTEM` as it can disconnect pooler backends; scope `idle_session_timeout` to interactive roles or pooler settings instead.

**Incorrect (connections held indefinitely):**

```sql
-- No timeout configured
show idle_in_transaction_session_timeout;  -- 0 (disabled)

-- Connections stay open forever, even when idle
select pid, state, state_change, query
from pg_stat_activity
where state = 'idle in transaction';
-- Shows transactions idle for hours, holding locks
```

**Correct (automatic cleanup of idle connections):**

```sql
-- Terminate transactions idle in transaction after 30 seconds (safe server default)
alter system set idle_in_transaction_session_timeout = '30s';

-- For idle sessions in self-hosted Postgres or scoped to specific interactive roles:
alter role interactive_user set idle_session_timeout = '10min';

-- Reload configuration
select pg_reload_conf();
```

For pooled connections (Supavisor / PgBouncer), configure idle timeouts at the pooler level:

```ini
# pgbouncer.ini
server_idle_timeout = 60
client_idle_timeout = 300
```

Reference: [Connection Timeouts](https://www.postgresql.org/docs/current/runtime-config-client.html#GUC-IDLE-IN-TRANSACTION-SESSION-TIMEOUT)
