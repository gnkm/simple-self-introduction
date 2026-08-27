import type { Plugin } from "vite";
import { readSourceMarkdown } from "./markdown/readSource.ts";
import { renderPageHtml } from "./render/pageHtml.ts";

function requestPath(url: string | undefined): string {
  if (url === undefined) {
    return "";
  }
  const [path = ""] = url.split("?");
  return path;
}

function isPageRequest(url: string | undefined): boolean {
  const path = requestPath(url);
  return path === "/" || path === "/index.html";
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
        if (!isPageRequest(req.url)) {
          next();
          return;
        }

        void (async () => {
          const markdown = await readSourceMarkdown(server.config.root);
          const html = renderPageHtml(markdown);
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
