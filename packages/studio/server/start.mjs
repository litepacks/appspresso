import cors from "cors";
import express from "express";
import { createServer as createViteServer } from "vite";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadCapacitorPreview, loadProjectConfig } from "./load-project.mjs";
import { runStudioCheck } from "./validate-all.mjs";
import { writeStudioSlices } from "./write/index.mjs";

const studioRoot = dirname(fileURLToPath(import.meta.url));
const pkgRoot = join(studioRoot, "..");

/**
 * @param {{ cwd: string, port?: number }} opts
 */
export async function startStudioServer(opts) {
  const cwd = opts.cwd;
  const port = opts.port ?? 5178;
  const host = "127.0.0.1";

  const app = express();
  app.use(cors());
  app.use(express.json({ limit: "2mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, cwd });
  });

  app.get("/api/project", async (_req, res) => {
    res.json(await loadProjectConfig(cwd));
  });

  app.get("/api/capacitor-preview", async (_req, res) => {
    res.json(await loadCapacitorPreview(cwd));
  });

  app.post("/api/check", async (_req, res) => {
    try {
      const report = await runStudioCheck(cwd, { json: false });
      res.json(report);
    } catch (e) {
      res.status(500).json({ ok: false, error: String(e) });
    }
  });

  app.post("/api/apply", (req, res) => {
    try {
      const written = writeStudioSlices(cwd, req.body ?? {});
      res.json({ ok: true, written });
    } catch (e) {
      res.status(400).json({ ok: false, error: String(e) });
    }
  });

  const vite = await createViteServer({
    configFile: join(pkgRoot, "vite.config.ts"),
    root: pkgRoot,
    server: { middlewareMode: true },
    appType: "spa",
  });

  app.use(vite.middlewares);

  return new Promise((resolve) => {
    const server = app.listen(port, host, () => {
      const url = `http://${host}:${port}`;
      console.log(`Appspresso Studio at ${url}`);
      console.log(`Project: ${cwd}`);
      resolve({ server, url });
    });
  });
}
