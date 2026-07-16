import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { BillingRenewalDisclosure } from "./BillingRenewalDisclosure";

describe("BillingRenewalDisclosure", () => {
  it("states renewal and cancellation terms before Checkout", () => {
    const markup = renderToStaticMarkup(<BillingRenewalDisclosure />);

    expect(markup).toContain("renew monthly until canceled");
    expect(markup).toContain("Cancel in Settings");
    expect(markup).toContain("end of the paid month");
  });
});
