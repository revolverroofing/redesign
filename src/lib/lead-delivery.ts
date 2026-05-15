export type Lead = {
  name: string;
  phone: string;
  email: string;
  address?: string;
  serviceType: string;
  message?: string;
  submittedAt: string;
  userAgent?: string;
};

/**
 * Where leads land. Replace this with your real integration:
 *   - POST to a CRM / Zapier / make.com webhook
 *   - Send via Resend / SendGrid / Postmark
 *   - Insert into a database
 *
 * The lead has already been validated by the Server Action by the time it
 * reaches here. Throwing from this function will surface as a generic error
 * to the user, so log enough context to debug failed deliveries.
 */
export async function deliverLead(lead: Lead): Promise<void> {
  // Default no-op delivery: log to the server console so dev installs see
  // submissions without configuration.
  console.info("[lead]", lead);
}
