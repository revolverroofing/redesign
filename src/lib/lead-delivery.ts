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
 * Posts the lead to Zapier when LEAD_ZAPIER_HOOK_URL is set in the
 * environment (Zap → Webhooks by Zapier → Catch Hook), otherwise logs
 * to the server console so dev installs aren't silent.
 *
 * The action layer has already validated the lead by the time this is
 * called. Throwing surfaces as a generic error to the user, so log
 * enough context to debug failed deliveries.
 */
export async function deliverLead(lead: Lead): Promise<void> {
  const url = process.env.LEAD_ZAPIER_HOOK_URL;
  if (!url) {
    console.info("[lead] LEAD_ZAPIER_HOOK_URL not set; logging only:", lead);
    return;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(lead),
    // Zapier hooks should respond in <5s; give them 10s before bailing.
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    console.error("[lead] zapier hook rejected", response.status, lead);
    throw new Error(`Zapier hook returned ${response.status}`);
  }
}
