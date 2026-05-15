"use server";

import { headers } from "next/headers";
import { deliverLead, type Lead } from "@/lib/lead-delivery";

export type LeadFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Partial<Record<keyof Lead, string>>;
};

const SERVICE_TYPES = new Set([
  "residential",
  "commercial",
  "repairs",
  "other",
]);

const PHONE_DIGITS = /\d/g;

function trim(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function submitLead(
  _prev: LeadFormState,
  formData: FormData,
): Promise<LeadFormState> {
  // Honeypot — real users leave this empty; bots usually fill every field.
  if (trim(formData.get("company"))) {
    return { status: "success", message: "Thanks — we'll be in touch." };
  }

  const name = trim(formData.get("name"));
  const phone = trim(formData.get("phone"));
  const email = trim(formData.get("email"));
  const address = trim(formData.get("address")) || undefined;
  const serviceType = trim(formData.get("serviceType"));
  const message = trim(formData.get("message")) || undefined;

  const errors: NonNullable<LeadFormState["errors"]> = {};
  if (name.length < 2) errors.name = "Please tell us your name.";
  if ((phone.match(PHONE_DIGITS)?.length ?? 0) < 10)
    errors.phone = "Enter a phone number we can call you back on.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.email = "Enter a valid email address.";
  if (!SERVICE_TYPES.has(serviceType))
    errors.serviceType = "Pick the type of work you need.";

  if (Object.keys(errors).length > 0) {
    return {
      status: "error",
      message: "Please fix the highlighted fields and try again.",
      errors,
    };
  }

  const lead: Lead = {
    name,
    phone,
    email,
    address,
    serviceType,
    message,
    submittedAt: new Date().toISOString(),
    userAgent: (await headers()).get("user-agent") ?? undefined,
  };

  try {
    await deliverLead(lead);
  } catch {
    return {
      status: "error",
      message:
        "We couldn't send that just now. Please call us at the number above.",
    };
  }

  return {
    status: "success",
    message: "Thanks — a project manager will reach out within one business day.",
  };
}
