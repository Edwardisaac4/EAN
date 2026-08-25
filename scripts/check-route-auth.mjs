#!/usr/bin/env node
// =============================================================================
// check-route-auth — every API handler is guarded, or explicitly public
// =============================================================================
// The failure this exists to prevent is silent. proxy.ts decides what it
// inspects from one `matcher` array; editing that array can drop a route out of
// coverage without breaking a build, a type, or a test. A route serving the
// whole lead table would simply start answering everyone.
//
// So: every exported handler under app/api must either guard itself with
// requireAdmin(), or be named in PUBLIC_HANDLERS below. Adding a route without
// doing one of those two things fails this check.
//
// PUBLIC_HANDLERS is also the point. Until now, "which endpoints are public?"
// was answerable only by reading proxy.ts and reasoning about prefix matching.
// Now it is a list, in one file, that some code actually enforces.
//
// This parses each route with the TypeScript compiler rather than grepping.
// The first version tested `/requireAdmin\s*\(/` against the file text, which a
// comment, a string literal, a helper that is never called, or a call sitting
// after an early return would all have satisfied. A check on authentication
// that can be fooled by a comment mentioning it is worse than no check, because
// it reports green.
//
// Run: npm run check:auth

import { readdir, readFile } from 'node:fs/promises'
import { join, relative, sep } from 'node:path'
import ts from 'typescript'

const API_DIR = join(process.cwd(), 'app', 'api')
const HTTP_METHODS = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'])
const GUARD_EXPORT = 'requireAdmin'
const GUARD_MODULE = 'auth-guard'

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
 * The local name requireAdmin is bound to in this file, or null if it is not
 * imported from the guard module at all.
 *
 * Resolving the binding is what makes the check honest: a file that merely
 * mentions the word, or that defines its own unrelated `requireAdmin`, has no
 * import and therefore cannot pass.
 */
function resolveGuardBinding(sourceFile) {
  let localName = null

  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement)) continue
    if (!ts.isStringLiteral(statement.moduleSpecifier)) continue
    if (!statement.moduleSpecifier.text.endsWith(GUARD_MODULE)) continue

    const bindings = statement.importClause?.namedBindings
    if (!bindings || !ts.isNamedImports(bindings)) continue

    for (const element of bindings.elements) {
      // `import { requireAdmin as check }` puts the original in propertyName.
      const imported = (element.propertyName ?? element.name).text
      if (imported === GUARD_EXPORT) localName = element.name.text
    }
  }

  return localName
}

/** Every exported `function GET(...)` etc., with its body. */
function exportedHandlers(sourceFile) {
  const handlers = []

  for (const statement of sourceFile.statements) {
    if (!ts.isFunctionDeclaration(statement)) continue
    if (!statement.name || !HTTP_METHODS.has(statement.name.text)) continue

    const isExported = statement.modifiers?.some(
      (m) => m.kind === ts.SyntaxKind.ExportKeyword
    )
    if (!isExported || !statement.body) continue

    handlers.push({ method: statement.name.text, body: statement.body })
  }

  return handlers
}

/** `await requireAdmin()` bound to a name, as a direct statement of `block`. */
function findGuardCall(statements, localName) {
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i]
    if (!ts.isVariableStatement(statement)) continue

    for (const decl of statement.declarationList.declarations) {
      const init = decl.initializer
      if (!init || !ts.isAwaitExpression(init)) continue
      if (!ts.isCallExpression(init.expression)) continue

      const callee = init.expression.expression
      if (!ts.isIdentifier(callee) || callee.text !== localName) continue
      if (!ts.isIdentifier(decl.name)) continue

      return { index: i, boundTo: decl.name.text }
    }
  }
  return null
}

/** An `if (…guard…) { return … }` after the call, in the same statement list. */
function hasEarlyReturn(statements, fromIndex, boundTo) {
  for (let i = fromIndex + 1; i < statements.length; i++) {
    const statement = statements[i]
    if (!ts.isIfStatement(statement)) continue

    let mentionsGuard = false
    const visitCondition = (node) => {
      if (ts.isIdentifier(node) && node.text === boundTo) mentionsGuard = true
      ts.forEachChild(node, visitCondition)
    }
    visitCondition(statement.expression)
    if (!mentionsGuard) continue

    let returns = false
    const visitBranch = (node) => {
      // Do not descend into nested functions: a return inside a callback is not
      // a return from the handler.
      if (ts.isFunctionLike(node)) return
      if (ts.isReturnStatement(node)) returns = true
      ts.forEachChild(node, visitBranch)
    }
    visitBranch(statement.thenStatement)
    if (returns) return true
  }
  return false
}

/** Any await before `index` would be work done before the request is authorised. */
function awaitBefore(statements, index) {
  for (let i = 0; i < index; i++) {
    let found = false
    const visit = (node) => {
      if (ts.isFunctionLike(node)) return
      if (ts.isAwaitExpression(node)) found = true
      ts.forEachChild(node, visit)
    }
    visit(statements[i])
    if (found) return true
  }
  return false
}

/**
 * Statement lists where a guard may legitimately live: the handler body itself,
 * and the block of a `try` that is the first real statement of that body. Both
 * shapes exist in this codebase and both run before any protected work.
 */
function guardRegions(body) {
  const regions = [body.statements]
  for (const statement of body.statements) {
    if (ts.isTryStatement(statement)) regions.push(statement.tryBlock.statements)
  }
  return regions
}

function analyseHandler(body, localName) {
  if (!localName) return { guarded: false, reason: `${GUARD_EXPORT} is not imported in this file` }

  for (const statements of guardRegions(body)) {
    const call = findGuardCall(statements, localName)
    if (!call) continue

    if (awaitBefore(statements, call.index)) {
      return { guarded: false, reason: 'awaits something before the guard runs' }
    }
    if (!hasEarlyReturn(statements, call.index, call.boundTo)) {
      return {
        guarded: false,
        reason: `calls ${localName}() but never returns on failure — the result is ignored`,
      }
    }
    return { guarded: true }
  }

  return { guarded: false, reason: `no unconditional ${localName}() call on the request path` }
}

const files = (await findRouteFiles(API_DIR)).sort()
const problems = []
const seen = new Set()
let guarded = 0
let publicOk = 0

for (const file of files) {
  const route = routePathFor(file)
  const source = await readFile(file, 'utf8')
  const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)

  const localName = resolveGuardBinding(sourceFile)
  const handlers = exportedHandlers(sourceFile)

  if (handlers.length === 0) {
    problems.push(`${route} — no exported HTTP handler found in ${relative(process.cwd(), file)}`)
    continue
  }

  for (const { method, body } of handlers) {
    const id = `${route}:${method}`
    seen.add(id)

    const { guarded: isGuarded, reason } = analyseHandler(body, localName)
    const isPublic = PUBLIC_HANDLERS.has(id)

    if (isGuarded && isPublic) {
      problems.push(
        `${id} — listed as public but guards itself. Remove it from ` +
          `PUBLIC_HANDLERS, or drop the guard if it really is public.`
      )
    } else if (isGuarded) {
      guarded++
    } else if (isPublic) {
      publicOk++
    } else {
      problems.push(
        `${id} — ${reason}.\n` +
          `      If it serves customer data, add as the first statement:\n` +
          `          const guard = await requireAdmin()\n` +
          `          if (!guard.ok) return guard.response\n` +
          `      If it is deliberately public, add it to PUBLIC_HANDLERS in ` +
          `${relative(process.cwd(), import.meta.filename)} with a reason.`
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
