import { Lead } from './admin-leads-data';

export interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

/** Shape returned by the `leads` query. */
export interface LeadsQueryResult {
  leads: Lead[];
  leadsTotal?: number;
  leadsTruncated?: boolean;
}

/**
 * Sends a GraphQL POST request to /api/graphql.
 *
 * The endpoint requires an admin session; an expired session returns 401, which
 * surfaces here as an error the caller can show rather than silently rendering
 * an empty dashboard.
 */
export async function graphqlQuery<T>(
  query: string,
  variables?: Record<string, unknown>,
  options?: { signal?: AbortSignal }
): Promise<T> {
  const response = await fetch('/api/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
    signal: options?.signal,
  });

  if (response.status === 401) {
    throw new Error('Your admin session has expired. Please sign in again.');
  }

  // The API returns its own `errors` array alongside 4xx/5xx statuses, and those
  // messages are the useful ones — so the body is read first. Failures that carry
  // no JSON body (proxy timeout, HTML error page) fall through to the status
  // message instead of surfacing a JSON parser error.
  let json: GraphQLResponse<T> | null = null;
  try {
    json = (await response.json()) as GraphQLResponse<T>;
  } catch {
    json = null;
  }

  if (json?.errors && json.errors.length > 0) {
    throw new Error(json.errors[0].message);
  }

  if (!response.ok) {
    throw new Error(`The leads API request failed (HTTP ${response.status}).`);
  }

  if (!json) {
    throw new Error('The leads API returned an unreadable response.');
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
      leadCode
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
      spamLeads
      newLeads
      inProgressLeads
      qualifiedLeads
      closedWonLeads
      closedLostLeads
      avgResponseSlaMinutes
      conversionRate
      totalEstimatedPipeline
      dailyInquiryRate
      dailyTrend {
        date
        label
        count
      }
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
