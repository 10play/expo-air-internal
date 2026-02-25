import { createSdkMcpServer, tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod/v4";

export interface CliToolCallbacks {
  restartMetro?: (options?: { clearCache?: boolean }) => Promise<string>;
  forceRefresh?: () => Promise<string>;
  screenshotApp?: () => Promise<string>;
}

export function createCliToolsMcpServer(callbacks: CliToolCallbacks) {
  return createSdkMcpServer({
    name: "cli-tools",
    version: "1.0.0",
    tools: [
      tool(
        "restart_metro",
        "Restart the Metro bundler process. Use this when Metro is stuck, has stale cache, or needs a config reload. Set clear_cache to true to pass --clear and wipe the Metro cache.",
        { clear_cache: z.boolean().optional().describe("Pass --clear to Metro to reset the bundler cache. Use when you see stale module errors or dependency resolution failures.") },
        async ({ clear_cache }) => {
          if (!callbacks.restartMetro) {
            return {
              content: [{ type: "text" as const, text: "restart_metro is not available in this environment" }],
              isError: true,
            };
          }
          try {
            const result = await callbacks.restartMetro({ clearCache: clear_cache });
            return {
              content: [{ type: "text" as const, text: result }],
            };
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            return {
              content: [{ type: "text" as const, text: `Failed to restart Metro: ${message}` }],
              isError: true,
            };
          }
        },
      ),
      tool(
        "force_refresh",
        "Force a full reload of the app — completely re-fetches and re-executes the JavaScript bundle from Metro. Use this after making code changes when HMR/Fast Refresh doesn't pick them up.",
        {},
        async () => {
          if (!callbacks.forceRefresh) {
            return {
              content: [{ type: "text" as const, text: "force_refresh is not available in this environment" }],
              isError: true,
            };
          }
          try {
            const result = await callbacks.forceRefresh();
            return {
              content: [{ type: "text" as const, text: result }],
            };
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            return {
              content: [{ type: "text" as const, text: `Failed to force refresh: ${message}` }],
              isError: true,
            };
          }
        },
      ),
      tool(
        "screenshot_app",
        "Take a screenshot of the app running on the user's device, excluding the expo-air widget overlay. Returns the file path of the saved screenshot image which you can then view using the Read tool.",
        {},
        async () => {
          if (!callbacks.screenshotApp) {
            return {
              content: [{ type: "text" as const, text: "screenshot_app is not available in this environment" }],
              isError: true,
            };
          }
          try {
            const result = await callbacks.screenshotApp();
            return {
              content: [{ type: "text" as const, text: result }],
            };
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            return {
              content: [{ type: "text" as const, text: `Failed to take screenshot: ${message}` }],
              isError: true,
            };
          }
        },
      ),
    ],
  });
}
