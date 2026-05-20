import type { NextRequest } from "next/server";
import { AddressValidationRequest, getProvider } from "@/lib/shipping";
import { badRequest, carrierFromRequest, handleError } from "../_helpers";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AddressValidationRequest & {
      carrier?: string;
    };
    if (!body?.address?.street?.length || !body?.address?.postalCode) {
      return badRequest("address with street and postalCode is required");
    }
    const carrier = carrierFromRequest(req.nextUrl, body);
    const provider = getProvider(carrier);
    const result = await provider.validateAddress(body);
    return Response.json(result);
  } catch (err) {
    return handleError(err);
  }
}
