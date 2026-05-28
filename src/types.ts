/**
 * Groq model IDs available on the free tier.
 * @see https://console.groq.com/docs/models
 */
export type GroqModel =
  | "llama-3.3-70b-versatile"
  | "llama-3.1-8b-instant"
  | "llama3-70b-8192"
  | "llama3-8b-8192"
  | "mixtral-8x7b-32768"
  | "gemma2-9b-it"
  | (string & {});

export interface ConsoleAIConfig {
  /**
   * Groq model to use.
   * @default "llama-3.3-70b-versatile"
   * @see https://console.groq.com/docs/models
   */
  model?: GroqModel;

  /**
   * Groq API key. Falls back to the GROQ_API_KEY environment variable.
   * Get one free at https://console.groq.com
   */
  apiKey?: string;

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
   * Custom patterns to scrub from error messages before sending to Groq.
   * Each entry is a regex or string replaced with "[REDACTED]".
   */
  scrubPatterns?: Array<RegExp | string>;

  /**
   * Maximum characters of stack trace to send to the model.
   * @default 3000
   */
  maxStackLength?: number;

  /**
   * Whether to print the original error above the AI analysis box.
   * @default true
   */
  showRawError?: boolean;

  /**
   * Custom header label shown in the AI box.
   * @default "Ora.ai"
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
  analyse(error: unknown): Promise<string>;
  restore(): void;
}
