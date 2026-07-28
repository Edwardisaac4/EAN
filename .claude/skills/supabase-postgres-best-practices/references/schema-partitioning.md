---
title: Partition Large Tables for Better Performance
impact: MEDIUM-HIGH
impactDescription: 5-20x faster queries and maintenance on large tables
tags: partitioning, large-tables, time-series, performance
---

## Partition Large Tables for Better Performance

Partitioning splits a large table into smaller pieces, improving query performance and maintenance operations.

**Incorrect (single large table):**

```sql
create table events (
  id bigint generated always as identity,
  created_at timestamptz,
  data jsonb
);

-- 500M rows, queries scan everything
select * from events where created_at > '2024-01-01';  -- Slow
vacuum events;  -- Takes hours, locks table
```

**Correct (partitioned by time range with default partition):**

```sql
create table events (
  id bigint generated always as identity,
  created_at timestamptz not null,
  data jsonb
) partition by range (created_at);

-- Create partitions for specific monthly ranges
create table events_2024_01 partition of events
  for values from ('2024-01-01') to ('2024-02-01');

create table events_2024_02 partition of events
  for values from ('2024-02-01') to ('2024-03-01');

-- Catch-all default partition for out-of-range dates (prevents insert errors).
-- Note: Rows in default partition overlapping future ranges must be removed/relocated before attaching new partitions.
create table events_default partition of events default;

-- Query filtering created_at between '2024-01-15' and '2024-02-15' scans only events_2024_01 and events_2024_02
select * from events where created_at >= '2024-01-15' and created_at < '2024-02-15';

-- Fast data removal (drops table file, but acquires an ACCESS EXCLUSIVE lock on the parent table):
drop table events_2024_01;
```

When to partition:

- Tables > 100M rows
- Time-series data with date-based queries
- Need to efficiently drop old data

Reference: [Table Partitioning](https://www.postgresql.org/docs/current/ddl-partitioning.html)
