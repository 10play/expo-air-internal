import { createSdkMcpServer, tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod/v4";

export interface CliToolCallbacks {
  restartMetro?: () => Promise<string>;
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
        "Restart the Metro bundler process. Use this when Metro is stuck, has stale cache, or needs a config reload.",
        {},
        async () => {
          if (!callbacks.restartMetro) {
            return {
              content: [{ type: "text" as const, text: "restart_metro is not available in this environment" }],
              isError: true,
            };
          }
          try {
            const result = await callbacks.restartMetro();
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
        "Force the app to reload the JavaScript bundle from Metro. Use this after making code changes to ensure the app picks them up immediately.",
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
