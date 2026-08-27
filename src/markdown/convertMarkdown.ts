import rehypeStringify from "rehype-stringify";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { autolinkHttpUrls } from "./autolinkHttpUrls.ts";
import { densifyLists } from "./densifyLists.ts";
import { expandNamePlaceholder } from "./expandName.ts";
import { extractFrontmatter, type Frontmatter } from "./frontmatter.ts";
import { markExternalLinks } from "./markExternalLinks.ts";
import { parseMarkdown } from "./parseMarkdown.ts";
import { removeYamlAndTitleHeadings } from "./prepareBodyAst.ts";
import { wrapHeading2Sections } from "./wrapHeading2Sections.ts";
import { wrapHeading3Blocks } from "./wrapHeading3Blocks.ts";

export type ConvertedPage = {
  frontmatter: Frontmatter;
  bodyHtml: string;
};

/**
 * 正規表現置換ではなく unified パイプラインで HTML にする。
 * 生 HTML は hast に通さない（allowDangerousHtml 既定 false）。
 */
export function convertMarkdownToPage(source: string): ConvertedPage {
  const markdownAst = parseMarkdown(source);
  const frontmatter = extractFrontmatter(markdownAst);
  expandNamePlaceholder(markdownAst, frontmatter.name);
  removeYamlAndTitleHeadings(markdownAst);
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
