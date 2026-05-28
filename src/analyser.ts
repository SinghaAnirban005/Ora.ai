import { buildGroqClient } from "./provider.js";
import { scrub } from "./scrubber.js";
import { buildPrompt } from "./prompt.js";
import { formatAnalysis, formatError, formatSpinner } from "./formatter.js";
import type { ConsoleAIConfig, ErrorAnalysis } from "./types.js";

export async function analyseError(
  error: unknown,
  config: Required<ConsoleAIConfig>
): Promise<string> {
  const raw = serialiseError(error, config.maxStackLength);
  const cleaned = scrub(raw, config.scrubPatterns);

  if (!config.silent) {
    process.stderr.write(formatSpinner(config.label) + "\n");
  }

  let responseText: string;
  try {
    const { client, model } = buildGroqClient(config.model, config.apiKey);

    const completion = await client.chat.completions.create({
      model,
      messages: [{ role: "user", content: buildPrompt(cleaned) }],
      max_tokens: 800,
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    responseText = completion.choices[0]?.message?.content ?? "";
  } catch (aiErr) {
    if (!config.silent) process.stderr.write("\x1b[1A\x1b[2K");
    const msg = aiErr instanceof Error ? aiErr.message : String(aiErr);
    return formatError(config.label, msg);
  }

  if (!config.silent) {
    process.stderr.write("\x1b[1A\x1b[2K");
  }

  let analysis: ErrorAnalysis;
  try {
    const jsonText = responseText
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/```\s*$/, "")
      .trim();
    analysis = JSON.parse(jsonText) as ErrorAnalysis;
  } catch {
    return formatError(
      config.label,
      `Could not parse model response:\n${responseText}`
    );
  }

  return formatAnalysis(analysis, config.label);
}

function serialiseError(error: unknown, maxLength: number): string {
  if (error instanceof Error) {
    const parts: string[] = [`${error.name}: ${error.message}`];
    if (error.stack) {
      const traceLines = error.stack.split("\n").slice(1).join("\n");
      parts.push(traceLines);
    }

    const extras = Object.entries(error)
      .filter(([k]) => !["name", "message", "stack"].includes(k))
      .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
      .join(", ");
    if (extras) parts.push(`[extra: ${extras}]`);
    return parts.join("\n").slice(0, maxLength);
  }

  if (typeof error === "string") return error.slice(0, maxLength);

  try {
    return JSON.stringify(error, null, 2).slice(0, maxLength);
  } catch {
    return String(error).slice(0, maxLength);
  }
}
