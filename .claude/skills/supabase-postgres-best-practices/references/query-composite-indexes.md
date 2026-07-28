---
title: Create Composite Indexes for Multi-Column Queries
impact: HIGH
impactDescription: 5-10x faster multi-column queries
tags: indexes, composite-index, multi-column, query-optimization
---

## Create Composite Indexes for Multi-Column Queries

When queries frequently filter on multiple columns together, a composite index can provide an efficient single-index path. PostgreSQL's planner chooses execution plans based on data selectivity—it may use a composite index, combine separate indexes via Bitmap Index Scans, or use a single index. Validate query plans with `EXPLAIN (ANALYZE, BUFFERS)`.

**Incorrect (separate single-column indexes for multi-column filters):**

```sql
-- Two separate single-column indexes
create index orders_status_idx on orders (status);
create index orders_created_idx on orders (created_at);

-- Query may require combining indexes via BitmapAnd scan or scanning one index
select * from orders where status = 'pending' and created_at > '2024-01-01';
```

**Correct (composite index):**

```sql
-- Single composite index (equality columns first, range columns last)
create index orders_status_created_idx on orders (status, created_at);

-- Query can use a direct composite index scan
select * from orders where status = 'pending' and created_at > '2024-01-01';
```

**Column order matters** - place equality columns first, range columns last:

```sql
-- Good: status (=) before created_at (>)
create index idx on orders (status, created_at);

-- Works for: WHERE status = 'pending'
-- Works for: WHERE status = 'pending' AND created_at > '2024-01-01'
-- Queries omitting leading index columns (e.g. WHERE created_at > '2024-01-01') may be inefficient or bypassed depending on PostgreSQL version and statistics (note: PostgreSQL 18+ supports B-tree skip scans). Always verify with EXPLAIN (ANALYZE, BUFFERS).
```

Reference: [Multicolumn Indexes](https://www.postgresql.org/docs/current/indexes-multicolumn.html)
