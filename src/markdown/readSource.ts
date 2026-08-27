import { readFile } from "node:fs/promises";
import path from "node:path";

export const SOURCE_MARKDOWN_RELATIVE_PATH = "contents/self-introduction.md";

export function resolveSourceMarkdownPath(rootDir: string): string {
  return path.resolve(rootDir, SOURCE_MARKDOWN_RELATIVE_PATH);
}

export async function readSourceMarkdown(rootDir: string): Promise<string> {
  return await readFile(resolveSourceMarkdownPath(rootDir), "utf8");
}
