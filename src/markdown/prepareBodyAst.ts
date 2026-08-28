/**
 * @fileoverview ページ本文から YAML と見出し 1 を除く。
 *
 * 氏名は `render/pageHtml.ts` のヘッダ h1 に出すため、本文側の重複を残さない。
 */

/**
 * frontmatter と見出し 1 を除く。氏名はヘッダの h1 に統合する。
 *
 * @param tree - 子ノードを持つ mdast。破壊的に書き換える
 */
export function removeYamlAndTitleHeadings(tree: {
  children: Array<{ type: string; depth?: number }>;
}): void {
  for (let index = tree.children.length - 1; index >= 0; index -= 1) {
    const node = tree.children[index];
    if (node === undefined) {
      continue;
    }
    if (node.type === "yaml") {
      tree.children.splice(index, 1);
      continue;
    }
    if (node.type === "heading" && node.depth === 1) {
      tree.children.splice(index, 1);
    }
  }
}
