import { apiRequest } from './api';

function unwrapCollection(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;

  throw new Error(
    'The server returned an unexpected assigned-report response. Please refresh and try again.'
  );
}

function unwrapResource(payload) {
  const resource = payload?.data ?? payload;

  if (!resource || typeof resource !== 'object' || Array.isArray(resource)) {
    throw new Error(
      'The server returned an unexpected report response. Please refresh and try again.'
    );
  }

  return resource;
}

export async function getAssignedReports() {
  const payload = await apiRequest('/api/responder/reports');
  return unwrapCollection(payload);
}

export async function getAssignedReport(reportCode) {
  const payload = await apiRequest(
    `/api/responder/reports/${encodeURIComponent(reportCode)}`
  );

  return unwrapResource(payload);
}

export async function acknowledgeAssignment(reportCode, expectedVersion) {
  const payload = await apiRequest(
    `/api/responder/reports/${encodeURIComponent(reportCode)}/acknowledge`,
    {
      method: 'POST',
      body: JSON.stringify({ expectedVersion }),
    }
  );

  return unwrapResource(payload);
}

export async function performResponderAction(
  reportCode,
  { action, remarks = null, expectedVersion }
) {
  const payload = await apiRequest(
    `/api/responder/reports/${encodeURIComponent(reportCode)}/actions`,
    {
      method: 'POST',
      body: JSON.stringify({
        action,
        remarks,
        expectedVersion,
      }),
    }
  );

  return unwrapResource(payload);
}
