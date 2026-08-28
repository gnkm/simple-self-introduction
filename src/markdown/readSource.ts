/**
 * @fileoverview ソース Markdown のパス解決と読み取り。
 *
 * 探索するのはリポジトリ相対の `contents/self-introduction.md` だけである。
 * ファイルが無いときは ENOENT を分かりやすい Error に包む。
 */
import { readFile } from "node:fs/promises";
import path from "node:path";

/** ソース Markdown のリポジトリルート相対パス。 */
export const SOURCE_MARKDOWN_RELATIVE_PATH = "contents/self-introduction.md";

/**
 * ソース Markdown の絶対パスを返す。
 *
 * @param rootDir - リポジトリルート（Vite の `config.root`）
 */
export function resolveSourceMarkdownPath(rootDir: string): string {
  return path.resolve(rootDir, SOURCE_MARKDOWN_RELATIVE_PATH);
}

function isErrorWithCode(error: unknown): error is { code: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
  );
}

/**
 * ソース Markdown を UTF-8 で読む。
 *
 * @param rootDir - リポジトリルート
 * @returns ファイル内容
 * @throws ファイルが無いとき、パスを含む Error
 */
export async function readSourceMarkdown(rootDir: string): Promise<string> {
  const sourcePath = resolveSourceMarkdownPath(rootDir);
  try {
    return await readFile(sourcePath, "utf8");
  } catch (error) {
    if (isErrorWithCode(error) && error.code === "ENOENT") {
      throw new Error(`ソース Markdown がありません: ${sourcePath}`);
    }
    throw error;
  }
}
