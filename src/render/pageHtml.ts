/**
 * @fileoverview 正常時の完成 HTML を文字列として組み立てる。
 *
 * ファイル I/O はしない。氏名と URL はヘッダへ、変換済み本文は main へ入れる。
 */
import type { Frontmatter } from "../markdown/frontmatter.ts";
import { escapeHtml } from "./escapeHtml.ts";
import { externalLinkAttributes } from "./externalLink.ts";

/** 画面・印刷の基本スタイルへのパス。 */
export const PAGE_STYLESHEET_HREF = "/page.css";
/** リスト置換後のレイアウト用スタイルへのパス。 */
export const LIST_LAYOUT_STYLESHEET_HREF = "/list-layout.css";

const HEADER_URL_KEYS = ["github", "blog", "x"] as const;

function renderHeaderUrls(frontmatter: Frontmatter): string {
  const items = HEADER_URL_KEYS.flatMap((key) => {
    const url = frontmatter[key];
    if (url === undefined) {
      return [];
    }
    const text = escapeHtml(url);
    const attrs = externalLinkAttributes(url);
    const extra =
      attrs === undefined ? "" : ` target="${attrs.target}" rel="${attrs.rel}"`;
    return [`<li><a href="${text}"${extra}>${text}</a></li>`];
  });
  if (items.length === 0) {
    return "";
  }
  return `<ul class="profile-urls">${items.join("")}</ul>`;
}

/**
 * 正常時の文書 HTML を返す。
 *
 * @param frontmatter - ヘッダに出す氏名と URL
 * @param bodyHtml - 変換済み本文（エスケープ済みの HTML 断片）
 */
export function renderPageHtml(
  frontmatter: Frontmatter,
  bodyHtml: string,
): string {
  const name = escapeHtml(frontmatter.name);
  return `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${name}</title>
    <link rel="stylesheet" href="${PAGE_STYLESHEET_HREF}" />
    <link rel="stylesheet" href="${LIST_LAYOUT_STYLESHEET_HREF}" />
  </head>
  <body>
    <header>
      <h1>${name}</h1>
      ${renderHeaderUrls(frontmatter)}
    </header>
    <main>${bodyHtml}</main>
  </body>
</html>
`;
}
