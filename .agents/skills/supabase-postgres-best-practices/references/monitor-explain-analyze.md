---
title: Use EXPLAIN ANALYZE to Diagnose Slow Queries
impact: LOW-MEDIUM
impactDescription: Identify exact bottlenecks in query execution
tags: explain, analyze, diagnostics, query-plan
---

## Use EXPLAIN ANALYZE to Diagnose Slow Queries

`EXPLAIN ANALYZE` executes the query and shows actual execution timings and buffer usage. **WARNING:** Because `EXPLAIN ANALYZE` actually executes the statement, running it on `INSERT`, `UPDATE`, or `DELETE` statements will mutate data! Use plain `EXPLAIN` for mutations or wrap in a transaction with `ROLLBACK` (`begin; explain analyze update ...; rollback;`).

**Incorrect (guessing at performance issues):**

```sql
-- Query is slow, but why?
select * from orders where customer_id = 123 and status = 'pending';
-- "It must be missing an index" - but which one?
```

**Correct (use EXPLAIN ANALYZE):**

```sql
explain (analyze, buffers, format text)
select * from orders where customer_id = 123 and status = 'pending';

-- Output reveals the execution details:
-- Seq Scan on orders (cost=0.00..25000.00 rows=50 width=100) (actual time=0.015..450.123 rows=50 loops=1)
--   Filter: ((customer_id = 123) AND (status = 'pending'::text))
--   Rows Removed by Filter: 999950
--   Buffers: shared hit=5000 read=15000
-- Planning Time: 0.150 ms
-- Execution Time: 450.500 ms
```

Key indicators to analyze (evaluating planner estimates, selectivity, and memory pressure):

```sql
-- Seq Scan: Normal for small tables or low-selectivity queries; may indicate missing index if filtering high-selectivity queries on large tables
-- Rows Removed by Filter: High counts relative to output rows suggest potential indexing candidates
-- Buffers (read vs hit): High `read` indicates disk I/O dependency; high `hit` indicates buffer cache usage
-- Sort Method: external merge: Indicates disk-based sorting; evaluate increasing work_mem for the query
```

Reference: [EXPLAIN](https://supabase.com/docs/guides/database/inspect)
