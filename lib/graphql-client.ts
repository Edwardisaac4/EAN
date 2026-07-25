import { Lead, LeadStats, LeadStatus, LeadPriority, ServiceCategory } from './admin-leads-data';

export interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

/**
 * Sends a GraphQL POST request to /api/graphql
 */
export async function graphqlQuery<T>(
  query: string,
  variables?: Record<string, any>
): Promise<T> {
  const response = await fetch('/api/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  const json: GraphQLResponse<T> = await response.json();

  if (json.errors && json.errors.length > 0) {
    throw new Error(json.errors[0].message);
  }

  if (!json.data) {
    throw new Error('GraphQL query returned no data');
  }

  return json.data;
}

// ----------------------------------------------------------------------------
// GraphQL Documents
// ----------------------------------------------------------------------------

export const QUERY_GET_LEADS = `
  query GetLeads($search: String, $status: String, $service: String, $priority: String) {
    leads(search: $search, status: $status, service: $service, priority: $priority) {
      id
      fullName
      email
      phone
      company
      service
      message
      status
      priority
      createdAt
      updatedAt
      source
      assignedTo
      notes
      estimatedValue
      tracking {
        utmSource
        utmMedium
        utmCampaign
        utmContent
        utmTerm
        referrerUrl
        referrerDomain
        landingPage
        formPage
        deviceType
        browserName
        capturedAt
      }
      activities {
        id
        timestamp
        author
        action
        note
      }
    }
  }
`;

export const QUERY_GET_LEAD_STATS = `
  query GetLeadStats {
    leadStats {
      totalLeads
      newLeads
      inProgressLeads
      qualifiedLeads
      closedWonLeads
      avgResponseSlaMinutes
      conversionRate
      totalEstimatedPipeline
      serviceDistribution {
        category
        label
        count
        percentage
      }
      trackingDistribution {
        topSources {
          source
          count
          percentage
        }
        topLandingPages {
          page
          count
        }
        devices {
          desktop
          mobile
          tablet
        }
      }
    }
  }
`;

export const MUTATION_UPDATE_LEAD_STATUS = `
  mutation UpdateLeadStatus($id: ID!, $status: String!) {
    updateLeadStatus(id: $id, status: $status) {
      id
      status
      updatedAt
    }
  }
`;

export const MUTATION_UPDATE_LEAD_PRIORITY = `
  mutation UpdateLeadPriority($id: ID!, $priority: String!) {
    updateLeadPriority(id: $id, priority: $priority) {
      id
      priority
      updatedAt
    }
  }
`;

export const MUTATION_ASSIGN_LEAD = `
  mutation AssignLead($id: ID!, $staffName: String!) {
    assignLead(id: $id, staffName: $staffName) {
      id
      assignedTo
      updatedAt
    }
  }
`;

export const MUTATION_ADD_LEAD_NOTE = `
  mutation AddLeadNote($id: ID!, $note: String!) {
    addLeadNote(id: $id, note: $note) {
      id
      notes
      updatedAt
    }
  }
`;

export const MUTATION_CREATE_LEAD = `
  mutation CreateLead($input: CreateLeadInput!) {
    createLead(input: $input) {
      id
      fullName
      email
      phone
      company
      service
      message
      status
      priority
      createdAt
      source
    }
  }
`;
