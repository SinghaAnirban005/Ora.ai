import type { SupportedProvider } from "./types.js";

export interface ProviderModel {
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  languageModel: any;
}

const DEFAULTS: Record<SupportedProvider, string> = {
  anthropic: "claude-3-5-haiku-20241022",
  openai: "gpt-4o-mini",
  ollama: "llama3",
};

export async function buildModel(
  provider: SupportedProvider,
  model?: string,
  apiKey?: string,
  baseURL?: string
): Promise<ProviderModel> {
  const modelId = (model || undefined) ?? DEFAULTS[provider];

  if (provider === "anthropic") {
    const { createAnthropic } = await import("@ai-sdk/anthropic");
    const key = (apiKey || undefined) ?? process.env["ANTHROPIC_API_KEY"];
    if (!key) throw new Error("[console.ai] ANTHROPIC_API_KEY is not set.");
    const anthropic = createAnthropic({ apiKey: key });
    return { id: modelId, languageModel: anthropic(modelId) };
  }

  if (provider === "openai") {
    const { createOpenAI } = await import("@ai-sdk/openai");
    const key = (apiKey || undefined) ?? process.env["OPENAI_API_KEY"];
    if (!key) throw new Error("[console.ai] OPENAI_API_KEY is not set.");
    const openai = createOpenAI({ apiKey: key });
    return { id: modelId, languageModel: openai(modelId) };
  }

  if (provider === "ollama") {
    const { createOpenAI } = await import("@ai-sdk/openai");
    const ollama = createOpenAI({
      baseURL: (baseURL || undefined) ?? "http://localhost:11434/v1",
      apiKey: "ollama", // required but ignored by Ollama
    });
    return { id: modelId, languageModel: ollama(modelId) };
  }

  throw new Error(`[console.ai] Unknown provider: ${provider as string}`);
}