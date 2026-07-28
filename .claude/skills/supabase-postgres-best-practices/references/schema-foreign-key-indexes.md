---
title: Index Foreign Key Columns
impact: HIGH
impactDescription: 10-100x faster JOINs and CASCADE operations
tags: foreign-key, indexes, joins, schema
---

## Index Foreign Key Columns

Postgres does not automatically index foreign key columns. Missing indexes cause slow JOINs and CASCADE operations.

**Incorrect (unindexed foreign key):**

```sql
create table orders (
  id bigint generated always as identity primary key,
  customer_id bigint references customers(id) on delete cascade,
  total numeric(10,2)
);

-- No index on customer_id!
-- JOINs and ON DELETE CASCADE both require full table scan
select * from orders where customer_id = 123;  -- Seq Scan
delete from customers where id = 123;          -- Locks table, scans all orders
```

**Correct (indexed foreign key):**

```sql
create table orders (
  id bigint generated always as identity primary key,
  customer_id bigint references customers(id) on delete cascade,
  total numeric(10,2)
);

-- Always index the FK column
create index orders_customer_id_idx on orders (customer_id);

-- Now JOINs and cascades are fast
select * from orders where customer_id = 123;  -- Index Scan
delete from customers where id = 123;          -- Uses index, fast cascade
```

Find missing FK indexes (matching complete FK column order against index leading columns):

```sql
select
  c.conrelid::regclass as table_name,
  c.conname as fk_name,
  pg_get_constraintdef(c.oid) as fk_definition
from pg_constraint c
where c.contype = 'f'
  and not exists (
    select 1 from pg_index i
    where i.indrelid = c.conrelid
      and i.indkey[0 : cardinality(c.conkey) - 1] = c.conkey
      and i.indpred is null
      and i.indisvalid
      and i.indisready
  );
```

Reference: [Foreign Keys](https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-FK)
