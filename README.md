# Ora.ai ✦

> AI-powered error explainer. Catches your runtime errors and prints beautiful, colour-coded diagnoses right in your terminal — no tab-switching required.

```
╭────────────────────────────────────────────────────────╮
│  ✦ Ora.ai  ● high confidence                       │
│ ────────────────────────────────────────────────────── │
│ WHY IT HAPPENED                                        │
│ `user` is undefined because the async `getUser()`      │
│ call was not awaited before accessing `.email`.        │
│                                                        │
│ HOW TO FIX IT                                          │
│ 1. Add `await` before `getUser()`.                     │
│ 2. Ensure the enclosing function is `async`.           │
│ 3. Add a null-check: `if (!user) return;`              │
│ ────────────────────────────────────────────────────── │
│ SUGGESTED FIX                                          │
│   const user = await getUser(id);                      │
│   if (!user) return;                                   │
│   console.log(user.email);                             │
╰────────────────────────────────────────────────────────╯
```

---

## Install

```bash
npm install console.ai
# or
pnpm add console.ai
```

---

## Quick start

```ts
// At the very top of your dev entrypoint (e.g. src/index.ts)
import { init } from "console.ai";

init({ provider: "anthropic" }); // reads ANTHROPIC_API_KEY from env
```

That's it. Every `console.error(err)` and every uncaught exception / unhandled rejection will now display a beautiful AI diagnosis box before crashing.

---

## Configuration

```ts
import { init } from "console.ai";

init({
  // ── Provider ──────────────────────────────────────────
  provider: "anthropic",       // "anthropic" | "openai" | "ollama"
  model:    "claude-3-5-haiku-20241022", // optional, provider default used if omitted
  apiKey:   process.env.MY_KEY,          // falls back to ANTHROPIC_API_KEY / OPENAI_API_KEY

  // ── Local models ──────────────────────────────────────
  // provider: "ollama",
  // model: "llama3",
  // baseURL: "http://localhost:11434/v1",

  // ── Behaviour ─────────────────────────────────────────
  interceptConsoleError: true,  // wrap console.error  (default: true)
  interceptUncaught:     true,  // process uncaughtException + unhandledRejection (default: true)
  showRawError:          true,  // print the original error above the AI box  (default: true)
  maxStackLength:        3000,  // chars of stack trace sent to the model  (default: 3000)

  // ── Privacy ───────────────────────────────────────────
  // Extra patterns to scrub from errors before sending (paths/tokens are scrubbed by default)
  scrubPatterns: [/my-internal-hostname/gi, "supersecret"],

  // ── Style ─────────────────────────────────────────────
  label:  "console.ai",   // header label inside the box
  silent: false,          // suppress all output (useful in tests)
});
```

### Full option reference

| Option | Type | Default | Description |
|---|---|---|---|
| `provider` | `"anthropic" \| "openai" \| "ollama"` | `"anthropic"` | AI provider |
| `model` | `string` | provider default | Model string |
| `apiKey` | `string` | env var | API key |
| `baseURL` | `string` | Ollama default | Base URL for Ollama |
| `interceptConsoleError` | `boolean` | `true` | Wrap `console.error` |
| `interceptUncaught` | `boolean` | `true` | Hook `uncaughtException` / `unhandledRejection` |
| `showRawError` | `boolean` | `true` | Print original error above the box |
| `maxStackLength` | `number` | `3000` | Max stack chars sent to model |
| `scrubPatterns` | `(RegExp \| string)[]` | `[]` | Extra patterns to redact |
| `label` | `string` | `"console.ai"` | Box header label |
| `silent` | `boolean` | `false` | Suppress all output |

---

## API

### `init(config?): ConsoleAI`

Initialises the interceptors and returns a handle:

```ts
const ai = init({ provider: "openai" });

// Manually analyse any error and get the formatted string back
const output = await ai.analyse(someError);
console.log(output);

// Restore the original console.error and remove process listeners
ai.restore();
```

---

## Supported providers

| Provider | Env var | Default model |
|---|---|---|
| `anthropic` | `ANTHROPIC_API_KEY` | `claude-3-5-haiku-20241022` |
| `openai` | `OPENAI_API_KEY` | `gpt-4o-mini` |
| `ollama` | — | `llama3` |

---

## Privacy & security

Before any text is sent to an AI model, `console.ai` automatically redacts:

- Absolute file paths (`/home/user/…`, `C:\Users\…`)
- Bearer / Authorization tokens
- JWTs
- Generic `key=`, `token=`, `secret=`, `password=` pairs
- AWS access key IDs
- IPv4 addresses
- Email addresses
- Database connection strings (MongoDB, Postgres, Redis, MySQL)

You can add extra patterns via `scrubPatterns`.

---

## Only in development

`console.ai` logs a warning if `NODE_ENV=production`. We recommend guarding the call:

```ts
if (process.env.NODE_ENV !== "production") {
  const { init } = await import("console.ai");
  init({ provider: "anthropic" });
}
```

---

## License

MIT
