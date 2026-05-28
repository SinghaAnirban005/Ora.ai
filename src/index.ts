import chalk from "chalk";
import { analyseError } from "./analyser.js";
import type { ConsoleAIConfig, ConsoleAI } from "./types.js";

const DEFAULTS: Required<ConsoleAIConfig> = {
  provider: "anthropic",
  model: "",
  apiKey: "",
  baseURL: "",
  interceptConsoleError: true,
  interceptUncaught: true,
  scrubPatterns: [],
  maxStackLength: 3000,
  showRawError: true,
  label: "ora.ai",
  silent: false,
};

/**
 * Initialise ora.ai.
 *
 * @example
 * // ESM
 * import { init } from "ora.ai";
 * init({ provider: "anthropic" });
 *
 * @example
 * // CJS
 * const { init } = require("ora.ai");
 * init({ provider: "openai" });
 */
export function init(userConfig: ConsoleAIConfig = {}): ConsoleAI {
  const config = { ...DEFAULTS, ...userConfig } as Required<ConsoleAIConfig>;

  if (
    process.env["NODE_ENV"] === "production" &&
    !userConfig.silent
  ) {
    process.stderr.write(
      chalk.yellowBright(
        "[ora.ai] Warning: running in NODE_ENV=production. Consider enabling only in development.\n"
      )
    );
  }

  const originalConsoleError = console.error.bind(console);

  let busy = false;

  async function handle(error: unknown, rawArgs?: unknown[]): Promise<void> {
    if (busy || config.silent) return;
    busy = true;

    try {
      if (config.showRawError && rawArgs) {
        originalConsoleError(...rawArgs);
      }

      const output = await analyseError(error, config);
      process.stderr.write(output + "\n");
    } finally {
      busy = false;
    }
  }

  // intercept console.error
  if (config.interceptConsoleError) {
    console.error = (...args: unknown[]) => {
      const error = args.find((a) => a instanceof Error) ?? args[0];
      void handle(error, args);
    };
  }

  // intercept uncaught exceptions
  let uncaughtHandler: ((err: Error) => void) | undefined;
  let unhandledRejectionHandler:
    | ((reason: unknown) => void)
    | undefined;

  if (config.interceptUncaught) {
    uncaughtHandler = (err: Error) => {
      void handle(err);
    };
    unhandledRejectionHandler = (reason: unknown) => {
      void handle(reason);
    };

    process.on("uncaughtException", uncaughtHandler);
    process.on("unhandledRejection", unhandledRejectionHandler);
  }

  const instance: ConsoleAI = {
    async analyse(error: unknown): Promise<string> {
      return analyseError(error, config);
    },

    restore() {
      console.error = originalConsoleError;
      if (uncaughtHandler) {
        process.off("uncaughtException", uncaughtHandler);
      }
      if (unhandledRejectionHandler) {
        process.off("unhandledRejection", unhandledRejectionHandler);
      }
    },
  };

  return instance;
}

export type { ConsoleAIConfig, ConsoleAI, ErrorAnalysis } from "./types.js";