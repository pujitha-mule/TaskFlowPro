import dotenv from "dotenv";
dotenv.config();

import express, { type Request, type Response, type NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import cors from "cors";
import helmet from "helmet";
import type { AddressInfo } from "net";

// Auth disabled for local development
// import { setupAuth, isAuthenticated } from "./auth";

const app = express();

declare module "http" {
  interface IncomingMessage {
    rawBody: Buffer; // Better type for rawBody
  }
}

// Security + CORS
app.disable("x-powered-by");

// Configure helmet to allow Vite's inline scripts in development
if (process.env.NODE_ENV === "production") {
  app.use(helmet());
} else {
  app.use(
    helmet({
      contentSecurityPolicy: false,
    }),
  );
}

app.use(cors());
app.set("trust proxy", true);

// JSON + URL Parsing
app.use(
  express.json({
    // typed verify parameters so tsc won't complain
    verify: (req: Request, _res: Response, buf: Buffer) => {
      // Use declared type instead of 'any' to respect the declaration block
      (req as { rawBody: Buffer }).rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

// Middleware: API logging
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: any = undefined;
  const isApi = path.startsWith("/api"); // Determine once

  // Only override res.json if we are logging the response
  if (isApi) {
    const originalResJson = res.json;
    (res as any).json = function (bodyJson: any, ...args: any[]) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };
  }

  res.on("finish", () => {
    const duration = Date.now() - start;

    if (isApi) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;

      if (capturedJsonResponse) {
        try {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        } catch {}
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// -------------------------
// Always-available endpoints
// -------------------------

// Health check — returns JSON even while Vite middleware is active.
// Place this before setupVite so it never falls through to the client index.
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

(async () => {
  // 🛡️ AUTH DISABLED FOR LOCAL DEVELOPMENT
  // ✳ Remove comment and provide valid OIDC env vars to re-enable auth.
  // await setupAuth(app);

  // Register app routes (API endpoints)
  const server = await registerRoutes(app);

  // Centralized Error Handler (after routes)
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Unhandled error:", {
      status,
      message,
      stack: err?.stack,
    });

    res.status(status).json({ message });
  });

  // Vite Dev / Production Static Serving
  if (app.get("env") === "development") {
    // In development we mount Vite as middleware so unknown routes serve index.html
    await setupVite(app, server);
  } else {
    // In production serve static built files
    await serveStatic(app);
  }

  // 🔥 PORT HANDLING — FIXED FOR WINDOWS
  const port = parseInt(process.env.PORT || "5000", 10);

  // Listen (bind explicitly to localhost for local dev to avoid network ambiguity)
  server.listen(port, process.env.BIND_HOST || "127.0.0.1", () => {
    // Primary log
    log(`Server listening on port ${port}`);

    // Additional address inspection to help debug binding issues
    try {
      const addr = server.address();
      if (addr) {
        const addrStr =
          typeof addr === "string"
            ? addr
            : `${(addr as AddressInfo).address}:${(addr as AddressInfo).port}`;
        log(`server.address(): ${addrStr}`);
      } else {
        log("server.address(): null");
      }
    } catch (e) {
      log(`server.address() error: ${e}`);
      console.error(e);
    }
  });

  // Global Process Safety
  process.on("unhandledRejection", (reason) =>
    console.error("Unhandled Rejection:", reason),
  );

  process.on("uncaughtException", (err) =>
    console.error("Uncaught Exception:", err),
  );
})();
