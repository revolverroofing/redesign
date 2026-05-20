import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ShippingConsole } from "../shipping-console";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ShippingConsole", () => {
  it("renders all four operation tabs", () => {
    render(<ShippingConsole />);
    const tabs = within(screen.getByRole("navigation"));
    for (const label of ["Track", "Rates", "Ship", "Validate"]) {
      expect(tabs.getByRole("button", { name: label })).toBeInTheDocument();
    }
  });

  it("posts the tracking request to the right endpoint and shows the result", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({
          carrier: "ups",
          trackingNumber: "1Z999AA10123456784",
          status: "I",
          events: [],
        }),
        { status: 200, headers: { "content-type": "application/json" } }
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    render(<ShippingConsole />);

    await user.type(
      screen.getByLabelText(/Tracking number/i),
      "1Z999AA10123456784"
    );

    const submitButton = screen
      .getAllByRole("button", { name: /^Track$/ })
      .find((b) => b.getAttribute("type") === "submit");
    expect(submitButton).toBeDefined();
    await user.click(submitButton!);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const calledWith = String(fetchMock.mock.calls[0][0]);
    expect(calledWith).toContain("/api/shipping/track");
    expect(calledWith).toContain("carrier=ups");
    expect(calledWith).toContain("trackingNumber=1Z999AA10123456784");

    expect(await screen.findByText(/1Z999AA10123456784/)).toBeInTheDocument();
  });

  it("switches carriers when the FedEx toggle is clicked", async () => {
    const user = userEvent.setup();
    render(<ShippingConsole />);
    const fedex = screen.getByRole("button", { name: /^fedex$/i });
    expect(fedex).toHaveAttribute("aria-pressed", "false");
    await user.click(fedex);
    expect(fedex).toHaveAttribute("aria-pressed", "true");
  });
});
