---
title: Select Optimal Primary Key Strategy
impact: HIGH
impactDescription: Better index locality, reduced fragmentation
tags: primary-key, identity, uuid, serial, schema
---

## Select Optimal Primary Key Strategy

Primary key choice affects insert performance, index size, and replication efficiency.

**Incorrect (problematic PK choices):**

```sql
-- legacy SERIAL type (works, but IDENTITY is SQL-standard)
create table users (
  id serial primary key
);

-- Random UUIDs (v4) cause B-tree index fragmentation under heavy load
create table orders (
  id uuid default gen_random_uuid() primary key  -- UUIDv4 = random = scattered inserts
);
```

**Correct (optimal PK strategies):**

```sql
-- Use IDENTITY for sequential IDs (SQL-standard, best for most cases)
create table users (
  id bigint generated always as identity primary key
);

-- For distributed systems needing UUIDs, use UUIDv7 (time-ordered sequential UUIDs)
-- Native uuidv7() built-in available in PostgreSQL 18+ (or client-side UUIDv7 library / pg_uuidv7 extension on older Postgres)
create table orders (
  id uuid default uuidv7() primary key  -- Time-ordered, improves B-tree index locality
);

-- Alternative: time-prefixed text IDs for sortable, distributed IDs
create table events (
  id text default concat(
    to_char(now() at time zone 'utc', 'YYYYMMDDHH24MISSMS'),
    gen_random_uuid()::text
  ) primary key
);
```

Guidelines:

- Single database: `bigint identity` (sequential, 8 bytes, SQL-standard)
- Distributed/exposed IDs: UUIDv7 (improves index locality over random UUIDv4)
- `serial` works, but `identity` is SQL-standard and preferred for new schemas
- Avoid random UUIDs (v4) as primary keys on large, high-write tables to reduce B-tree fragmentation

Reference: [Data Types - UUID](https://www.postgresql.org/docs/current/datatype-uuid.html)
