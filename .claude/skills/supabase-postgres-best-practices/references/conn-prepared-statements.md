---
title: Use Prepared Statements Correctly with Pooling
impact: HIGH
impactDescription: Avoid prepared statement conflicts in pooled environments
tags: prepared-statements, connection-pooling, transaction-mode
---

## Use Prepared Statements Correctly with Pooling

Prepared statements are tied to individual database connections. In transaction-mode pooling, connections are shared across client requests, causing statement conflicts.

**Incorrect (named prepared statements across commands with transaction pooling):**

```sql
-- Named prepared statement created across autocommit commands
prepare get_user as select * from users where id = $1;

-- In transaction mode pooling, next request may get a different connection
execute get_user(123);
-- ERROR: prepared statement "get_user" does not exist
```

**Correct (use unnamed statements, explicit transaction block, or session mode):**

```sql
-- Option 1: Use unnamed prepared statements (most ORMs/drivers do this automatically)
-- The query is prepared and executed in a single protocol message

-- Option 2: Execute and deallocate within an explicit transaction block
begin;
prepare get_user as select * from users where id = $1;
execute get_user(123);
deallocate get_user;
commit;

-- Option 3: Use session mode pooling
-- Connection is held for entire session, allowing prepared statements to persist
```

Driver configuration guidance:

```text
-- Node.js pg: Omit the `name` property from query config to use unnamed statements
-- JDBC: prepareThreshold=0 to disable server-side prepared statement caching
```

Reference: [Prepared Statements with Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pool-modes)
