import type { NextRequest } from "next/server";
import { getProvider, RateRequest } from "@/lib/shipping";
import { badRequest, carrierFromRequest, handleError } from "../_helpers";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RateRequest & { carrier?: string };
    if (!body?.shipper || !body?.recipient || !body?.packages?.length) {
      return badRequest("shipper, recipient, and packages are required");
    }
    const carrier = carrierFromRequest(req.nextUrl, body);
    const provider = getProvider(carrier);
    const result = await provider.getRates(body);
    return Response.json(result);
  } catch (err) {
    return handleError(err);
  }
}
