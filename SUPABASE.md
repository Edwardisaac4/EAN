# SKILL: Supabase
# Project: EAN Aviation (ean.aero)
# Stack: Next.js 16 App Router, TypeScript, Supabase + @supabase/ssr

Read this file fully before writing any Supabase code.
Every pattern here is chosen specifically for Next.js 16 App Router.
Do not use deprecated packages or old patterns.

> ⚠️ NEXT.JS 16 BREAKING CHANGES THAT AFFECT SUPABASE:
> 1. cookies() is now async — must await it in server client
> 2. Cookie methods changed from get/set/remove → getAll/setAll
> 3. params in dynamic routes are Promises — must await params before use
> 4. createClient() in server.ts must be async function

---

## 1. THE GOLDEN RULES

```
1. NEVER import adminSupabase in a 'use client' component — server only
2. NEVER expose SUPABASE_SERVICE_ROLE_KEY to the browser — server only
3. ALWAYS handle errors from every Supabase call — never assume success
4. ALWAYS use the correct client for the context (server / client / admin)
5. NEVER query the database directly from components — always through API routes
6. ALWAYS use RLS — never disable it on a table without a documented reason
7. ALWAYS use TypeScript types from src/types/supabase.ts — never type as any
```

---

## 2. THE THREE CLIENTS — WHEN TO USE EACH

```
server.ts  → Server Components, API routes that need auth context
client.ts  → 'use client' components (browser)
admin.ts   → /api/admin/* routes ONLY — bypasses RLS
```

```ts
// src/lib/supabase/server.ts
// ⚠️ Next.js 16 — createClient must be async
import { createServerClient } from '@supabase/ssr'
import { cookies }            from 'next/headers'
import type { Database }      from '@/types/supabase'

export async function createClient() {
  // ⚠️ Next.js 16 — cookies() is now async, must await
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // ⚠️ Next.js 16 — getAll/setAll replace get/set/remove
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )
}
```

```ts
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'
import type { Database }       from '@/types/supabase'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
```

```ts
// src/lib/supabase/admin.ts
// SERVER ONLY — never import in 'use client' components
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

export const adminSupabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)
```

---

## 3. BASIC CRUD PATTERNS

### SELECT — fetch rows

```ts
// Fetch all — returns array
const { data, error } = await supabase
  .from('enquiries')
  .select('*')

// Fetch specific columns only
const { data, error } = await supabase
  .from('enquiries')
  .select('id, full_name, email, lead_status, created_at')

// Fetch single row by ID
const { data, error } = await supabase
  .from('enquiries')
  .select('*')
  .eq('id', id)
  .single()   // returns object instead of array, errors if not found

// Fetch with related data (join)
const { data, error } = await supabase
  .from('blog_posts')
  .select(`
    id, title, slug, excerpt, status, published_at,
    cover_image_url, category
  `)
  .eq('status', 'published')
  .order('published_at', { ascending: false })
```

### INSERT — create a row

```ts
// Insert one row
const { data, error } = await supabase
  .from('enquiries')
  .insert({
    full_name:    'John Adeyemi',
    email:        'john@company.com',
    source:       'instagram',
    service_type: 'charter',
    message:      'Interested in Lagos to Abuja charter',
  })
  .select('id')   // return the created row's id
  .single()

// Insert multiple rows
const { data, error } = await supabase
  .from('pricing')
  .insert([
    { service_slug: 'fbo', item_name: 'Standard Handling', price: 150000, unit: 'per visit', currency: 'NGN' },
    { service_slug: 'fbo', item_name: 'VIP Handling',      price: 350000, unit: 'per visit', currency: 'NGN' },
  ])
  .select()
```

### UPDATE — modify existing rows

```ts
// Update by ID — ALWAYS filter, never update all rows
const { data, error } = await supabase
  .from('enquiries')
  .update({
    lead_status:  'contacted',
    assigned_to:  'Sarah Obi',
    responded_at: new Date().toISOString(),
  })
  .eq('id', enquiryId)
  .select()
  .single()

// Toggle is_active on a pricing item
const { data, error } = await supabase
  .from('pricing')
  .update({ is_active: false })
  .eq('id', priceItemId)
  .select()
  .single()
```

### DELETE — remove rows

```ts
// Delete by ID
const { error } = await supabase
  .from('blog_posts')
  .delete()
  .eq('id', postId)

// Soft delete (preferred) — set is_active to false instead of deleting
const { error } = await supabase
  .from('pricing')
  .update({ is_active: false })
  .eq('id', priceItemId)
```

---

## 4. FILTERING & QUERYING

```ts
// Equality
.eq('lead_status', 'new')
.neq('status', 'spam')

// Comparisons
.gt('price', 100000)           // greater than
.gte('price', 100000)          // greater than or equal
.lt('created_at', '2026-07-01')
.lte('price', 500000)

// Multiple values (IN clause)
.in('lead_status', ['new', 'contacted', 'follow_up'])

// Text search (partial match)
.ilike('full_name', `%${searchTerm}%`)   // case-insensitive LIKE

// Date range filtering
.gte('created_at', '2026-07-01T00:00:00')
.lte('created_at', '2026-07-31T23:59:59')

// Combining filters (AND by default)
.eq('source', 'instagram')
.eq('lead_status', 'new')
.gte('created_at', startDate)

// OR filter
.or('lead_status.eq.new,lead_status.eq.contacted')

// Null checks
.is('assigned_to', null)       // unassigned leads
.not('assigned_to', 'is', null) // assigned leads

// Ordering
.order('created_at', { ascending: false })   // newest first
.order('price',      { ascending: true  })   // lowest price first

// Pagination
.range(0, 19)     // first 20 rows (page 1, limit 20)
.range(20, 39)    // rows 21-40 (page 2, limit 20)

// Count — get total without fetching all data
const { count } = await supabase
  .from('enquiries')
  .select('*', { count: 'exact', head: true })  // head:true skips returning data
  .eq('lead_status', 'new')
```

### Dynamic filtering pattern (for admin enquiries list)

```ts
// src/app/api/admin/enquiries/route.ts
export const GET = withAdminAuth(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url)

  const status  = searchParams.get('status')
  const source  = searchParams.get('source')
  const service = searchParams.get('service')
  const search  = searchParams.get('search')
  const page    = Number(searchParams.get('page')  ?? 1)
  const limit   = Number(searchParams.get('limit') ?? 20)

  let query = adminSupabase
    .from('enquiries')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1)

  // Only apply filters if they have values
  if (status)  query = query.eq('lead_status',  status)
  if (source)  query = query.eq('source',       source)
  if (service) query = query.eq('service_type', service)
  if (search)  query = query.or(
    `full_name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%`
  )

  const { data, error, count } = await query

  if (error) return errorResponse('Failed to fetch enquiries')

  return NextResponse.json({
    success: true,
    data: { enquiries: data, total: count, page, limit },
  })
})
```

---

## 5. ERROR HANDLING — REQUIRED PATTERN

Every Supabase call returns `{ data, error }`.
Always check error before using data. Never assume success.

```ts
// Standard error handler helper — put in src/lib/supabase/helpers.ts
import { NextResponse } from 'next/server'

export function dbError(message: string, status = 500) {
  return NextResponse.json(
    { success: false, error: message, code: 'SERVER_ERROR' },
    { status }
  )
}

export function notFound(message = 'Not found') {
  return NextResponse.json(
    { success: false, error: message, code: 'NOT_FOUND' },
    { status: 404 }
  )
}

// Usage in every API route:
const { data, error } = await supabase
  .from('enquiries')
  .select('*')
  .eq('id', id)
  .single()

if (error) return dbError('Failed to fetch enquiry')
if (!data) return notFound('Enquiry not found')

return NextResponse.json({ success: true, data })
```

---

## 6. TYPESCRIPT TYPES

Generate types from your Supabase schema — run after any schema change:

```bash
npx supabase gen types typescript \
  --project-id YOUR_PROJECT_ID \
  --schema public \
  > src/types/supabase.ts
```

Then define convenience types on top:

```ts
// src/types/database.ts
import type { Database } from './supabase'

// Table row types — auto-generated shape
export type Enquiry   = Database['public']['Tables']['enquiries']['Row']
export type PriceItem = Database['public']['Tables']['pricing']['Row']
export type BlogPost  = Database['public']['Tables']['blog_posts']['Row']

// Insert types — for creating new rows
export type NewEnquiry   = Database['public']['Tables']['enquiries']['Insert']
export type NewPriceItem = Database['public']['Tables']['pricing']['Insert']
export type NewBlogPost  = Database['public']['Tables']['blog_posts']['Insert']

// Update types — all fields optional for partial updates
export type EnquiryUpdate   = Database['public']['Tables']['enquiries']['Update']
export type PriceItemUpdate = Database['public']['Tables']['pricing']['Update']
export type BlogPostUpdate  = Database['public']['Tables']['blog_posts']['Update']

// Enums — exact allowed values
export type EnquirySource  =
  'website' | 'facebook' | 'instagram' | 'x' | 'tiktok' |
  'whatsapp' | 'referral' | 'walk-in'

export type ServiceType =
  'fbo' | 'maintenance' | 'charter' | 'catering' | 'vip' | 'leasing' | 'general'

export type LeadStatus =
  'new' | 'contacted' | 'follow_up' | 'negotiating' | 'converted' | 'closed' | 'spam'

export type PostStatus = 'draft' | 'published'

export type Currency = 'NGN' | 'USD'
```

---

## 7. ROW LEVEL SECURITY — REQUIRED ON ALL TABLES

RLS must be enabled on every table. Run once in SQL editor.

```sql
-- Enable RLS
alter table enquiries  enable row level security;
alter table pricing    enable row level security;
alter table blog_posts enable row level security;

-- PUBLIC policies (anon key access)
-- Pricing: anyone can read active prices
create policy "Public read active pricing"
  on pricing for select
  using (is_active = true);

-- Blog: anyone can read published posts
create policy "Public read published posts"
  on blog_posts for select
  using (status = 'published');

-- Enquiries: anyone can insert (contact form)
create policy "Public submit enquiries"
  on enquiries for insert
  with check (true);

-- ADMIN policies: handled by service_role key which bypasses RLS
-- No need to write admin policies — adminSupabase skips RLS entirely
```

---

## 8. FILE STORAGE — BLOG IMAGES

Blog cover images and OG images are stored in Supabase Storage.

### Setup in Supabase Dashboard

1. Storage → New bucket
2. Name: `blog-images`
3. Public: YES (images are publicly readable)

### Upload helper

```ts
// src/lib/supabase/storage.ts
import { adminSupabase } from './admin'

export async function uploadBlogImage(
  file:     File,
  folder:   'covers' | 'og',
): Promise<string> {
  const fileName = `${folder}/${Date.now()}-${file.name.replace(/\s/g, '-')}`

  const { error } = await adminSupabase.storage
    .from('blog-images')
    .upload(fileName, file, {
      contentType: file.type,
      upsert:      false,
    })

  if (error) throw new Error('Image upload failed')

  // Get public URL
  const { data } = adminSupabase.storage
    .from('blog-images')
    .getPublicUrl(fileName)

  return data.publicUrl
}

export async function deleteBlogImage(url: string): Promise<void> {
  // Extract path from full URL
  const path = url.split('/blog-images/')[1]
  if (!path) return

  await adminSupabase.storage
    .from('blog-images')
    .remove([path])
}
```

### Image upload API route

```ts
// src/app/api/admin/upload/route.ts
import { uploadBlogImage } from '@/lib/supabase/storage'
import { withAdminAuth }   from '@/lib/middleware/adminAuth'
import { NextRequest, NextResponse } from 'next/server'

export const POST = withAdminAuth(async (req: NextRequest) => {
  const formData = await req.formData()
  const file     = formData.get('file') as File
  const folder   = formData.get('folder') as 'covers' | 'og' ?? 'covers'

  if (!file) {
    return NextResponse.json(
      { success: false, error: 'No file provided' },
      { status: 400 }
    )
  }

  const url = await uploadBlogImage(file, folder)
  return NextResponse.json({ success: true, data: { url } })
})
```

---

## 9. REAL-TIME — ADMIN DASHBOARD LIVE UPDATES

The admin enquiries page can show new leads as they come in
without refreshing. Use Supabase Realtime.

```tsx
// In admin enquiries page — 'use client'
'use client'

import { useEffect, useState } from 'react'
import { createClient }        from '@/lib/supabase/client'
import type { Enquiry }        from '@/types/database'

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const supabase = createClient()

  useEffect(() => {
    // Initial fetch
    fetchEnquiries()

    // Subscribe to new inserts
    const channel = supabase
      .channel('enquiries-live')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'enquiries' },
        (payload) => {
          // Prepend new enquiry to the top of the list
          setEnquiries((prev) => [payload.new as Enquiry, ...prev])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function fetchEnquiries() {
    const res  = await fetch('/api/admin/enquiries')
    const json = await res.json()
    if (json.success) setEnquiries(json.data.enquiries)
  }

  return (
    // ... render enquiries table
  )
}
```

---

## 10. EAN-SPECIFIC QUERY PATTERNS

### Enquiries — dashboard stats

```ts
// Today's enquiry count
const today = new Date().toISOString().split('T')[0]

const { count: todayCount } = await adminSupabase
  .from('enquiries')
  .select('*', { count: 'exact', head: true })
  .gte('created_at', `${today}T00:00:00`)

// New leads count
const { count: newLeads } = await adminSupabase
  .from('enquiries')
  .select('*', { count: 'exact', head: true })
  .eq('lead_status', 'new')

// In-pipeline count
const { count: inPipeline } = await adminSupabase
  .from('enquiries')
  .select('*', { count: 'exact', head: true })
  .in('lead_status', ['contacted', 'follow_up', 'negotiating'])

// Converted this month
const monthStart = new Date(
  new Date().getFullYear(),
  new Date().getMonth(),
  1
).toISOString()

const { count: converted } = await adminSupabase
  .from('enquiries')
  .select('*', { count: 'exact', head: true })
  .eq('lead_status', 'converted')
  .gte('updated_at', monthStart)
```

### Enquiries — source breakdown for chart

```ts
// Get count per source — for the Recharts bar chart
const { data } = await adminSupabase
  .from('enquiries')
  .select('source')

// Count in JS (Supabase doesn't do GROUP BY natively in the JS client)
const sourceCounts = data?.reduce((acc, row) => {
  acc[row.source] = (acc[row.source] ?? 0) + 1
  return acc
}, {} as Record<string, number>)

const chartData = Object.entries(sourceCounts ?? {}).map(
  ([source, count]) => ({ source, count })
)
```

### Pricing — grouped by service for public site

```ts
// Fetch all active prices grouped by service
const { data } = await supabase
  .from('pricing')
  .select('service_slug, item_name, price, currency, unit')
  .eq('is_active', true)
  .order('service_slug')
  .order('price', { ascending: true })

// Group by service_slug
const grouped = (data ?? []).reduce((acc, item) => {
  if (!acc[item.service_slug]) acc[item.service_slug] = []
  acc[item.service_slug].push(item)
  return acc
}, {} as Record<string, typeof data>)
```

### Blog — listing page

```ts
// Public blog listing — published only
const { data: posts } = await supabase
  .from('blog_posts')
  .select('id, title, slug, excerpt, category, cover_image_url, published_at')
  .eq('status', 'published')
  .order('published_at', { ascending: false })
  .range(0, 8)   // 9 per page

// Filter by category (optional)
const { data: posts } = await supabase
  .from('blog_posts')
  .select('id, title, slug, excerpt, category, cover_image_url, published_at')
  .eq('status', 'published')
  .eq('category', category)  // only if category filter is active
  .order('published_at', { ascending: false })
```

### Blog — single post for SSG

```ts
// All slugs for generateStaticParams
const { data: slugs } = await supabase
  .from('blog_posts')
  .select('slug')
  .eq('status', 'published')

// Single post by slug
// ⚠️ Next.js 16 — params is a Promise, must await before destructuring
// src/app/(site)/blog/[slug]/page.tsx
interface Props { params: Promise<{ slug: string }> }

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params   // ← await required in Next.js 16

  const supabase = await createClient()
  const { data: post } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()
}

// generateMetadata also receives Promise params
export async function generateMetadata({ params }: Props) {
  const { slug } = await params   // ← await here too
  // ... rest of metadata
}
```

---

## 11. MIGRATIONS — CHANGING THE SCHEMA

Never change the schema manually. Always use the SQL editor and
document the change. When the company's own database is ready,
these SQL files become the migration scripts.

```
Create a new file each time the schema changes:
/supabase/migrations/
  001_initial_schema.sql      ← tables, RLS, triggers
  002_add_priority_to_enquiries.sql
  003_add_author_to_blog.sql
```

Each file contains only the new change:

```sql
-- 002_add_priority_to_enquiries.sql
alter table enquiries
  add column priority text not null default 'normal';

comment on column enquiries.priority
  is 'low | normal | high | urgent';
```

---

## 12. ENVIRONMENT VARIABLES REFERENCE

```env
# .env.local

# Public — safe in browser, client.ts and server.ts
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# Server only — NEVER prefix with NEXT_PUBLIC_
# admin.ts only — bypasses RLS
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

---

## 13. COMMON MISTAKES

```ts
// ❌ WRONG — using service role key in a browser component
'use client'
import { adminSupabase } from '@/lib/supabase/admin'  // exposes key to browser

// ✅ CORRECT — browser components call API routes, not Supabase directly
const res  = await fetch('/api/admin/enquiries')
const json = await res.json()

// ❌ WRONG — not handling the error
const { data } = await supabase.from('enquiries').select('*')
// data could be null if error occurred

// ✅ CORRECT — always destructure and check error
const { data, error } = await supabase.from('enquiries').select('*')
if (error) return dbError('Failed to fetch')

// ❌ WRONG — using old auth-helpers package
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'

// ✅ CORRECT — use @supabase/ssr
import { createServerClient } from '@supabase/ssr'

// ❌ WRONG — fetching all columns when you only need a few
const { data } = await supabase.from('blog_posts').select('*')

// ✅ CORRECT — select only what you need (faster, less bandwidth)
const { data } = await supabase
  .from('blog_posts')
  .select('id, title, slug, excerpt, published_at')

// ❌ WRONG — no pagination on a list endpoint
const { data } = await supabase.from('enquiries').select('*')

// ✅ CORRECT — always paginate list queries
const { data } = await supabase
  .from('enquiries')
  .select('*')
  .range(0, 19)

// ─────────────────────────────────────────────────────────────
// NEXT.JS 16 SPECIFIC MISTAKES
// ─────────────────────────────────────────────────────────────

// ❌ WRONG — synchronous cookies() (Next.js 15 pattern)
export function createClient() {
  const cookieStore = cookies()  // ← breaks in Next.js 16
  return createServerClient(...)
}

// ✅ CORRECT — async cookies() for Next.js 16
export async function createClient() {
  const cookieStore = await cookies()  // ← must await
  return createServerClient(...)
}

// ❌ WRONG — old get/set/remove cookie methods (Next.js 15 pattern)
cookies: {
  get(name)              { return cookieStore.get(name)?.value },
  set(name, value, opts) { cookieStore.set({ name, value, ...opts }) },
  remove(name, opts)     { cookieStore.set({ name, value: '', ...opts }) },
}

// ✅ CORRECT — getAll/setAll for Next.js 16
cookies: {
  getAll: () => cookieStore.getAll(),
  setAll: (cookiesToSet) => {
    cookiesToSet.forEach(({ name, value, options }) => {
      cookieStore.set(name, value, options)
    })
  },
}

// ❌ WRONG — accessing params directly (Next.js 15 pattern)
export default async function BlogPostPage({
  params,
}: {
  params: { slug: string }   // ← wrong type in Next.js 16
}) {
  const slug = params.slug   // ← breaks — params is a Promise now
}

// ✅ CORRECT — awaiting params in Next.js 16
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>  // ← correct type
}) {
  const { slug } = await params      // ← must await
}

// ❌ WRONG — calling createClient() without await in API routes
const supabase = createClient()       // ← sync call, returns Promise not client

// ✅ CORRECT — await the async createClient
const supabase = await createClient()
```