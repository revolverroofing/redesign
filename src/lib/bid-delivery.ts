export type BidInvitation = {
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  projectName: string;
  projectLocation: string;
  projectSizeSqFt: number;
  systemType: string;
  decisionDate?: string;
  prevailingWage: boolean;
  drawingsLink?: string;
  notes?: string;
  submittedAt: string;
  userAgent?: string;
};

/**
 * Posts the bid invitation to Zapier when BID_ZAPIER_HOOK_URL is set in
 * the environment (Zap → Webhooks by Zapier → Catch Hook). The Zap
 * should route to the estimating inbox / Slack channel — keep this
 * separate from LEAD_ZAPIER_HOOK_URL so residential intake never has
 * to filter commercial bids.
 *
 * Falls back to console logging when the env var is unset so dev
 * installs see submissions without configuration.
 */
export async function deliverBid(invitation: BidInvitation): Promise<void> {
  const url = process.env.BID_ZAPIER_HOOK_URL;
  if (!url) {
    console.info("[bid] BID_ZAPIER_HOOK_URL not set; logging only:", invitation);
    return;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(invitation),
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    console.error("[bid] zapier hook rejected", response.status, invitation);
    throw new Error(`Zapier hook returned ${response.status}`);
  }
}
