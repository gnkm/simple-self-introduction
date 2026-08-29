/**
 * @fileoverview 和文の段落内改行が Markdown で ASCII スペースになるのを戻す。
 *
 * 一文一行のソースで「。」のあとに半角スペースが入ると、紙面で語間が空く。
 */
type MdastChild = {
  type: string;
  value?: string;
  children?: MdastChild[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isParent(
  node: unknown,
): node is { type?: string; children: MdastChild[] } {
  return isRecord(node) && Array.isArray(node.children);
}

const SKIP_TYPES = new Set(["code", "inlineCode", "yaml"]);

/** 和文（と句読点）のあいだに入った半角スペースだけを落とす */
const CJK_LINE_BREAK_SPACE =
  /([ぁ-んァ-ヶー一-龯々〆ゝゞ。、」』）】〉》]) ([ぁ-んァ-ヶー一-龯々〆ゝゞ「『（【〈《])/g;

/**
 * 和文句読点の直後に Markdown 改行由来の半角スペースがあれば除去する。
 *
 * @param tree - 走査する mdast。破壊的に書き換える
 */
export function collapseCjkLineBreakSpaces(tree: unknown): void {
  if (
    isRecord(tree) &&
    typeof tree.type === "string" &&
    SKIP_TYPES.has(tree.type)
  ) {
    return;
  }
  if (!isParent(tree)) {
    return;
  }

  for (const child of tree.children) {
    if (child.type === "text" && typeof child.value === "string") {
      child.value = child.value.replace(CJK_LINE_BREAK_SPACE, "$1$2");
      continue;
    }
    collapseCjkLineBreakSpaces(child);
  }
}
