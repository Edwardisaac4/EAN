import { NextResponse } from 'next/server';
import { 
  INITIAL_LEADS, 
  Lead, 
  LeadStatus, 
  LeadPriority, 
  ServiceCategory, 
  getLeadStats,
  SERVICE_LABELS 
} from '@/lib/admin-leads-data';
import { deriveSourceLabel } from '@/lib/leads-store';

let inMemoryLeads: Lead[] = [...INITIAL_LEADS];

/**
 * GraphQL Query & Mutation Engine for EAN Aviation Admin
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query, variables } = body;

    if (!query) {
      return NextResponse.json({ errors: [{ message: 'No GraphQL query provided' }] }, { status: 400 });
    }

    const cleanQuery = query.replace(/\s+/g, ' ').trim();

    // ------------------------------------------------------------------------
    // QUERY: leadStats
    // ------------------------------------------------------------------------
    if (cleanQuery.includes('query') && cleanQuery.includes('leadStats')) {
      const stats = getLeadStats(inMemoryLeads);

      const serviceDistributionArray = Object.entries(stats.serviceDistribution).map(([cat, count]) => {
        const percentage = stats.totalLeads > 0 ? Math.round((count / stats.totalLeads) * 100) : 0;
        return {
          category: cat,
          label: SERVICE_LABELS[cat as ServiceCategory] || cat,
          count,
          percentage,
        };
      });

      return NextResponse.json({
        data: {
          leadStats: {
            totalLeads: stats.totalLeads,
            newLeads: stats.newLeads,
            inProgressLeads: stats.inProgressLeads,
            qualifiedLeads: stats.qualifiedLeads,
            closedWonLeads: stats.closedWonLeads,
            avgResponseSlaMinutes: stats.avgResponseSlaMinutes,
            conversionRate: stats.conversionRate,
            totalEstimatedPipeline: stats.totalEstimatedPipeline,
            serviceDistribution: serviceDistributionArray,
            trackingDistribution: stats.trackingDistribution,
          },
        },
      });
    }

    // ------------------------------------------------------------------------
    // QUERY: single lead by id
    // ------------------------------------------------------------------------
    if (cleanQuery.includes('query') && cleanQuery.includes('lead(')) {
      const id = variables?.id;
      const target = inMemoryLeads.find((l) => l.id === id);
      return NextResponse.json({
        data: { lead: target || null },
      });
    }

    // ------------------------------------------------------------------------
    // QUERY: leads (with filtering & search)
    // ------------------------------------------------------------------------
    if (cleanQuery.includes('query') && (cleanQuery.includes('leads') || cleanQuery.includes('getLeads'))) {
      let filtered = [...inMemoryLeads];

      if (variables?.search) {
        const q = variables.search.toLowerCase();
        filtered = filtered.filter(
          (l) =>
            l.fullName.toLowerCase().includes(q) ||
            l.email.toLowerCase().includes(q) ||
            l.id.toLowerCase().includes(q) ||
            l.phone.toLowerCase().includes(q) ||
            (l.company && l.company.toLowerCase().includes(q)) ||
            (l.source && l.source.toLowerCase().includes(q))
        );
      }

      if (variables?.status && variables.status !== 'all') {
        filtered = filtered.filter((l) => l.status === variables.status.toLowerCase());
      }

      if (variables?.service && variables.service !== 'all') {
        filtered = filtered.filter((l) => l.service === variables.service.toLowerCase());
      }

      if (variables?.priority && variables.priority !== 'all') {
        filtered = filtered.filter((l) => l.priority === variables.priority.toLowerCase());
      }

      return NextResponse.json({
        data: { leads: filtered },
      });
    }

    // ------------------------------------------------------------------------
    // MUTATION: updateLeadStatus
    // ------------------------------------------------------------------------
    if (cleanQuery.includes('mutation') && cleanQuery.includes('updateLeadStatus')) {
      const { id, status } = variables || {};
      const leadIndex = inMemoryLeads.findIndex((l) => l.id === id);
      if (leadIndex === -1) {
        return NextResponse.json({ errors: [{ message: `Lead ${id} not found` }] }, { status: 404 });
      }

      const target = inMemoryLeads[leadIndex];
      const now = new Date().toISOString();
      const updated: Lead = {
        ...target,
        status: status.toLowerCase() as LeadStatus,
        updatedAt: now,
        activities: [
          {
            id: `act-${Date.now()}`,
            timestamp: now,
            author: 'GraphQL Admin Client',
            action: `Status updated to ${status}`,
          },
          ...target.activities,
        ],
      };

      inMemoryLeads[leadIndex] = updated;
      return NextResponse.json({ data: { updateLeadStatus: updated } });
    }

    // ------------------------------------------------------------------------
    // MUTATION: updateLeadPriority
    // ------------------------------------------------------------------------
    if (cleanQuery.includes('mutation') && cleanQuery.includes('updateLeadPriority')) {
      const { id, priority } = variables || {};
      const leadIndex = inMemoryLeads.findIndex((l) => l.id === id);
      if (leadIndex === -1) {
        return NextResponse.json({ errors: [{ message: `Lead ${id} not found` }] }, { status: 404 });
      }

      const target = inMemoryLeads[leadIndex];
      const now = new Date().toISOString();
      const updated: Lead = {
        ...target,
        priority: priority.toLowerCase() as LeadPriority,
        updatedAt: now,
        activities: [
          {
            id: `act-${Date.now()}`,
            timestamp: now,
            author: 'GraphQL Admin Client',
            action: `Priority updated to ${priority}`,
          },
          ...target.activities,
        ],
      };

      inMemoryLeads[leadIndex] = updated;
      return NextResponse.json({ data: { updateLeadPriority: updated } });
    }

    // ------------------------------------------------------------------------
    // MUTATION: assignLead
    // ------------------------------------------------------------------------
    if (cleanQuery.includes('mutation') && cleanQuery.includes('assignLead')) {
      const { id, staffName } = variables || {};
      const leadIndex = inMemoryLeads.findIndex((l) => l.id === id);
      if (leadIndex === -1) {
        return NextResponse.json({ errors: [{ message: `Lead ${id} not found` }] }, { status: 404 });
      }

      const target = inMemoryLeads[leadIndex];
      const now = new Date().toISOString();
      const updated: Lead = {
        ...target,
        assignedTo: staffName,
        updatedAt: now,
        activities: [
          {
            id: `act-${Date.now()}`,
            timestamp: now,
            author: 'GraphQL Admin Client',
            action: `Assigned lead to ${staffName}`,
          },
          ...target.activities,
        ],
      };

      inMemoryLeads[leadIndex] = updated;
      return NextResponse.json({ data: { assignLead: updated } });
    }

    // ------------------------------------------------------------------------
    // MUTATION: addLeadNote
    // ------------------------------------------------------------------------
    if (cleanQuery.includes('mutation') && cleanQuery.includes('addLeadNote')) {
      const { id, note } = variables || {};
      const leadIndex = inMemoryLeads.findIndex((l) => l.id === id);
      if (leadIndex === -1) {
        return NextResponse.json({ errors: [{ message: `Lead ${id} not found` }] }, { status: 404 });
      }

      const target = inMemoryLeads[leadIndex];
      const now = new Date().toISOString();
      const updated: Lead = {
        ...target,
        notes: [note, ...target.notes],
        updatedAt: now,
        activities: [
          {
            id: `act-${Date.now()}`,
            timestamp: now,
            author: 'GraphQL Admin Client',
            action: 'Added internal note',
            note,
          },
          ...target.activities,
        ],
      };

      inMemoryLeads[leadIndex] = updated;
      return NextResponse.json({ data: { addLeadNote: updated } });
    }

    // ------------------------------------------------------------------------
    // MUTATION: createLead
    // ------------------------------------------------------------------------
    if (cleanQuery.includes('mutation') && cleanQuery.includes('createLead')) {
      const input = variables?.input || {};
      const now = new Date().toISOString();
      const nextId = `EAN-LD-${new Date().getFullYear()}-${String(inMemoryLeads.length + 90).padStart(3, '0')}`;
      
      const newLead: Lead = {
        id: nextId,
        fullName: input.fullName || input.name,
        email: input.email,
        phone: input.phone || 'Not provided',
        company: input.company || undefined,
        service: (input.service as ServiceCategory) || 'general',
        message: input.message,
        status: 'new',
        priority: (input.priority as LeadPriority) || 'normal',
        createdAt: now,
        updatedAt: now,
        source: deriveSourceLabel(input.tracking),
        notes: [],
        activities: [
          {
            id: `act-${Date.now()}`,
            timestamp: now,
            author: 'GraphQL Form Mutation',
            action: 'Created lead via GraphQL mutation',
          },
        ],
        estimatedValue: input.estimatedValue || 15000,
        tracking: input.tracking,
      };

      inMemoryLeads = [newLead, ...inMemoryLeads];
      return NextResponse.json({ data: { createLead: newLead } });
    }

    // Fallback response for unhandled queries
    return NextResponse.json({
      data: {
        leads: inMemoryLeads,
        leadStats: getLeadStats(inMemoryLeads),
      },
    });

  } catch (error) {
    console.error('GraphQL API Error:', error);
    return NextResponse.json({ errors: [{ message: 'Internal GraphQL processing error' }] }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'EAN Aviation GraphQL API Endpoint',
    schema: {
      queries: ['leads(search, status, service, priority)', 'lead(id)', 'leadStats'],
      mutations: ['updateLeadStatus(id, status)', 'updateLeadPriority(id, priority)', 'assignLead(id, staffName)', 'addLeadNote(id, note)', 'createLead(input)'],
    },
    documentation: 'Send POST requests with { query, variables } payload.',
  });
}
