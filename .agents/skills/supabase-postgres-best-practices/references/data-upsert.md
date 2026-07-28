---
title: Use UPSERT for Insert-or-Update Operations
impact: MEDIUM
impactDescription: Atomic operation, eliminates check-then-insert race conditions
tags: upsert, on-conflict, insert, update
---

## Use UPSERT for Insert-or-Update Operations

Using separate SELECT-then-INSERT/UPDATE creates check-then-insert race conditions. Use `INSERT ... ON CONFLICT` with a prerequisite UNIQUE constraint or index for atomic upserts.

**Incorrect (check-then-insert race condition):**

```sql
-- Prerequisite unique constraint on settings(user_id, key) exists
-- Race condition: two requests check simultaneously
select * from settings where user_id = 123 and key = 'theme';
-- Both find nothing

-- Both try to insert
insert into settings (user_id, key, value) values (123, 'theme', 'dark');
-- One succeeds, one fails with duplicate key error!
```

**Correct (atomic UPSERT requiring UNIQUE constraint/index on conflict target):**

```sql
-- Requires unique constraint/index: ALTER TABLE settings ADD CONSTRAINT settings_user_key_key UNIQUE (user_id, key);

-- Single atomic operation
insert into settings (user_id, key, value)
values (123, 'theme', 'dark')
on conflict (user_id, key)
do update set value = excluded.value, updated_at = now();

-- Returns the inserted/updated row
insert into settings (user_id, key, value)
values (123, 'theme', 'dark')
on conflict (user_id, key)
do update set value = excluded.value, updated_at = now()
returning *;
```

Insert-or-ignore pattern:

```sql
-- Requires unique constraint/index: ALTER TABLE page_views ADD CONSTRAINT page_views_page_user_key UNIQUE (page_id, user_id);
insert into page_views (page_id, user_id)
values (1, 123)
on conflict (page_id, user_id) do nothing;
```

Reference: [INSERT ON CONFLICT](https://www.postgresql.org/docs/current/sql-insert.html#SQL-ON-CONFLICT)
