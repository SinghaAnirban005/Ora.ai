import Groq from "groq-sdk";

export interface GroqClient {
  client: Groq;
  model: string;
}

const DEFAULT_MODEL = "llama-3.3-70b-versatile";

export function buildGroqClient(
  model?: string,
  apiKey?: string
): GroqClient {
  const key = (apiKey || undefined) ?? process.env["GROQ_API_KEY"];

  if (!key) {
    throw new Error(
      "[Ora.ai] No Groq API key found.\n" +
        "  → Set GROQ_API_KEY in your environment, or pass apiKey to init().\n" +
        "  → Get a free key at https://console.groq.com"
    );
  }

  const client = new Groq({ apiKey: key });
  return { client, model: (model || undefined) ?? DEFAULT_MODEL };
}
