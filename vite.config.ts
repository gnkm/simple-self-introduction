import http from "node:http";
import { defineConfig, type Plugin } from "vite";

const DEV_PORT = 3210;

/**
 * Vite の host: true は LAN まで公開する。
 * localhost は IPv6 だけ、127.0.0.1 は IPv4 だけになり得るので、
 * もう一方のループバックだけ追加で待つ。
 */
function bindLoopbackOnly(): Plugin {
  return {
    name: "bind-loopback-only",
    configureServer(server) {
      const extra = http.createServer();
      extra.on("request", (req, res) => {
        server.httpServer?.emit("request", req, res);
      });
      extra.on("upgrade", (req, socket, head) => {
        server.httpServer?.emit("upgrade", req, socket, head);
      });

      const listenExtra = () => {
        const addr = server.httpServer?.address();
        if (!addr || typeof addr === "string") {
          return;
        }
        const isV6 = addr.family === "IPv6" || addr.family === 6;
        extra.listen(addr.port, isV6 ? "127.0.0.1" : "::1");
      };

      if (server.httpServer?.listening) {
        listenExtra();
      } else {
        server.httpServer?.once("listening", listenExtra);
      }
      server.httpServer?.on("close", () => {
        extra.close();
      });
    },
  };
}

export default defineConfig({
  plugins: [bindLoopbackOnly()],
  server: {
    host: "localhost",
    port: DEV_PORT,
    strictPort: true,
  },
});
