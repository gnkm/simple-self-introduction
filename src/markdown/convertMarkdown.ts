import rehypeStringify from "rehype-stringify";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { parseMarkdown } from "./parseMarkdown.ts";

/**
 * 正規表現置換ではなく unified パイプラインで HTML にする。
 * 生 HTML は hast に通さない（allowDangerousHtml 既定 false）。
 */
export function convertMarkdownToHtml(source: string): string {
  const markdownAst = parseMarkdown(source);
  const htmlAst = unified()
    .use(remarkRehype, { allowDangerousHtml: false })
    .runSync(markdownAst);

  return unified().use(rehypeStringify).stringify(htmlAst);
}
