#!/usr/bin/env node
// =============================================================================
// check-route-auth — every API handler is guarded, or explicitly public
// =============================================================================
// The failure this exists to prevent is silent. proxy.ts decides what it
// inspects from one `matcher` array; editing that array can drop a route out of
// coverage without breaking a build, a type, or a test. A route serving the
// whole lead table would simply start answering everyone.
//
// So: every exported handler under app/api must either call requireAdmin(), or
// be named in PUBLIC_HANDLERS below. Adding a route without doing one of those
// two things fails this check.
//
// PUBLIC_HANDLERS is also the point. Until now, "which endpoints are public?"
// was answerable only by reading proxy.ts and reasoning about prefix matching.
// Now it is a list, in one file, that some code actually enforces.
//
// Run: npm run check:auth

import { readdir, readFile } from 'node:fs/promises'
import { join, relative, sep } from 'node:path'

const API_DIR = join(process.cwd(), 'app', 'api')
const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']

/**
 * Handlers that must stay reachable without an admin session.
 *
 * Keep this in step with PUBLIC_API_ROUTES in proxy.ts. Each entry needs a
 * reason — an unexplained exemption is how a route quietly becomes public.
 */
const PUBLIC_HANDLERS = new Map([
  ['/api/admin/login:POST', 'the login endpoint itself — nothing could sign in otherwise'],
  ['/api/admin/logout:POST', 'clearing your own cookie requires no privilege'],
  ['/api/leads:POST', 'the public website contact form'],
  ['/api/pricing/quote:POST', 'the public quote calculator'],
  ['/api/aircraft/search:GET', 'public aircraft lookup on the pricing page'],
])

/** app/api/leads/[id]/route.ts -> /api/leads/[id] */
function routePathFor(absFile) {
  const rel = relative(API_DIR, absFile).split(sep).slice(0, -1).join('/')
  return rel ? `/api/${rel}` : '/api'
}

async function findRouteFiles(dir) {
  const found = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) found.push(...(await findRouteFiles(full)))
    else if (entry.name === 'route.ts' || entry.name === 'route.tsx') found.push(full)
  }
  return found
}

/**
 * Slices the file into one span per exported handler.
 *
 * A handler's body is everything from its own `export async function` up to the
 * next one (or end of file). Crude next to a real parser, but it cannot be
 * fooled in the direction that matters: extra text in a span can only ever cause
 * a false pass on a guard that is genuinely present somewhere in that span, and
 * these files declare handlers last with helpers above.
 */
function handlerSpans(source) {
  const pattern = new RegExp(
    `export\\s+(?:async\\s+)?function\\s+(${HTTP_METHODS.join('|')})\\b`,
    'g'
  )
  const marks = [...source.matchAll(pattern)].map((m) => ({
    method: m[1],
    start: m.index ?? 0,
  }))

  return marks.map((mark, i) => ({
    method: mark.method,
    body: source.slice(mark.start, marks[i + 1]?.start ?? source.length),
  }))
}

const files = (await findRouteFiles(API_DIR)).sort()
const problems = []
const seen = new Set()
let guarded = 0
let publicOk = 0

for (const file of files) {
  const route = routePathFor(file)
  const source = await readFile(file, 'utf8')
  const spans = handlerSpans(source)

  if (spans.length === 0) {
    problems.push(`${route} — no exported HTTP handler found in ${relative(process.cwd(), file)}`)
    continue
  }

  for (const { method, body } of spans) {
    const id = `${route}:${method}`
    seen.add(id)

    const hasGuard = /requireAdmin\s*\(/.test(body)
    const isPublic = PUBLIC_HANDLERS.has(id)

    if (hasGuard && isPublic) {
      problems.push(
        `${id} — listed as public but calls requireAdmin(). Remove it from ` +
          `PUBLIC_HANDLERS, or drop the guard if it really is public.`
      )
    } else if (hasGuard) {
      guarded++
    } else if (isPublic) {
      publicOk++
    } else {
      problems.push(
        `${id} — no requireAdmin() and not in PUBLIC_HANDLERS.\n` +
          `      If it serves customer data, add:  const guard = await requireAdmin()\n` +
          `                                        if (!guard.ok) return guard.response\n` +
          `      If it is deliberately public, add it to PUBLIC_HANDLERS in ${relative(process.cwd(), import.meta.filename)} with a reason.`
      )
    }
  }
}

// A stale exemption is an exemption nobody is thinking about any more.
for (const id of PUBLIC_HANDLERS.keys()) {
  if (!seen.has(id)) {
    problems.push(`${id} — in PUBLIC_HANDLERS but no such handler exists. Remove the stale entry.`)
  }
}

if (problems.length > 0) {
  console.error('\n✖ Route auth check failed\n')
  for (const p of problems) console.error(`  ${p}\n`)
  console.error(`  ${problems.length} problem(s) across ${files.length} route file(s).\n`)
  process.exit(1)
}

console.log(
  `✔ Route auth check passed — ${guarded} guarded, ${publicOk} explicitly public, ` +
    `across ${files.length} route files.`
)
