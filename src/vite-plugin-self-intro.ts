import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Plugin, ViteDevServer } from "vite";
import { convertMarkdownToPage } from "./markdown/convertMarkdown.ts";
import {
  readSourceMarkdown,
  resolveSourceMarkdownPath,
} from "./markdown/readSource.ts";
import {
  LIST_LAYOUT_STYLESHEET_HREF,
  PAGE_STYLESHEET_HREF,
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

const STYLESHEET_FILES: Record<string, string> = {
  [PAGE_STYLESHEET_HREF]: "src/styles/page.css",
  [LIST_LAYOUT_STYLESHEET_HREF]: "src/styles/list-layout.css",
};

function stylesheetRelativePath(url: string | undefined): string | undefined {
  return STYLESHEET_FILES[requestPath(url)];
}

const VITE_CLIENT_SCRIPT =
  '<script type="module" src="/@vite/client"></script>';

function injectViteClient(html: string): string {
  if (html.includes("/@vite/client")) {
    return html;
  }
  return html.replace("</head>", `    ${VITE_CLIENT_SCRIPT}\n  </head>`);
}

function reloadOnSourceMarkdownChange(server: ViteDevServer): void {
  const sourcePath = resolveSourceMarkdownPath(server.config.root);
  server.watcher.add(sourcePath);

  const reloadIfSource = (changedPath: string) => {
    if (path.resolve(changedPath) !== sourcePath) {
      return;
    }
    server.hot.send({ type: "full-reload" });
  };

  server.watcher.on("change", reloadIfSource);
  server.watcher.on("add", reloadIfSource);
}

/**
 * GET / で完成 HTML を返す。ブラウザに Markdown を再取得させない。
 */
export function selfIntroPlugin(): Plugin {
  return {
    name: "self-intro",
    configureServer(server) {
      reloadOnSourceMarkdownChange(server);
      server.middlewares.use((req, res, next) => {
        if (req.method !== "GET" && req.method !== "HEAD") {
          next();
          return;
        }
        const stylesheetPath = stylesheetRelativePath(req.url);
        if (stylesheetPath !== undefined) {
          void (async () => {
            const css = await readFile(
              path.resolve(server.config.root, stylesheetPath),
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
          const html = injectViteClient(renderPageHtml(frontmatter, bodyHtml));
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
