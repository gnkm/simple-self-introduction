import remarkFrontmatter from "remark-frontmatter";
import remarkParse from "remark-parse";
import { unified } from "unified";

/**
 * Markdown を mdast にする。frontmatter・見出し・段落・リストは AST ノードになる。
 */
export function parseMarkdown(source: string) {
  return unified()
    .use(remarkParse)
    .use(remarkFrontmatter, ["yaml"])
    .parse(source);
}
