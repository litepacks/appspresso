import { existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const demoIndex = join(root, "demo", "dist", "index.html");
const distLib = join(root, "dist-lib");

if (!existsSync(demoIndex)) {
  console.error(
    "appspresso: demo/dist is missing. Run `npm run demo:build` or `npm run ci:native:android`.",
  );
  process.exit(1);
}

if (!existsSync(distLib)) {
  console.error(
    "appspresso: dist-lib is missing. Run `npm run build:lib` first.",
  );
  process.exit(1);
}
