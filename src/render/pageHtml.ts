export function renderPageHtml(bodyHtml: string): string {
  return `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Self Introduction</title>
  </head>
  <body>
    <main>${bodyHtml}</main>
  </body>
</html>
`;
}
