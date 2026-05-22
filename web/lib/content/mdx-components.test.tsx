import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { mdxComponents } from "@/lib/content/mdx-components";

describe("mdxComponents", () => {
  it("renders styled prose primitives and call-to-action blocks", () => {
    const InlineLink = mdxComponents.a;
    const HeadingTwo = mdxComponents.h2;
    const HeadingThree = mdxComponents.h3;
    const Paragraph = mdxComponents.p;
    const UnorderedList = mdxComponents.ul;
    const OrderedList = mdxComponents.ol;
    const Blockquote = mdxComponents.blockquote;
    const Code = mdxComponents.code;
    const Pre = mdxComponents.pre;
    const CallToAction = mdxComponents.CallToAction;

    const markup = renderToStaticMarkup(
      <>
        <InlineLink href="/docs">Docs</InlineLink>
        <HeadingTwo>Heading two</HeadingTwo>
        <HeadingThree>Heading three</HeadingThree>
        <Paragraph>Paragraph copy</Paragraph>
        <UnorderedList>
          <li>Bullet</li>
        </UnorderedList>
        <OrderedList>
          <li>Step</li>
        </OrderedList>
        <Blockquote>Quote</Blockquote>
        <Code>inlineCode()</Code>
        <Pre>preformatted</Pre>
        <CallToAction />
        <CallToAction href="/waitlist" label="Join now" />
      </>,
    );

    expect(markup).toContain('href="/docs"');
    expect(markup).toContain("Heading two");
    expect(markup).toContain("Heading three");
    expect(markup).toContain("Paragraph copy");
    expect(markup).toContain("Bullet");
    expect(markup).toContain("Step");
    expect(markup).toContain("Quote");
    expect(markup).toContain("inlineCode()");
    expect(markup).toContain("preformatted");
    expect(markup).toContain("Join now");
  });
});
