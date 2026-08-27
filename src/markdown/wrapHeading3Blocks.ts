type HastChild = {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastChild[];
};

type HastElement = {
  type: "element";
  tagName: string;
  properties: Record<string, unknown>;
  children: HastChild[];
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

function isElement(node: HastChild): node is HastElement {
  return (
    node.type === "element" &&
    typeof node.tagName === "string" &&
    Array.isArray(node.children)
  );
}

function el(
  tagName: string,
  children: HastChild[],
  className: string,
): HastElement {
  return {
    type: "element",
    tagName,
    properties: { className: [className] },
    children,
  };
}

function hasClass(node: HastElement, className: string): boolean {
  const value = node.properties.className;
  return Array.isArray(value) && value.includes(className);
}

function wrapSectionHeading3Blocks(section: HastElement): void {
  const blocks: HastChild[] = [];
  let currentBlock: HastElement | undefined;

  for (const child of section.children) {
    if (isElement(child) && child.tagName === "h3") {
      currentBlock = el("div", [child], "h3-block");
      blocks.push(currentBlock);
      continue;
    }
    if (currentBlock !== undefined) {
      currentBlock.children.push(child);
      continue;
    }
    blocks.push(child);
  }

  const grouped: HastChild[] = [];
  let grid: HastElement[] = [];

  const flushGrid = (): void => {
    if (grid.length === 0) {
      return;
    }
    grouped.push(el("div", grid, "h3-grid"));
    grid = [];
  };

  for (const child of blocks) {
    if (isElement(child) && hasClass(child, "h3-block")) {
      grid.push(child);
      continue;
    }
    flushGrid();
    grouped.push(child);
  }
  flushGrid();

  section.children = grouped;
}

/**
 * 見出し 3 から次の見出し 3 直前までをブロックにし、連続ブロックを 1〜2 列グリッドにする。
 * 見出し名では分岐しない。
 */
export function wrapHeading3Blocks(tree: unknown): void {
  if (!isHastParent(tree)) {
    return;
  }

  for (const child of tree.children) {
    if (isElement(child) && child.tagName === "section") {
      wrapSectionHeading3Blocks(child);
    }
  }
}
