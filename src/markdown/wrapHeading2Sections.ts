type HastChild = {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastChild[];
};

type HastParent = {
  children: HastChild[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isHastParent(node: unknown): node is HastParent {
  return isRecord(node) && Array.isArray(node.children);
}

function isHeading2(node: HastChild): boolean {
  return node.type === "element" && node.tagName === "h2";
}

/**
 * 見出し 2 から次の見出し 2 直前までを section にする（SRS-F-005）。
 * 見出し名では分岐しない。
 */
export function wrapHeading2Sections(tree: unknown): void {
  if (!isHastParent(tree)) {
    return;
  }

  const grouped: HastChild[] = [];
  let sectionChildren: HastChild[] | undefined;

  for (const child of tree.children) {
    if (isHeading2(child)) {
      sectionChildren = [child];
      grouped.push({
        type: "element",
        tagName: "section",
        properties: {},
        children: sectionChildren,
      });
      continue;
    }
    if (sectionChildren !== undefined) {
      sectionChildren.push(child);
      continue;
    }
    grouped.push(child);
  }

  tree.children = grouped;
}
