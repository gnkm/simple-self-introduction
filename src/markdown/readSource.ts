import { readFile } from "node:fs/promises";
import path from "node:path";

export const SOURCE_MARKDOWN_RELATIVE_PATH = "contents/self-introduction.md";

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
