import { escapeHtml } from "./escapeHtml.ts";

export function renderPageHtml(markdownSource: string): string {
  const body = escapeHtml(markdownSource);
  return `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Self Introduction</title>
  </head>
  <body>
    <main><pre>${body}</pre></main>
  </body>
</html>
`;
}
