// =============================================================================
// /api/leads/[id] — Single lead detail, updates, and notes
// Connected to Supabase via leads-service
// =============================================================================

import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-guard'
import { getLeadById, updateLead, addLeadNote, LEAD_NOT_FOUND } from '@/lib/services/leads-service'
import { dbError, notFound, badRequest } from '@/lib/supabase/helpers'

// ---------------------------------------------------------------------------
// GET /api/leads/[id] — fetch single lead with all related data
// ---------------------------------------------------------------------------

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  try {

    const { id } = await params
    const { lead, error } = await getLeadById(id)

    if (error || !lead) {
      return notFound('Lead not found')
    }

    return NextResponse.json({ success: true, lead })
  } catch (err) {
    console.error('GET /api/leads/[id] error:', err)
    return dbError('Internal server error fetching lead')
  }
}

// ---------------------------------------------------------------------------
// PATCH /api/leads/[id] — update lead status, priority, assignment, add note
// ---------------------------------------------------------------------------

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  try {

    const { id } = await params
    let body: Record<string, unknown>

    try {
      body = await request.json()
    } catch {
      return badRequest('Invalid JSON request body')
    }

    const { status, priority, assignedTo, newNote, author } = body as {
      status?: string
      priority?: string
      assignedTo?: string
      newNote?: string
      author?: string
    }

    // Build update payload
    const updates: Record<string, unknown> & { author?: string } = { author }

    if (status) updates.status = status
    if (priority) updates.priority = priority
    if (assignedTo !== undefined) updates.assigned_to = assignedTo

    // Apply updates if any field changes exist. The fully joined record is
    // re-read below, so the return value here is not needed.
    const hasFieldUpdates = status || priority || assignedTo !== undefined

    if (hasFieldUpdates) {
      const { error } = await updateLead(id, updates)
      if (error === LEAD_NOT_FOUND) {
        return notFound('Lead not found')
      }
      if (error) {
        return dbError('Failed to update lead')
      }
    }

    // Add note if provided. A failure here is reported rather than swallowed —
    // otherwise the caller is told the update succeeded and the note is lost.
    if (newNote && newNote.trim()) {
      const { error: noteError } = await addLeadNote(
        id,
        newNote.trim(),
        (author as string) || 'Lead Admin'
      )
      if (noteError === LEAD_NOT_FOUND) {
        return notFound('Lead not found')
      }
      if (noteError) {
        console.error('Failed to add note:', noteError)
        return dbError('Lead fields were updated but the note could not be saved')
      }
    }

    // Fetch the full updated lead with all related data
    const { lead: fullLead, error: fetchError } = await getLeadById(id)

    if (fetchError || !fullLead) {
      return notFound('Lead not found after update')
    }

    return NextResponse.json({
      success: true,
      message: 'Lead updated successfully',
      lead: fullLead,
    })
  } catch (err) {
    console.error('PATCH /api/leads/[id] error:', err)
    return dbError('Internal server error updating lead')
  }
}
