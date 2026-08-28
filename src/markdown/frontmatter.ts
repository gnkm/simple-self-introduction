/**
 * @fileoverview mdast 先頭の YAML ノードからプロフィールを取り出す。
 *
 * `name` は必須。`github` / `blog` / `x` は任意。未知キーと空文字は無視する。
 */
import { parse as parseYaml } from "yaml";

/**
 * ソース Markdown 先頭 YAML から取り出すプロフィール。
 *
 * `name` は必須。URL 系は任意で、空文字は未設定として扱う。
 */
export type Frontmatter = {
  name: string;
  github?: string;
  blog?: string;
  x?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function optionalString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

/**
 * remark-frontmatter の yaml ノードをオブジェクトにする。未知キーは無視する。
 *
 * @param tree - 先頭付近に yaml ノードを持つ mdast
 * @returns 検証済みの frontmatter
 * @throws YAML が無い・オブジェクトでない・name が無いとき
 */
export function extractFrontmatter(tree: {
  children: readonly unknown[];
}): Frontmatter {
  const yamlNode = tree.children.find(
    (node): node is { type: "yaml"; value: string } =>
      isRecord(node) && node.type === "yaml" && typeof node.value === "string",
  );
  if (yamlNode === undefined) {
    throw new Error("frontmatter YAML がありません");
  }

  let parsed: unknown;
  try {
    parsed = parseYaml(yamlNode.value);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`frontmatter の YAML が壊れています: ${detail}`);
  }
  if (!isRecord(parsed)) {
    throw new Error("frontmatter がオブジェクトではありません");
  }

  const name = optionalString(parsed.name);
  if (name === undefined) {
    throw new Error("frontmatter の name がありません");
  }

  const frontmatter: Frontmatter = { name };
  const github = optionalString(parsed.github);
  const blog = optionalString(parsed.blog);
  const x = optionalString(parsed.x);
  if (github !== undefined) {
    frontmatter.github = github;
  }
  if (blog !== undefined) {
    frontmatter.blog = blog;
  }
  if (x !== undefined) {
    frontmatter.x = x;
  }
  return frontmatter;
}
