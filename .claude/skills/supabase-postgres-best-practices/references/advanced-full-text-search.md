---
title: Use tsvector for Full-Text Search
impact: MEDIUM
impactDescription: 100x faster than LIKE, with ranking support
tags: full-text-search, tsvector, gin, search
---

## Use tsvector for Full-Text Search

Leading-wildcard patterns (like `%postgresql%`) generally cannot use ordinary B-tree indexes, though `pg_trgm` GIN/GIST indexes can accelerate `LIKE`/`ILIKE`. For natural language search with stemming, stop words, and relevance ranking, full-text search with `tsvector` is significantly faster depending on dataset size and query complexity.

**Incorrect (unindexed or basic LIKE pattern matching):**

```sql
-- Cannot use standard B-tree index, scans all rows
select * from articles where content like '%postgresql%';

-- Case-insensitive makes it worse without pg_trgm
select * from articles where lower(content) like '%postgresql%';
```

**Correct (full-text search with tsvector):**

```sql
-- Add tsvector column and index
alter table articles add column search_vector tsvector
  generated always as (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(content,''))) stored;

create index articles_search_idx on articles using gin (search_vector);

-- Fast full-text search with user query
select * from articles
where search_vector @@ websearch_to_tsquery('english', 'postgresql performance');

-- With ranking
select *, ts_rank(search_vector, query) as rank
from articles, websearch_to_tsquery('english', 'postgresql') query
where search_vector @@ query
order by rank desc;
```

Deliberately constructed tsquery expressions:

```sql
-- AND: both terms required
to_tsquery('postgresql & performance')

-- OR: either term
to_tsquery('postgresql | mysql')

-- Prefix matching
to_tsquery('post:*')
```

Reference: [Full Text Search](https://supabase.com/docs/guides/database/full-text-search)
