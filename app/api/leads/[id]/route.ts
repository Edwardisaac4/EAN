import { NextResponse } from 'next/server';
import { INITIAL_LEADS, Lead } from '@/lib/admin-leads-data';

let inMemoryLeads: Lead[] = [...INITIAL_LEADS];

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const lead = inMemoryLeads.find((l) => l.id === id);

  if (!lead) {
    return NextResponse.json(
      { success: false, error: 'Lead not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, lead });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, priority, assignedTo, newNote, author, clientLeads } = body;

    if (Array.isArray(clientLeads) && clientLeads.length > 0) {
      inMemoryLeads = clientLeads;
    }

    const leadIndex = inMemoryLeads.findIndex((l) => l.id === id);

    if (leadIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Lead not found' },
        { status: 404 }
      );
    }

    const targetLead = inMemoryLeads[leadIndex];
    const now = new Date().toISOString();
    const updatedActivities = [...targetLead.activities];

    // Status change activity log
    if (status && status !== targetLead.status) {
      updatedActivities.unshift({
        id: `act-${Date.now()}`,
        timestamp: now,
        author: author || 'Lead Admin',
        action: `Status updated from ${targetLead.status} to ${status}`,
      });
    }

    // Priority change activity log
    if (priority && priority !== targetLead.priority) {
      updatedActivities.unshift({
        id: `act-${Date.now()}-p`,
        timestamp: now,
        author: author || 'Lead Admin',
        action: `Priority updated from ${targetLead.priority} to ${priority}`,
      });
    }

    // Staff assignment activity log
    if (assignedTo && assignedTo !== targetLead.assignedTo) {
      updatedActivities.unshift({
        id: `act-${Date.now()}-a`,
        timestamp: now,
        author: author || 'Lead Admin',
        action: `Assigned lead to ${assignedTo}`,
      });
    }

    // Add note activity log
    const updatedNotes = [...targetLead.notes];
    if (newNote && newNote.trim()) {
      updatedNotes.unshift(newNote);
      updatedActivities.unshift({
        id: `act-${Date.now()}-n`,
        timestamp: now,
        author: author || 'Lead Admin',
        action: 'Added internal note',
        note: newNote,
      });
    }

    const updatedLead: Lead = {
      ...targetLead,
      status: status || targetLead.status,
      priority: priority || targetLead.priority,
      assignedTo: assignedTo !== undefined ? assignedTo : targetLead.assignedTo,
      notes: updatedNotes,
      activities: updatedActivities,
      updatedAt: now,
    };

    inMemoryLeads[leadIndex] = updatedLead;

    return NextResponse.json({
      success: true,
      message: 'Lead updated successfully',
      lead: updatedLead,
    });
  } catch (error) {
    console.error('Error updating lead in API route:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error updating lead' },
      { status: 500 }
    );
  }
}
