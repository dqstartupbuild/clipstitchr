import { describe, expect, it } from "vitest";
import { renderEmailConfirmationFormHtml } from "@/lib/clipstitchr/email/confirmation/renderEmailConfirmationFormHtml";

describe("renderEmailConfirmationFormHtml", () => {
  it("uses a clean local POST action and escapes every hidden value", () => {
    const html = renderEmailConfirmationFormHtml({
      csrfToken: 'csrf"><script>alert(1)</script>',
      fields: {
        expires: '123"><img src=x>',
        signature: 'signature"><script>',
        tokenRecordId: 'id"><script>',
      },
    });

    expect(html).toContain('<form action="/email/confirm" method="post">');
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).not.toContain("<img src=x>");
    expect(html).toContain("&quot;&gt;&lt;script&gt;");
    expect(html).not.toMatch(/(?:src|href)=["']https?:/i);
  });
});
