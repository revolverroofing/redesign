"use server";

import { headers } from "next/headers";
import { deliverBid, type BidInvitation } from "@/lib/bid-delivery";

export type BidFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Partial<Record<keyof BidInvitation, string>>;
};

const SYSTEM_TYPES = new Set([
  "tpo",
  "epdm",
  "modified-bitumen",
  "bur",
  "pvc",
  "metal",
  "tear-off-and-replace",
  "other",
]);

const PHONE_DIGITS = /\d/g;
const URL_RE = /^https?:\/\/\S+$/i;

function trim(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function submitBid(
  _prev: BidFormState,
  formData: FormData,
): Promise<BidFormState> {
  if (trim(formData.get("website"))) {
    // Honeypot — silently succeed for bots.
    return { status: "success", message: "Thanks — our estimator will follow up." };
  }

  const companyName = trim(formData.get("companyName"));
  const contactName = trim(formData.get("contactName"));
  const contactEmail = trim(formData.get("contactEmail"));
  const contactPhone = trim(formData.get("contactPhone"));
  const projectName = trim(formData.get("projectName"));
  const projectLocation = trim(formData.get("projectLocation"));
  const projectSizeRaw = trim(formData.get("projectSizeSqFt"));
  const systemType = trim(formData.get("systemType"));
  const decisionDate = trim(formData.get("decisionDate")) || undefined;
  const prevailingWage = trim(formData.get("prevailingWage")) === "yes";
  const drawingsLink = trim(formData.get("drawingsLink")) || undefined;
  const notes = trim(formData.get("notes")) || undefined;

  const errors: NonNullable<BidFormState["errors"]> = {};
  if (companyName.length < 2) errors.companyName = "Tell us your company.";
  if (contactName.length < 2) errors.contactName = "Tell us your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail))
    errors.contactEmail = "Enter a valid email.";
  if ((contactPhone.match(PHONE_DIGITS)?.length ?? 0) < 10)
    errors.contactPhone = "Enter a phone number we can reach you on.";
  if (projectName.length < 2) errors.projectName = "Project name is required.";
  if (projectLocation.length < 2)
    errors.projectLocation = "City, state at minimum.";

  const projectSizeSqFt = Number(projectSizeRaw.replace(/[,\s]/g, ""));
  if (!Number.isFinite(projectSizeSqFt) || projectSizeSqFt < 100)
    errors.projectSizeSqFt = "Approximate square footage required (≥ 100).";

  if (!SYSTEM_TYPES.has(systemType))
    errors.systemType = "Pick a system type.";

  if (drawingsLink && !URL_RE.test(drawingsLink))
    errors.drawingsLink = "Enter a full URL (https://…) or leave blank.";

  if (Object.keys(errors).length > 0) {
    return {
      status: "error",
      message: "Please fix the highlighted fields and resubmit.",
      errors,
    };
  }

  const invitation: BidInvitation = {
    companyName,
    contactName,
    contactEmail,
    contactPhone,
    projectName,
    projectLocation,
    projectSizeSqFt,
    systemType,
    decisionDate,
    prevailingWage,
    drawingsLink,
    notes,
    submittedAt: new Date().toISOString(),
    userAgent: (await headers()).get("user-agent") ?? undefined,
  };

  try {
    await deliverBid(invitation);
  } catch {
    return {
      status: "error",
      message:
        "We couldn't route that just now. Please email us directly at the address below.",
    };
  }

  return {
    status: "success",
    message:
      "Thanks — our estimator will confirm receipt within one business day and have a written response back before your decision date.",
  };
}
