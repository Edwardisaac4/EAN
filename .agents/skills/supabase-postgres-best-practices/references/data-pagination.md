---
title: Use Cursor-Based Pagination Instead of OFFSET
impact: MEDIUM-HIGH
impactDescription: Consistent index-backed performance regardless of page depth
tags: pagination, cursor, keyset, offset, performance
---

## Use Cursor-Based Pagination Instead of OFFSET

OFFSET-based pagination scans and discards all skipped rows, becoming progressively slower on deeper pages. Keyset (cursor) pagination uses an index on ordered columns for fast page lookups whose cost is largely independent of page depth, providing stable ordering.

**Incorrect (OFFSET pagination):**

```sql
-- Page 1: scans 20 rows
select * from products order by id limit 20 offset 0;

-- Page 100: scans 2000 rows to skip 1980
select * from products order by id limit 20 offset 1980;

-- Deep page: scans hundreds of thousands of rows ($offset = driver parameter):
select * from products order by id limit 20 offset $offset;
```

**Correct (cursor/keyset pagination):**

```sql
-- Page 1: get first 20
select * from products order by id limit 20;
-- Application driver records the last returned ID ($last_id)

-- Page 2: seek directly after last ID ($last_id = driver parameter)
select * from products where id > $last_id order by id limit 20;

-- Deep page: fast index seek regardless of depth when index exists on ordered cursor columns
select * from products where id > $last_id order by id limit 20;
```

For multi-column sorting (note: `created_at` must be `NOT NULL` for tuple comparisons):

```sql
-- Cursor must include all sort columns to guarantee stable ordering ($last_created_at, $last_id = driver parameters):
select * from products
where (created_at, id) > ($last_created_at, $last_id)
order by created_at, id
limit 20;
```

Reference: [Pagination](https://supabase.com/docs/guides/database/pagination)
