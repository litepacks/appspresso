import { startStudioServer } from "./start.mjs";

const cwd = process.argv[2] ?? process.cwd();
const port = Number(process.env.STUDIO_PORT ?? 5178);

await startStudioServer({ cwd, port });
