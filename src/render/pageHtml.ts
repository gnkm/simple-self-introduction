import type { Frontmatter } from "../markdown/frontmatter.ts";
import { escapeHtml } from "./escapeHtml.ts";

const HEADER_LINKS = [
  { key: "github", label: "GitHub" },
  { key: "blog", label: "Blog" },
  { key: "x", label: "X" },
] as const;

function renderHeaderLinks(frontmatter: Frontmatter): string {
  const anchors = HEADER_LINKS.flatMap((spec) => {
    const href = frontmatter[spec.key];
    if (href === undefined) {
      return [];
    }
    return [`<a href="${escapeHtml(href)}">${spec.label}</a>`];
  });
  if (anchors.length === 0) {
    return "";
  }
  return `<nav>${anchors.join(" ")}</nav>`;
}

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
  </head>
  <body>
    <header>
      <h1>${name}</h1>
      ${renderHeaderLinks(frontmatter)}
    </header>
    <main>${bodyHtml}</main>
  </body>
</html>
`;
}
