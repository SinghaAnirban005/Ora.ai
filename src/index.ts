import chalk from "chalk";
import { analyseError } from "./analyser.js";
import type { ConsoleAIConfig, ConsoleAI } from "./types.js";

const DEFAULTS: Required<ConsoleAIConfig> = {
  model: "",
  apiKey: "",
  interceptConsoleError: true,
  interceptUncaught: true,
  scrubPatterns: [],
  maxStackLength: 3000,
  showRawError: true,
  label: "Ora.ai",
  silent: false,
};

/**
 * Initialise Ora.ai with Groq.
 *
 * @example
 * import { init } from "@singhaanirban/ora.ai";
 * init(); // reads GROQ_API_KEY from env
 *
 * @example
 * init({ model: "llama-3.1-8b-instant", apiKey: process.env.MY_GROQ_KEY });
 */
export function init(userConfig: ConsoleAIConfig = {}): ConsoleAI {
  const config: Required<ConsoleAIConfig> = { ...DEFAULTS, ...userConfig };

  if (process.env["NODE_ENV"] === "production" && !config.silent) {
    process.stderr.write(
      chalk.yellowBright(
        "[Ora.ai] Warning: running in NODE_ENV=production. " +
          "Consider enabling only in development.\n"
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

  if (config.interceptConsoleError) {
    console.error = (...args: unknown[]) => {
      const error = args.find((a) => a instanceof Error) ?? args[0];
      void handle(error, args);
    };
  }

  let uncaughtHandler: ((err: Error) => void) | undefined;
  let rejectionHandler: ((reason: unknown) => void) | undefined;

  if (config.interceptUncaught) {
    uncaughtHandler = (err: Error) => void handle(err);
    rejectionHandler = (reason: unknown) => void handle(reason);

    process.on("uncaughtException", uncaughtHandler);
    process.on("unhandledRejection", rejectionHandler);
  }

  return {
    async analyse(error: unknown): Promise<string> {
      return analyseError(error, config);
    },

    restore() {
      console.error = originalConsoleError;
      if (uncaughtHandler) process.off("uncaughtException", uncaughtHandler);
      if (rejectionHandler) process.off("unhandledRejection", rejectionHandler);
    },
  };
}

export type { ConsoleAIConfig, ConsoleAI, ErrorAnalysis, GroqModel } from "./types.js";
