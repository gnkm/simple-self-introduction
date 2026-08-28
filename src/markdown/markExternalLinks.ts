/**
 * @fileoverview http(s) の a 要素に外部リンク属性を付け、空の href は取り除く。
 *
 * `target="_blank"` と `rel="noopener noreferrer"` を付与する。
 */
import { externalLinkAttributes } from "../render/externalLink.ts";

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

function hrefOf(
  properties: Record<string, unknown> | undefined,
): string | undefined {
  if (properties === undefined) {
    return undefined;
  }
  const href = properties.href;
  return typeof href === "string" ? href : undefined;
}

/**
 * http(s) の a に target="_blank" と rel="noopener noreferrer" を付ける（SRS 3.1.4）。
 * href が空の a は残さない。
 *
 * @param tree - 走査する hast。破壊的に書き換える
 */
export function markExternalLinks(tree: unknown): void {
  if (!isHastParent(tree)) {
    return;
  }

  tree.children = tree.children.flatMap((child) => {
    if (child.type === "element" && child.tagName === "a") {
      const href = hrefOf(child.properties);
      if (href === undefined || href.trim() === "") {
        return child.children ?? [];
      }
      const attrs = externalLinkAttributes(href);
      if (attrs !== undefined && child.properties !== undefined) {
        child.properties.target = attrs.target;
        child.properties.rel = attrs.rel;
      }
      return [child];
    }
    markExternalLinks(child);
    return [child];
  });
}
