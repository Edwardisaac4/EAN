---
title: Enable Row Level Security for Multi-Tenant Data
impact: CRITICAL
impactDescription: Database-enforced tenant isolation, prevent data leaks
tags: rls, row-level-security, multi-tenant, security
---

## Enable Row Level Security for Multi-Tenant Data

Row Level Security (RLS) enforces data access policies directly at the database level, ensuring users can only access their authorized data.

**Incorrect (application-level filtering only):**

```sql
-- Relying only on application queries to filter user data
select * from orders where user_id = $current_user_id;

-- Any missing WHERE clause or API vulnerability exposes all rows!
select * from orders;  -- Returns ALL rows across all tenants
```

**Correct (database-enforced RLS using auth.uid()):**

```sql
-- Enable RLS on the table
alter table orders enable row level security;

-- Create policy enforcing tenant access via trusted Supabase auth.uid()
create policy orders_user_policy on orders
  for select
  to authenticated
  using (user_id = auth.uid());

-- Force RLS even for table owners (prevents accidental bypass)
alter table orders force row level security;
```

Write policy patterns for authenticated operations:

```sql
-- Insert policy requiring inserted row user_id to match authenticated caller
create policy orders_insert_policy on orders
  for insert
  to authenticated
  with check (user_id = auth.uid());
```

Reference: [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
