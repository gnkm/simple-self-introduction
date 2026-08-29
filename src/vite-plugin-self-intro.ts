/**
 * @fileoverview 自己紹介ページを開発サーバと本番 dist に出す Vite プラグイン。
 *
 * 開発時は `GET /` と `GET /index.html` に完成 HTML を返す。ブラウザは Markdown を再取得しない。
 * ソース Markdown の変更ではフルリロードする。
 * 本番ビルドでは同じ HTML と CSS を `dist/` に書き、プレースホルダの JS は残さない。
 */
import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Plugin, ResolvedConfig, ViteDevServer } from "vite";
import { convertMarkdownToPage } from "./markdown/convertMarkdown.ts";
import {
  readSourceMarkdown,
  resolveSourceMarkdownPath,
} from "./markdown/readSource.ts";
import { formatErrorMessage, renderErrorPage } from "./render/errorPage.ts";
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

async function renderSourcePageHtml(root: string): Promise<string> {
  const markdown = await readSourceMarkdown(root);
  const { frontmatter, bodyHtml } = convertMarkdownToPage(markdown);
  return renderPageHtml(frontmatter, bodyHtml);
}

async function writeStaticSite(root: string, outDir: string): Promise<void> {
  const html = await renderSourcePageHtml(root);
  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, "index.html"), html, "utf8");
  for (const [href, relativePath] of Object.entries(STYLESHEET_FILES)) {
    await copyFile(
      path.resolve(root, relativePath),
      path.join(outDir, path.basename(href)),
    );
  }
  // プレースホルダの index.html 由来。完成ページは JS を読まない
  await rm(path.join(outDir, "assets"), { recursive: true, force: true });
}

/**
 * GET / で完成 HTML を返す。ビルドでは dist に同じページを書く。
 *
 * @returns Vite プラグイン
 */
export function selfIntroPlugin(): Plugin {
  let resolved: ResolvedConfig | undefined;
  let wroteStaticSite = false;

  return {
    name: "self-intro",
    configResolved(config) {
      resolved = config;
    },
    async closeBundle() {
      if (resolved === undefined || resolved.command !== "build") {
        return;
      }
      if (wroteStaticSite) {
        return;
      }
      wroteStaticSite = true;
      const root = resolved.root;
      const outDir = path.resolve(root, resolved.build.outDir);
      const sourcePath = resolveSourceMarkdownPath(root);
      try {
        await writeStaticSite(root, outDir);
      } catch (error) {
        console.error(`入力異常: ${sourcePath}`);
        console.error(error);
        throw error;
      }
    },
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
          const sourcePath = resolveSourceMarkdownPath(server.config.root);
          try {
            const html = injectViteClient(
              await renderSourcePageHtml(server.config.root),
            );
            res.statusCode = 200;
            res.setHeader("Content-Type", "text/html; charset=utf-8");
            if (req.method === "HEAD") {
              res.end();
              return;
            }
            res.end(html);
          } catch (error) {
            console.error(`入力異常: ${sourcePath}`);
            console.error(error);
            const html = injectViteClient(
              renderErrorPage(formatErrorMessage(error), sourcePath),
            );
            res.statusCode = 500;
            res.setHeader("Content-Type", "text/html; charset=utf-8");
            if (req.method === "HEAD") {
              res.end();
              return;
            }
            res.end(html);
          }
        })();
      });
    },
  };
}
