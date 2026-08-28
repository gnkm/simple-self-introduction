/**
 * @fileoverview Markdown 文字列を mdast にする。
 *
 * remark-parse と remark-frontmatter（YAML）だけを使う。ここでは HTML にしない。
 */
import remarkFrontmatter from "remark-frontmatter";
import remarkParse from "remark-parse";
import { unified } from "unified";

/**
 * Markdown を mdast にする。frontmatter・見出し・段落・リストは AST ノードになる。
 *
 * @param source - ソース Markdown 全文
 * @returns remark の Root（mdast）
 */
export function parseMarkdown(source: string) {
  return unified()
    .use(remarkParse)
    .use(remarkFrontmatter, ["yaml"])
    .parse(source);
}
