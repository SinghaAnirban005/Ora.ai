export type SupportedProvider = "anthropic" | "openai" | "ollama";

export interface ConsoleAIConfig {
  /**
   * AI provider to use.
   * @default "anthropic"
   */
  provider?: SupportedProvider;

  /**
   * Model string to use with the provider.
   * @default provider-specific default (e.g. "claude-3-5-haiku-20241022" for Anthropic)
   */
  model?: string;

  /**
   * API key for cloud providers. Falls back to env vars:
   * ANTHROPIC_API_KEY, OPENAI_API_KEY
   */
  apiKey?: string;

  /**
   * Base URL for local providers like Ollama.
   * @default "http://localhost:11434/api"
   */
  baseURL?: string;

  /**
   * Whether to intercept console.error calls.
   * @default true
   */
  interceptConsoleError?: boolean;

  /**
   * Whether to intercept uncaughtException and unhandledRejection.
   * @default true
   */
  interceptUncaught?: boolean;

  /**
   * Custom patterns to scrub from error messages before sending to the model.
   * Each entry is a regex or string that will be replaced with "[REDACTED]".
   */
  scrubPatterns?: Array<RegExp | string>;

  /**
   * Maximum characters of stack trace to send to the model.
   * @default 3000
   */
  maxStackLength?: number;

  /**
   * Whether to show the raw error before the AI analysis box.
   * @default true
   */
  showRawError?: boolean;

  /**
   * Custom header label shown in the AI box.
   * @default "ora.ai"
   */
  label?: string;

  /**
   * Silence all output. Useful for programmatic use.
   * @default false
   */
  silent?: boolean;
}

export interface ErrorAnalysis {
  why: string;
  fix: string;
  snippet?: string;
  confidence: "high" | "medium" | "low";
}

export interface ConsoleAI {
  /** Manually analyse an error (returns formatted string). */
  analyse(error: unknown): Promise<string>;
  /** Stop intercepting errors and restore original handlers. */
  restore(): void;
}
