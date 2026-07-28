---
title: Keep Transactions Short to Reduce Lock Contention
impact: MEDIUM-HIGH
impactDescription: 3-5x throughput improvement, fewer deadlocks
tags: transactions, locking, contention, performance
---

## Keep Transactions Short to Reduce Lock Contention

Long-running transactions hold locks that block other queries. Keep transactions as short as possible.

**Incorrect (long transaction with external calls):**

```sql
begin;
select * from orders where id = 1 for update;  -- Lock acquired

-- Application makes HTTP call to payment API (2-5 seconds)
-- Other queries on this row are blocked!

update orders set status = 'paid' where id = 1;
commit;  -- Lock held for entire duration
```

**Correct (minimal transaction scope with idempotency):**

```sql
-- 1. Perform external calls outside transaction using a durable idempotency key:
-- const idempotencyKey = `order_${orderId}_payment`;
-- const response = await paymentAPI.charge({ amount, idempotencyKey });

-- 2. Only hold database lock for the brief status update (with reconciliation handling):
begin;
update orders
set status = 'paid', payment_id = $1
where id = $2 and status = 'pending'
returning *;
commit;  -- Lock held for milliseconds
```

Use `statement_timeout` to prevent runaway transactions:

```sql
-- Global or session timeout:
set statement_timeout = '30s';

-- Transaction-scoped timeout (SET LOCAL must run inside a transaction block):
begin;
set local statement_timeout = '5s';
-- ... short queries ...
commit;
```

Reference: [Transaction Management](https://www.postgresql.org/docs/current/tutorial-transactions.html)
