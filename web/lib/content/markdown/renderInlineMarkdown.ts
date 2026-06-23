import { escapeHtml } from "./escapeHtml";

type CodeSpan = { placeholder: string; html: string };

function isSafeUrl(url: string) {
  const trimmed = url.trim();

  if (trimmed.startsWith("/") || trimmed.startsWith("#")) {
    return true;
  }

  return /^https?:\/\//i.test(trimmed) || /^mailto:/i.test(trimmed);
}

function extractCodeSpans(text: string) {
  const codeSpans: CodeSpan[] = [];

  const withPlaceholders = text.replace(/`([^`]+)`/g, (_match, code) => {
    const placeholder = `\u0000CODE${codeSpans.length}\u0000`;

    codeSpans.push({
      placeholder,
      html: `<code>${escapeHtml(code)}</code>`,
    });

    return placeholder;
  });

  return { codeSpans, withPlaceholders };
}

function applyImages(text: string) {
  return text.replace(
    /!\[([^\]]*)\]\(([^)\s]+)\)/g,
    (match, alt: string, url: string) => {
      if (!isSafeUrl(url)) {
        return match;
      }

      return `<img src="${escapeHtml(url.trim())}" alt="${alt}" loading="lazy" />`;
    },
  );
}

function applyLinks(text: string) {
  return text.replace(
    /\[([^\]]+)\]\(([^)\s]+)\)/g,
    (match, label: string, url: string) => {
      if (!isSafeUrl(url)) {
        return match;
      }

      return `<a href="${escapeHtml(url.trim())}">${label}</a>`;
    },
  );
}

function applyEmphasis(text: string) {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/__([^_]+)__/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>")
    .replace(/(^|[^_])_([^_]+)_/g, "$1<em>$2</em>");
}

export function renderInlineMarkdown(text: string) {
  const { codeSpans, withPlaceholders } = extractCodeSpans(text);

  let html = escapeHtml(withPlaceholders);
  html = applyImages(html);
  html = applyLinks(html);
  html = applyEmphasis(html);

  for (const span of codeSpans) {
    html = html.replace(span.placeholder, span.html);
  }

  return html;
}
