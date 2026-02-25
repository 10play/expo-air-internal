import chalk from "chalk";
import { randomBytes } from "crypto";
import * as path from "path";
import * as fs from "fs";
import { fileURLToPath } from "url";
import { appendSecret } from "../utils/common.js";
import { createCliToolsMcpServer } from "../server/cliToolsMcp.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ServerOptions {
  port: string;
  project?: string;
  pipeMetro?: boolean;
  metroPort?: string;
}

export async function serverCommand(options: ServerOptions): Promise<void> {
  console.log(chalk.blue("\n  expo-air server\n"));
  console.log(chalk.gray("  Starting WebSocket server only...\n"));

  const port = parseInt(options.port, 10);

  // Resolve project directory
  let projectRoot = options.project ? path.resolve(options.project) : process.cwd();

  // If running from the expo-air package root, default to example/
  const exampleDir = path.resolve(__dirname, "../..", "example");
  if (!options.project && fs.existsSync(path.join(exampleDir, "app.json"))) {
    if (!fs.existsSync(path.join(projectRoot, "app.json"))) {
      projectRoot = exampleDir;
      console.log(chalk.gray(`  Using example app: ${projectRoot}\n`));
    }
  }

  // Start prompt server with authentication secret
  const secret = process.env.EXPO_FLOW_SECRET || randomBytes(32).toString("hex");
  const { PromptServer } = await import("../server/promptServer.js");
  const server = new PromptServer(port, projectRoot, secret);
  await server.start();

  // Attach CLI tools MCP server (restart_metro, force_refresh, screenshot_app)
  const metroPort = parseInt(options.metroPort ?? "8081", 10);
  const mcpServer = createCliToolsMcpServer({
    restartMetro: async (opts) => {
      // Metro is an upstream process piping into us — we can't restart its process,
      // but we can trigger a full reload via the Metro message socket.
      const { WebSocket } = await import("ws");
      return new Promise((resolve, reject) => {
        const ws = new WebSocket(`ws://localhost:${metroPort}/message`);
        const timeout = setTimeout(() => { ws.close(); reject(new Error("Reload timed out")); }, 5000);
        ws.on("open", () => {
          ws.send(JSON.stringify({ version: 2, method: "reload" }));
          clearTimeout(timeout);
          ws.close();
          const cleared = opts?.clearCache ? " (note: cache clear requires a process restart — reload sent instead)" : "";
          resolve(`Full reload broadcast sent via Metro message socket on port ${metroPort}${cleared}`);
        });
        ws.on("error", (err: Error) => {
          clearTimeout(timeout);
          reject(new Error(`Could not reach Metro message socket on port ${metroPort}: ${err.message}`));
        });
      });
    },
    forceRefresh: async () => {
      const { WebSocket } = await import("ws");
      return new Promise((resolve, reject) => {
        const ws = new WebSocket(`ws://localhost:${metroPort}/message`);
        const timeout = setTimeout(() => { ws.close(); reject(new Error("Reload timed out")); }, 5000);
        ws.on("open", () => {
          ws.send(JSON.stringify({ version: 2, method: "reload" }));
          clearTimeout(timeout);
          ws.close();
          resolve(`Full reload broadcast sent via message socket on port ${metroPort}`);
        });
        ws.on("error", (err: Error) => {
          clearTimeout(timeout);
          reject(new Error(`Could not reach Metro message socket on port ${metroPort}: ${err.message}`));
        });
      });
    },
    screenshotApp: () => server.requestScreenshot(),
  });
  server.setMcpServer(mcpServer);

  console.log(chalk.green(`  ✓ Prompt server started on port ${port} (authenticated)`));
  console.log(chalk.gray(`    Project root: ${projectRoot}`));
  console.log(chalk.green(`  ✓ CLI tools MCP attached (metro port: ${metroPort})`));

  console.log(chalk.gray("\n  ─────────────────────────────────────────────"));
  console.log(chalk.white(`    WebSocket URL: ${appendSecret(`ws://localhost:${port}`, secret)}`));
  console.log(chalk.gray("  ─────────────────────────────────────────────"));
  console.log(chalk.yellow("\n  Waiting for prompts... (Ctrl+C to stop)\n"));

  // When --pipe-metro is set, read Metro output from stdin and pipe through
  // appendMetroLog so the agent can read logs with proper rotation.
  if (options.pipeMetro) {
    console.log(chalk.gray("  Piping stdin → Metro logs (.expo-air-metro.log)\n"));
    process.stdin.setEncoding("utf-8");
    process.stdin.on("data", (data: string) => {
      server.appendMetroLog("app", data);
    });
  }

  // Handle graceful shutdown
  const shutdown = async () => {
    console.log(chalk.gray("\n  Shutting down..."));
    await server.stop();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}
