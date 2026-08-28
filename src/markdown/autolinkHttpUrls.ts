/**
 * @fileoverview 本文テキスト中の素の http(s) URL を mdast の link ノードにする。
 *
 * 既存の link 内は走査しない。文末の句読点や対にならない閉じ括弧は URL から外す。
 */
type MdastChild = {
  type: string;
  value?: string;
  url?: string;
  children?: MdastChild[];
};

type MdastParent = {
  type?: string;
  children: MdastChild[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isParent(node: unknown): node is MdastParent {
  return isRecord(node) && Array.isArray(node.children);
}

function isText(node: MdastChild): node is MdastChild & { value: string } {
  return node.type === "text" && typeof node.value === "string";
}

const HTTP_URL_PATTERN = /https?:\/\/[^\s<>"'`]+/g;
const HAS_HTTP_URL = /https?:\/\/[^\s<>"'`]+/;
const TRAILING_SENTENCE_PUNCT = /[.,;:!?]+$/;

function unmatchedClosingParens(value: string): number {
  let open = 0;
  let extraClose = 0;
  for (const char of value) {
    if (char === "(") {
      open += 1;
    } else if (char === ")") {
      if (open > 0) {
        open -= 1;
      } else {
        extraClose += 1;
      }
    }
  }
  return extraClose;
}

function normalizeMatchedUrl(raw: string): { url: string; rest: string } {
  let url = raw.replace(TRAILING_SENTENCE_PUNCT, "");
  while (url.endsWith(")") && unmatchedClosingParens(url) > 0) {
    url = url.slice(0, -1);
  }
  if (url === "") {
    return { url: raw, rest: "" };
  }
  return { url, rest: raw.slice(url.length) };
}

function splitTextWithUrls(value: string): MdastChild[] {
  const nodes: MdastChild[] = [];
  let lastIndex = 0;

  for (const match of value.matchAll(HTTP_URL_PATTERN)) {
    const raw = match[0];
    const start = match.index;
    if (start > lastIndex) {
      nodes.push({ type: "text", value: value.slice(lastIndex, start) });
    }
    const { url, rest } = normalizeMatchedUrl(raw);
    nodes.push({
      type: "link",
      url,
      children: [{ type: "text", value: url }],
    });
    if (rest !== "") {
      nodes.push({ type: "text", value: rest });
    }
    lastIndex = start + raw.length;
  }

  if (lastIndex < value.length) {
    nodes.push({ type: "text", value: value.slice(lastIndex) });
  }
  return nodes;
}

/**
 * 本文テキスト中の http(s) URL を link ノードにする（SRS 3.1.2 単独行 URL）。
 * 既存の link 内は触らない。
 *
 * @param tree - 走査する mdast。破壊的に書き換える
 */
export function autolinkHttpUrls(tree: unknown): void {
  if (isRecord(tree) && tree.type === "link") {
    return;
  }
  if (!isParent(tree)) {
    return;
  }

  const next: MdastChild[] = [];
  for (const child of tree.children) {
    if (isText(child) && HAS_HTTP_URL.test(child.value)) {
      next.push(...splitTextWithUrls(child.value));
      continue;
    }
    autolinkHttpUrls(child);
    next.push(child);
  }
  tree.children = next;
}
