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
 * Where bid invitations land. Replace this with the real integration:
 *   - POST to procurement inbox / CRM
 *   - Slack channel for the estimating team
 *   - Auto-create an opportunity in the bid management system
 *
 * Distinct from `deliverLead` because commercial bids should route to
 * estimating, not the residential intake queue.
 */
export async function deliverBid(invitation: BidInvitation): Promise<void> {
  console.info("[bid]", invitation);
}
