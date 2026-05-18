import { runCapConfig } from "./cap-config.mjs";
import { runDoctor } from "./doctor.mjs";
import { routeNative } from "./native.mjs";
import { npmScriptCommands, runNpmScriptCommand } from "./scripts.mjs";
import { runViteCommand, subToViteArgs } from "./vite.mjs";

const usage = `Appspresso CLI

  appspresso dev|build|preview [...]   Vite in the current directory (optional appspresso.config.ts)
  appspresso cap:config                 appspresso.config.ts → capacitor.config.json (plugins merged)
  appspresso lint|lint:fix|test|test:run|build:lib|demo:cap-config|...   npm run in nearest package (skips appspresso-only shims)
  appspresso native sync [--skip-build] [...]
  appspresso native open <android|ios> [...]
  appspresso native run <android|ios> [...]
  appspresso native assemble android|ios [debug|release] [...]
  appspresso doctor                       Environment quick check (Node, Vite, Capacitor)
  appspresso help`;

/**
 * @param {string[]} argv
 */
export async function runCli(argv) {
  const cwd = process.cwd();
  const cmd = argv[0];

  if (cmd === "help" || cmd === "-h" || cmd === "--help") {
    console.log(usage);
    process.exit(0);
  }

  if (!cmd) {
    console.error(usage);
    process.exit(1);
  }

  if (cmd === "doctor") {
    await runDoctor(cwd);
    return;
  }

  if (cmd === "cap:config") {
    await runCapConfig(cwd);
    return;
  }

  if (cmd === "native") {
    const sub = argv[1];
    if (!sub) {
      console.error(usage);
      process.exit(1);
    }
    await routeNative(cwd, sub, argv.slice(2));
    return;
  }

  if (npmScriptCommands.has(cmd)) {
    await runNpmScriptCommand(cwd, cmd, argv.slice(1));
    return;
  }

  if (!(cmd in subToViteArgs)) {
    console.error(usage);
    process.exit(1);
  }

  /** @type {"dev"|"build"|"preview"} */
  const viteSub = cmd;
  runViteCommand(cwd, viteSub, argv.slice(1));
}
