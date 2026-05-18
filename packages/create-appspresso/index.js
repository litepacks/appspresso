#!/usr/bin/env node
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { runInit } from "@appspresso/cli-shared";

const __dirname = dirname(fileURLToPath(import.meta.url));
const templateDir = join(__dirname, "template");

runInit(process.argv.slice(2), { entry: "create", templateDir }).catch(
  (err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  },
);
