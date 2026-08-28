import { escapeHtml } from "./escapeHtml.ts";

export function formatErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

/**
 * 入力異常用の HTML。タイトルは Untitled やファイル名にしない。
 */
export function renderErrorPage(message: string, sourcePath: string): string {
  const safeMessage = escapeHtml(message);
  const safePath = escapeHtml(sourcePath);
  return `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>入力エラー</title>
  </head>
  <body>
    <h1>入力エラー</h1>
    <p>ソース: ${safePath}</p>
    <pre>${safeMessage}</pre>
  </body>
</html>
`;
}
