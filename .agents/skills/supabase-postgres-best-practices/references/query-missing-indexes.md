---
title: Add Indexes on WHERE and JOIN Columns
impact: CRITICAL
impactDescription: 100-1000x faster queries on large tables
tags: indexes, performance, sequential-scan, query-optimization
---

## Add Indexes on WHERE and JOIN Columns

Queries filtering or joining on unindexed columns can trigger full table scans whose overhead scales with table size.

**Incorrect (sequential scan on large table):**

```sql
-- Unindexed customer_id column can cause full table scan on large datasets
select * from orders where customer_id = 123;

-- Illustrative EXPLAIN plan: Seq Scan on orders (cost=0.00..25000.00 rows=100 width=85)
```

**Correct (index scan):**

```sql
-- Create index on frequently filtered/joined column
create index orders_customer_id_idx on orders (customer_id);

select * from orders where customer_id = 123;

-- Illustrative EXPLAIN plan: Index Scan using orders_customer_id_idx (cost=0.42..8.44 rows=100 width=85)
```

For foreign keys, index columns when join, update, or delete query patterns benefit:

```sql
-- Index foreign key column used in joins
create index orders_customer_id_idx on orders (customer_id);

select c.name, o.total
from customers c
join orders o on o.customer_id = c.id;
```

Reference: [Query Optimization](https://supabase.com/docs/guides/database/query-optimization)
