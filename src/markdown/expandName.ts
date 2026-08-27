type Walkable = {
  type: string;
  value?: string;
  children?: Walkable[];
};

function isWalkable(node: unknown): node is Walkable {
  return (
    typeof node === "object" &&
    node !== null &&
    "type" in node &&
    typeof node.type === "string"
  );
}

/**
 * 本文・見出しの `{name}` を frontmatter の name で置換する。
 */
export function expandNamePlaceholder(tree: unknown, name: string): void {
  if (!isWalkable(tree)) {
    return;
  }
  if (tree.type !== "yaml" && typeof tree.value === "string") {
    tree.value = tree.value.replaceAll("{name}", name);
  }
  if (tree.children === undefined) {
    return;
  }
  for (const child of tree.children) {
    expandNamePlaceholder(child, name);
  }
}
