import { escapeEmailConfirmationHtml } from "@/lib/clipstitchr/email/confirmation/escapeEmailConfirmationHtml";

export function createEmailConfirmationHtmlDocument({
  bodyHtml,
  title,
}: {
  bodyHtml: string;
  title: string;
}) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="referrer" content="no-referrer">
    <meta name="robots" content="noindex,nofollow,noarchive">
    <title>${escapeEmailConfirmationHtml(title)} | ClipStitchr</title>
    <style>
      :root { color-scheme: light; font-family: Arial, sans-serif; }
      * { box-sizing: border-box; }
      body { margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 24px; background: #f6f4ef; color: #191919; }
      main { width: min(100%, 560px); border: 1px solid #ded9cf; border-radius: 18px; padding: 32px; background: #fff; box-shadow: 0 18px 50px rgba(25, 25, 25, 0.08); }
      h1 { margin: 0; font-size: clamp(2rem, 7vw, 3.25rem); line-height: 1; }
      p { margin: 16px 0 0; color: #55514a; font-size: 1rem; line-height: 1.7; }
      button { margin-top: 24px; min-height: 46px; border: 0; border-radius: 10px; padding: 0 20px; background: #ec6a3a; color: #fff; font: inherit; font-weight: 700; cursor: pointer; }
      button:focus-visible { outline: 3px solid #191919; outline-offset: 3px; }
      a { display: inline-flex; min-height: 46px; align-items: center; margin-top: 24px; border-radius: 10px; padding: 0 20px; background: #ec6a3a; color: #fff; font-weight: 700; text-decoration: none; }
      a:focus-visible { outline: 3px solid #191919; outline-offset: 3px; }
    </style>
  </head>
  <body>
    <main>${bodyHtml}</main>
  </body>
</html>`;
}
