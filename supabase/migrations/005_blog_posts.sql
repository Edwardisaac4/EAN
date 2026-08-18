-- ============================================================================
-- Migration: 005_blog_posts.sql
-- Created: 2026-08-17
-- Description: Backfill the blog_posts schema as a migration.
--
--   This table already exists in the hosted project — it was created through the
--   Supabase dashboard rather than through migrations, so types/supabase.ts
--   described a table that no file in supabase/migrations/ could recreate. That
--   is schema drift: a fresh environment (a new branch, a local `supabase db
--   reset`, a rebuild after an incident) came up without the blog.
--
--   Written to be idempotent so it is safe to apply against the existing
--   project: every statement is IF NOT EXISTS / OR REPLACE and no column is
--   redefined. Applying this to production changes nothing; applying it to an
--   empty database reproduces the blog.
--
--   Shape mirrors types/supabase.ts exactly (Tables.blog_posts).
-- ============================================================================

-- ============================================================================
-- 1. TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title           text        NOT NULL,
  slug            text        NOT NULL,
  category        text        NOT NULL DEFAULT 'Business Aviation',
  excerpt         text        NOT NULL DEFAULT '',
  -- Tiptap document JSON. Rendered structurally by renderTiptapNode in
  -- app/blog/[slug]/page.tsx — never with dangerouslySetInnerHTML.
  content         jsonb       NOT NULL DEFAULT '{}'::jsonb,
  cover_image_url text,
  seo_title       text,
  seo_description text,
  og_image_url    text,
  status          text        NOT NULL DEFAULT 'draft',
  published_at    timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- 2. CONSTRAINTS
-- ============================================================================

-- The slug is the public URL segment, so a duplicate would make one of the two
-- posts permanently unreachable — .single() in getArticleData would error.
DO $
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'blog_posts_slug_key'
      AND conrelid = 'public.blog_posts'::regclass
  ) THEN
    ALTER TABLE public.blog_posts ADD CONSTRAINT blog_posts_slug_key UNIQUE (slug);
  END IF;
END $;

-- status is read as a two-value union in TypeScript ('draft' | 'published'), so
-- the database has to actually guarantee that rather than trust the writer.
DO $
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'blog_posts_status_check'
      AND conrelid = 'public.blog_posts'::regclass
  ) THEN
    ALTER TABLE public.blog_posts
      ADD CONSTRAINT blog_posts_status_check CHECK (status IN ('draft', 'published'));
  END IF;
END $;

-- ============================================================================
-- 3. INDEXES
-- ============================================================================

-- Every public read is "published posts, newest first" (generateStaticParams
-- and the blog listing); this serves both halves of that.
CREATE INDEX IF NOT EXISTS idx_blog_posts_status_published_at
  ON public.blog_posts (status, published_at DESC);

-- ============================================================================
-- 4. TRIGGERS
-- ============================================================================

-- Reuses the search_path-hardened helper from 002.
DROP TRIGGER IF EXISTS trg_blog_posts_updated_at ON public.blog_posts;
CREATE TRIGGER trg_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- 5. ROW LEVEL SECURITY
-- ============================================================================

-- Default-deny, consistent with 001 §8. Published posts are read server-side
-- through the service_role client during prerender, and drafts must never be
-- reachable from a browser, so there is no anon policy to add here.
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 6. COMMENTS — schema documentation
-- ============================================================================

COMMENT ON TABLE  public.blog_posts                 IS 'Blog articles authored in the admin Tiptap editor; complements the static seed in lib/constants.ts';
COMMENT ON COLUMN public.blog_posts.slug            IS 'Public URL segment — /blog/<slug>';
COMMENT ON COLUMN public.blog_posts.content         IS 'Tiptap document JSON, rendered structurally (never as raw HTML)';
COMMENT ON COLUMN public.blog_posts.status          IS 'draft (admin-only) or published (publicly readable)';
COMMENT ON COLUMN public.blog_posts.published_at    IS 'Set when status first flips to published; drives public ordering';
COMMENT ON COLUMN public.blog_posts.og_image_url    IS 'Social share image; falls back to cover_image_url then the site default';
