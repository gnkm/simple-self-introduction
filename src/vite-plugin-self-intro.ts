import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Plugin } from "vite";
import { convertMarkdownToPage } from "./markdown/convertMarkdown.ts";
import { readSourceMarkdown } from "./markdown/readSource.ts";
import {
  LIST_LAYOUT_STYLESHEET_HREF,
  renderPageHtml,
} from "./render/pageHtml.ts";

function requestPath(url: string | undefined): string {
  if (url === undefined) {
    return "";
  }
  const [path = ""] = url.split("?");
  return path;
}

function isPageRequest(url: string | undefined): boolean {
  const pathname = requestPath(url);
  return pathname === "/" || pathname === "/index.html";
}

function isStylesheetRequest(url: string | undefined): boolean {
  return requestPath(url) === LIST_LAYOUT_STYLESHEET_HREF;
}

function resolveListLayoutCssPath(rootDir: string): string {
  return path.resolve(rootDir, "src/styles/list-layout.css");
}

/**
 * GET / で完成 HTML を返す。ブラウザに Markdown を再取得させない。
 */
export function selfIntroPlugin(): Plugin {
  return {
    name: "self-intro",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.method !== "GET" && req.method !== "HEAD") {
          next();
          return;
        }
        if (isStylesheetRequest(req.url)) {
          void (async () => {
            const css = await readFile(
              resolveListLayoutCssPath(server.config.root),
              "utf8",
            );
            res.statusCode = 200;
            res.setHeader("Content-Type", "text/css; charset=utf-8");
            if (req.method === "HEAD") {
              res.end();
              return;
            }
            res.end(css);
          })().catch(next);
          return;
        }

        if (!isPageRequest(req.url)) {
          next();
          return;
        }

        void (async () => {
          const markdown = await readSourceMarkdown(server.config.root);
          const { frontmatter, bodyHtml } = convertMarkdownToPage(markdown);
          const html = renderPageHtml(frontmatter, bodyHtml);
          res.statusCode = 200;
          res.setHeader("Content-Type", "text/html; charset=utf-8");
          if (req.method === "HEAD") {
            res.end();
            return;
          }
          res.end(html);
        })().catch(next);
      });
    },
  };
}
