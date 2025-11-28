// server/vite.ts
import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { type Server } from "http";
import { nanoid } from "nanoid";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function defaultLog(...args: any[]) {
  console.log("[vite-shim]", ...args);
}

let viteAvailable = false;
let createViteServer: any = null;
let viteCreateLogger: any = null;

try {
  // try dynamic require; this prevents top-level ESM resolution errors when vite is missing
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const vitePkg = require("vite");
  createViteServer = vitePkg.createServer;
  viteCreateLogger = vitePkg.createLogger;
  viteAvailable = !!createViteServer;
} catch (err) {
  viteAvailable = false;
}

/** Lightweight logger wrapper used whether vite exists or not */
const viteLogger = viteAvailable && viteCreateLogger ? viteCreateLogger() : { 
  info: (...a: any[]) => defaultLog(...a),
  warn: (...a: any[]) => defaultLog(...a),
  error: (...a: any[]) => defaultLog(...a),
  clear: () => undefined,
};

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  if (!viteAvailable || !createViteServer) {
    log("Vite not installed — running in shim mode. Frontend dev middleware disabled.");
    return;
  }

  // create a Vite dev server in middleware (SSR) mode
  try {
    const serverOptions = {
      middlewareMode: true as const,
      hmr: { server },
      // allow hosts set to true in some configs; keep permissive for local dev
      // When using Vite typed options, the field name may differ across versions; keep minimal here
    };

    const vite = await createViteServer({
      server: serverOptions,
      appType: "custom",
      // customLogger: use vite's logger but intercept errors to fail fast
      // if vite exposes createLogger, we already created viteLogger above
      customLogger: {
        ...viteLogger,
        error: (msg: any, options?: any) => {
          try {
            viteLogger.error(msg, options);
          } finally {
            // if Vite hits a fatal error, we want to surface it during dev
            // but do not forcibly exit in production-like situations
            if (process.env.NODE_ENV === "development") {
              process.exit(1);
            }
          }
        },
      },
    });

    // mount vite middleware
    app.use(vite.middlewares);

    // Serve index.html transformed by Vite for all other routes
    app.use("*", async (req: any, res: any, next: any) => {
      const url = req.originalUrl;

      try {
        const clientTemplate = path.resolve(__dirname, "..", "client", "index.html");

        // always reload the index.html file from disk incase it changes
        let template = await fs.promises.readFile(clientTemplate, "utf-8");

        // force-bust the main entry to avoid caching during dev
        template = template.replace(
          `src="/src/main.tsx"`,
          `src="/src/main.tsx?v=${nanoid()}"`,
        );

        const page = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(page);
      } catch (e) {
        // allow Vite to fix the stack trace if available, otherwise forward the error
        try {
          if (typeof vite?.ssrFixStacktrace === "function") vite.ssrFixStacktrace(e as Error);
        } catch {}
        next(e);
      }
    });

    log("Vite dev middleware mounted.");
  } catch (e) {
    log("Error starting Vite dev server:", "vite");
    log(String(e), "vite");
    // if Vite initialization fails, continue without it
  }
}

export function serveStatic(app: Express) {
  // prefer built client at client/dist or fallback to public
  const candidatePaths = [
    path.resolve(process.cwd(), "client", "dist"),
    path.resolve(process.cwd(), "public"),
  ];

  const distPath = candidatePaths.find((p) => fs.existsSync(p));

  if (!distPath) {
    log(`No built client found in ${candidatePaths.join(", ")} — frontend requests will 404.`);
    return;
  }

  log("Serving static built client from " + distPath);
  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
