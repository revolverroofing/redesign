import type { NextRequest } from "next/server";
import { getProvider } from "@/lib/shipping";
import { badRequest, carrierFromRequest, handleError } from "../_helpers";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const trackingNumber = req.nextUrl.searchParams.get("trackingNumber");
    if (!trackingNumber) {
      return badRequest("trackingNumber query parameter is required");
    }
    const carrier = carrierFromRequest(req.nextUrl);
    const provider = getProvider(carrier);
    const result = await provider.track(trackingNumber);
    return Response.json(result);
  } catch (err) {
    return handleError(err);
  }
}
