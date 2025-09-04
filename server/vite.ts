// server/vite.ts
import express, { type Express } from "express";
import fs from "fs";
import path, { dirname } from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const viteLogger = createLogger();

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
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  // Use Vite's middlewares first
  app.use(vite.middlewares);

  // Add a fallback for HTML routes (after API routes are handled)
  app.use("*", async (req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }

    try {
      // point ke folder frontend, bukan public
      const clientIndex = path.resolve(__dirname, "../client/index.html");
      const template = await fs.promises.readFile(clientIndex, "utf-8");

      // Inject HMR token for cache busting
    const html = template.replace(
      `<script type="module" src="/main.tsx">`,
      `<script type="module" src="/main.tsx?v=${nanoid()}">`
    );


      // Let Vite transform the HTML
      const page = await vite.transformIndexHtml(req.originalUrl, html);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export async function serveStatic(app: Express, server: any) {
  const distPath = path.resolve(__dirname, "../public");

  if (!fs.existsSync(distPath)) {
    console.warn(`⚠️ No build found in ${distPath}, falling back to Vite dev server`);
    return setupVite(app, server); // fallback ke dev server
  }

  // Production mode: serve static files
  app.use(express.static(distPath));

  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
