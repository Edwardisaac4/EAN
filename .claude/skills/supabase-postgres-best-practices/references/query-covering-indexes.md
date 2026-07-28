---
title: Use Covering Indexes to Avoid Table Lookups
impact: MEDIUM-HIGH
impactDescription: 2-5x faster queries by reducing heap fetches
tags: indexes, covering-index, include, index-only-scan
---

## Use Covering Indexes to Avoid Table Lookups

Covering indexes include payload columns via `INCLUDE`, enabling Index-Only Scans that reduce table heap fetches. Note that Index-Only Scans still perform heap fetches for un-VACUUMed rows where visibility-map bits are unset, and wider covering indexes increase storage size, write overhead, and maintenance costs.

**Incorrect (index scan + heap fetch for non-indexed columns):**

```sql
create index users_email_idx on users (email);

-- Must fetch name and created_at from table heap
select email, name, created_at from users where email = 'user@example.com';
```

**Correct (Index-Only Scan enabled with INCLUDE):**

```sql
-- Include non-key payload columns in index
create index users_email_idx on users (email) include (name, created_at);

-- Serves query from index (enables Index-Only Scan; heap access avoided when visibility map is clean)
select email, name, created_at from users where email = 'user@example.com';
```

Use INCLUDE for columns you SELECT but don't filter on:

```sql
-- Searching by status, but also need customer_id and total
create index orders_status_idx on orders (status) include (customer_id, total);

select status, customer_id, total from orders where status = 'shipped';
```

Reference: [Index-Only Scans](https://www.postgresql.org/docs/current/indexes-index-only-scans.html)
