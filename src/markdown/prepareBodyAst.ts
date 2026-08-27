/**
 * frontmatter と見出し 1 を除く。氏名はヘッダの h1 に統合する。
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
