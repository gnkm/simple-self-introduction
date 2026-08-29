/**
 * @fileoverview 正常時の完成 HTML を文字列として組み立てる。
 *
 * ファイル I/O はしない。氏名・サマリ・URL はヘッダへ、変換済み本文は main へ入れる。
 */
import { type Frontmatter, formatAsOf } from "../markdown/frontmatter.ts";
import { escapeHtml } from "./escapeHtml.ts";
import { externalLinkAttributes } from "./externalLink.ts";

/** 画面・印刷の基本スタイルへのパス。 */
export const PAGE_STYLESHEET_HREF = "/page.css";
/** リスト置換後のレイアウト用スタイルへのパス。 */
export const LIST_LAYOUT_STYLESHEET_HREF = "/list-layout.css";

const HEADER_URLS = [
  { key: "github", label: "GitHub" },
  { key: "blog", label: "Blog" },
  { key: "x", label: "X" },
] as const;

function renderHeaderUrls(frontmatter: Frontmatter): string {
  const items = HEADER_URLS.flatMap(({ key, label }) => {
    const url = frontmatter[key];
    if (url === undefined) {
      return [];
    }
    const href = escapeHtml(url);
    const attrs = externalLinkAttributes(url);
    const extra =
      attrs === undefined ? "" : ` target="${attrs.target}" rel="${attrs.rel}"`;
    return [
      `<li><a href="${href}"${extra}><span class="url-label">${label}</span><span class="url-plain">${href}</span></a></li>`,
    ];
  });
  if (items.length === 0) {
    return "";
  }
  return `<ul class="profile-urls">${items.join("")}</ul>`;
}

function renderLead(frontmatter: Frontmatter): string {
  if (frontmatter.summary === undefined) {
    return "";
  }
  return `<p class="lead">${escapeHtml(frontmatter.summary)}</p>`;
}

function renderAsOf(frontmatter: Frontmatter): string {
  if (frontmatter.updated === undefined) {
    return "";
  }
  return `<p class="as-of">${escapeHtml(formatAsOf(frontmatter.updated))}</p>`;
}

function renderPrintId(frontmatter: Frontmatter): string {
  const name = escapeHtml(frontmatter.name);
  if (frontmatter.updated === undefined) {
    return `<p class="print-id">${name}</p>`;
  }
  return `<p class="print-id">${name} · ${escapeHtml(formatAsOf(frontmatter.updated))}</p>`;
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
      <div class="header-top">
        <h1>${name}</h1>
        ${renderAsOf(frontmatter)}
      </div>
      ${renderLead(frontmatter)}
      ${renderHeaderUrls(frontmatter)}
    </header>
    <main>${bodyHtml}</main>
    ${renderPrintId(frontmatter)}
  </body>
</html>
`;
}
