import { NextResponse } from 'next/server';
import { INITIAL_LEADS, Lead, ServiceCategory, LeadStatus, LeadPriority } from '@/lib/admin-leads-data';
import { deriveSourceLabel } from '@/lib/leads-store';

// In-memory fallback array for server context
let inMemoryLeads: Lead[] = [...INITIAL_LEADS];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.toLowerCase();
    const status = searchParams.get('status') as LeadStatus | 'all' | null;
    const service = searchParams.get('service') as ServiceCategory | 'all' | null;
    const priority = searchParams.get('priority') as LeadPriority | 'all' | null;

    let filtered = [...inMemoryLeads];

    if (q) {
      filtered = filtered.filter(
        (l) =>
          l.fullName.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q) ||
          l.id.toLowerCase().includes(q) ||
          l.phone.toLowerCase().includes(q) ||
          (l.company && l.company.toLowerCase().includes(q))
      );
    }

    if (status && status !== 'all') {
      filtered = filtered.filter((l) => l.status === status);
    }

    if (service && service !== 'all') {
      filtered = filtered.filter((l) => l.service === service);
    }

    if (priority && priority !== 'all') {
      filtered = filtered.filter((l) => l.priority === priority);
    }

    return NextResponse.json({
      success: true,
      total: filtered.length,
      leads: filtered,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { fullName, name, email, phone, company, service, message, tracking, clientLeads } = body;

    // Use name or fullName
    const leadName = fullName || name;

    if (!leadName || !email || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing required lead fields (name, email, message)' },
        { status: 400 }
      );
    }

    // Sync client leads if passed
    if (Array.isArray(clientLeads) && clientLeads.length > 0) {
      inMemoryLeads = clientLeads;
    }

    const now = new Date().toISOString();
    const nextId = `EAN-LD-${new Date().getFullYear()}-${String(inMemoryLeads.length + 90).padStart(3, '0')}`;
    const derivedSource = deriveSourceLabel(tracking);

    // Auto priority assignment based on service or urgency keywords
    let priority: LeadPriority = 'normal';
    if (
      message.toLowerCase().includes('urgent') ||
      message.toLowerCase().includes('asap') ||
      service === 'fbo'
    ) {
      priority = 'urgent';
    } else if (service === 'charter' || service === 'maintenance') {
      priority = 'high';
    }

    const newLead: Lead = {
      id: nextId,
      fullName: leadName,
      email,
      phone: phone || 'Not provided',
      company: company || undefined,
      service: (service as ServiceCategory) || 'general',
      message,
      status: 'new',
      priority,
      createdAt: now,
      updatedAt: now,
      source: derivedSource,
      notes: [],
      activities: [
        {
          id: `act-${Date.now()}`,
          timestamp: now,
          author: 'System (Form Engine)',
          action: `Lead automatically captured via ${tracking?.formPage || 'Website Form'}`,
        },
      ],
      estimatedValue: service === 'charter' ? 20000 : service === 'fbo' ? 15000 : service === 'maintenance' ? 35000 : 5000,
      tracking,
    };

    inMemoryLeads = [newLead, ...inMemoryLeads];

    return NextResponse.json(
      {
        success: true,
        message: 'Lead created successfully',
        lead: newLead,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating lead in API route:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error creating lead' },
      { status: 500 }
    );
  }
}
