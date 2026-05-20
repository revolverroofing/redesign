import type { NextRequest } from "next/server";
import { getProvider, ShipRequest } from "@/lib/shipping";
import { badRequest, carrierFromRequest, handleError } from "../_helpers";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ShipRequest & { carrier?: string };
    if (
      !body?.shipper ||
      !body?.recipient ||
      !body?.packages?.length ||
      !body?.serviceCode
    ) {
      return badRequest(
        "shipper, recipient, packages, and serviceCode are required"
      );
    }
    const carrier = carrierFromRequest(req.nextUrl, body);
    const provider = getProvider(carrier);
    const result = await provider.createShipment(body);
    return Response.json(result);
  } catch (err) {
    return handleError(err);
  }
}
