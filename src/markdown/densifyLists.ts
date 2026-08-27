type HastChild = {
  type: string;
  tagName?: string;
  value?: string;
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

function isList(node: HastChild): node is HastElement {
  return isElement(node) && (node.tagName === "ul" || node.tagName === "ol");
}

function el(
  tagName: string,
  children: HastChild[] = [],
  classNames: string[] = [],
): HastElement {
  const properties: Record<string, unknown> =
    classNames.length === 0 ? {} : { className: classNames };
  return { type: "element", tagName, properties, children };
}

function textContent(node: HastChild): string {
  if (node.type === "text" && typeof node.value === "string") {
    return node.value;
  }
  if (node.children === undefined) {
    return "";
  }
  return node.children.map(textContent).join("");
}

function listItems(list: HastElement): HastElement[] {
  return list.children.filter(
    (child): child is HastElement => isElement(child) && child.tagName === "li",
  );
}

function itemParts(item: HastElement): {
  label: HastChild[];
  nested: HastElement | undefined;
} {
  const label: HastChild[] = [];
  let nested: HastElement | undefined;

  for (const child of item.children) {
    if (isList(child)) {
      if (nested === undefined) {
        nested = child;
      } else {
        nested.children = [...nested.children, ...child.children];
      }
      continue;
    }
    if (isElement(child) && child.tagName === "p") {
      label.push(...child.children);
      continue;
    }
    if (
      child.type === "text" &&
      typeof child.value === "string" &&
      child.value.trim() === ""
    ) {
      continue;
    }
    label.push(child);
  }

  return { label, nested };
}

function previousElement(
  nodes: HastChild[],
  index: number,
): HastElement | undefined {
  for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
    const node = nodes[cursor];
    if (node !== undefined && isElement(node)) {
      return node;
    }
  }
  return undefined;
}

function hasNestedList(list: HastElement): boolean {
  return listItems(list).some((item) => itemParts(item).nested !== undefined);
}

function appendSeparated(target: HastChild[], extra: HastChild[]): void {
  if (extra.length === 0) {
    return;
  }
  if (target.length > 0) {
    target.push({ type: "text", value: " " });
  }
  target.push(...extra);
}

/** 見える階層は 2 段まで。それより深い文言は畳んで残す（省略しない）。 */
function phrasingWithDescendants(item: HastElement): HastChild[] {
  const { label, nested } = itemParts(item);
  const content = [...label];
  if (nested !== undefined) {
    for (const child of listItems(nested)) {
      appendSeparated(content, phrasingWithDescendants(child));
    }
  }
  return content;
}

function listToTags(list: HastElement): HastElement {
  const items: HastElement[] = [];
  for (const item of listItems(list)) {
    const { label, nested } = itemParts(item);
    if (label.length > 0) {
      items.push(el("li", label));
    }
    if (nested !== undefined) {
      items.push(...listItems(listToTags(nested)));
    }
  }
  return el("ul", items, ["tags"]);
}

function listToTable(list: HastElement): HastElement {
  const rows = listItems(list).map((item) => {
    return el("tr", [el("td", phrasingWithDescendants(item))]);
  });
  return el("table", [el("tbody", rows)]);
}

function listToSkillGroups(list: HastElement): HastElement {
  const groups = listItems(list).map((item) => {
    const { label, nested } = itemParts(item);
    const children: HastChild[] = [el("div", label, ["skill-parent"])];
    if (nested !== undefined) {
      children.push(listToTags(nested));
    }
    return el("div", children, ["skill-group"]);
  });
  return el("div", groups, ["skill-groups"]);
}

function listToNestedGroups(list: HastElement): HastElement {
  const groups = listItems(list).map((item) => {
    const { label, nested } = itemParts(item);
    const children: HastChild[] = [el("div", label, ["list-parent"])];
    if (nested !== undefined) {
      children.push(listToTags(nested));
    }
    return el("div", children, ["list-group"]);
  });
  return el("div", groups, ["list-groups"]);
}

function listToFlatGrid(list: HastElement): HastElement {
  const items = listItems(list).map((item) => {
    return el("li", phrasingWithDescendants(item));
  });
  return el("ul", items, ["list-grid"]);
}

function sectionTitle(section: HastElement): string {
  const heading = section.children.find(
    (child) => isElement(child) && child.tagName === "h2",
  );
  return heading === undefined ? "" : textContent(heading).trim();
}

function densifyList(
  list: HastElement,
  title: string,
  previous: HastElement | undefined,
): HastElement {
  if (title === "資格") {
    return listToTable(list);
  }
  if (title === "スキル") {
    return listToSkillGroups(list);
  }
  if (
    previous !== undefined &&
    previous.tagName === "p" &&
    textContent(previous).includes("課金しています")
  ) {
    return listToTags(list);
  }
  if (hasNestedList(list)) {
    return listToNestedGroups(list);
  }
  return listToFlatGrid(list);
}

function densifySection(section: HastElement): void {
  const title = sectionTitle(section);
  section.children = section.children.map((child, index, siblings) => {
    if (!isList(child)) {
      return child;
    }
    return densifyList(child, title, previousElement(siblings, index));
  });
}

/**
 * 箇条書きを表・グループ・タグへ置き換える（SRS 3.1.3）。
 * 「資格」「スキル」と「課金しています」だけ見出し／文言で分岐し、他は入れ子の有無で決める。
 */
export function densifyLists(tree: unknown): void {
  if (!isHastParent(tree)) {
    return;
  }

  for (const child of tree.children) {
    if (isElement(child) && child.tagName === "section") {
      densifySection(child);
    }
  }
}
