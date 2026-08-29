/**
 * @fileoverview ソース Markdown を frontmatter と本文 HTML に変換する入口。
 *
 * 正規表現で Markdown 全体を置換せず、unified の mdast / hast を順に加工する。
 * 本文中の生 HTML は hast に通さない。
 */
import rehypeStringify from "rehype-stringify";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { autolinkHttpUrls } from "./autolinkHttpUrls.ts";
import { collapseCjkLineBreakSpaces } from "./collapseCjkLineBreakSpaces.ts";
import { densifyLists } from "./densifyLists.ts";
import { expandNamePlaceholder } from "./expandName.ts";
import { extractFrontmatter, type Frontmatter } from "./frontmatter.ts";
import { markExternalLinks } from "./markExternalLinks.ts";
import { parseMarkdown } from "./parseMarkdown.ts";
import { removeYamlAndTitleHeadings } from "./prepareBodyAst.ts";
import { wrapHeading2Sections } from "./wrapHeading2Sections.ts";
import { wrapHeading3Blocks } from "./wrapHeading3Blocks.ts";

/** 変換結果。ヘッダ用の frontmatter と本文 HTML。 */
export type ConvertedPage = {
  frontmatter: Frontmatter;
  bodyHtml: string;
};

/**
 * 正規表現置換ではなく unified パイプラインで HTML にする。
 * 生 HTML は hast に通さない（allowDangerousHtml 既定 false）。
 *
 * @param source - ソース Markdown 全文
 * @returns frontmatter と本文 HTML
 */
export function convertMarkdownToPage(source: string): ConvertedPage {
  const markdownAst = parseMarkdown(source);
  const frontmatter = extractFrontmatter(markdownAst);
  expandNamePlaceholder(markdownAst, frontmatter.name);
  removeYamlAndTitleHeadings(markdownAst);
  collapseCjkLineBreakSpaces(markdownAst);
  autolinkHttpUrls(markdownAst);

  const htmlAst = unified()
    .use(remarkRehype, { allowDangerousHtml: false })
    .runSync(markdownAst);
  wrapHeading2Sections(htmlAst);
  densifyLists(htmlAst);
  wrapHeading3Blocks(htmlAst);
  markExternalLinks(htmlAst);

  return {
    frontmatter,
    bodyHtml: unified().use(rehypeStringify).stringify(htmlAst),
  };
}
