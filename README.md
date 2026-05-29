# Ora.ai

> AI powered error explainer intercepts `console.error` and uncaught exceptions and prints beautiful, colour coded diagnoses right in your terminal. **No tab-switching. No copy-pasting. No paid API credits.**

Powered by **[Groq](https://console.groq.com)** — the fastest LLM inference API available, with a generous **free tier**.

```
╭────────────────────────────────────────────────────────╮
│  ✦ Ora.ai  ● high confidence                           │
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
npm install @singhaanirban/ora.ai
# or
pnpm add @singhaanirban/ora.ai
```

---

## Setup

1. **Get a free Groq API key** at [console.groq.com](https://console.groq.com) — takes 30 seconds.
2. Add it to your environment:

```bash
GROQ_API_KEY=gsk_...
```

3. Drop one line at the top of your dev entrypoint:

```ts
import { init } from "@singhaanirban/ora.ai";
init();
```

That's it. Every `console.error(err)` and every uncaught exception / unhandled rejection now shows a beautiful AI diagnosis box.

---

## Configuration

```ts
import { init } from "@singhaanirban/ora.ai";

init({
  // ── Model ─────────────────────────────────────────────
  // All free on Groq. See https://console.groq.com/docs/models
  model: "llama-3.3-70b-versatile",   // default — best quality
  // model: "llama-3.1-8b-instant",   // fastest, great for simple errors
  // model: "mixtral-8x7b-32768",      // large context window

  apiKey: process.env.GROQ_API_KEY,   // or set GROQ_API_KEY in env

  // ── Behaviour ─────────────────────────────────────────
  interceptConsoleError: true,   // wrap console.error        (default: true)
  interceptUncaught:     true,   // uncaughtException + unhandledRejection  (default: true)
  showRawError:          true,   // print original error above the AI box   (default: true)
  maxStackLength:        3000,   // chars of stack sent to the model        (default: 3000)

  // ── Privacy ───────────────────────────────────────────
  // Paths, tokens, JWTs, emails, IPs are redacted by default.
  // Add extra patterns here:
  scrubPatterns: [/my-internal-hostname/gi, "supersecret"],

  // ── Style ─────────────────────────────────────────────
  label:  "Ora.ai",   // header label inside the box
  silent: false,          // suppress all output (useful in tests)
});
```

### Option reference

| Option | Type | Default | Description |
|---|---|---|---|
| `model` | `GroqModel \| string` | `"llama-3.3-70b-versatile"` | Groq model ID |
| `apiKey` | `string` | `GROQ_API_KEY` env var | Your Groq API key |
| `interceptConsoleError` | `boolean` | `true` | Wrap `console.error` |
| `interceptUncaught` | `boolean` | `true` | Hook `uncaughtException` / `unhandledRejection` |
| `showRawError` | `boolean` | `true` | Print original error above the box |
| `maxStackLength` | `number` | `3000` | Max stack chars sent to model |
| `scrubPatterns` | `(RegExp \| string)[]` | `[]` | Extra patterns to redact |
| `label` | `string` | `"Ora.ai"` | Box header label |
| `silent` | `boolean` | `false` | Suppress all output |

---

## Recommended Groq models

| Model | Speed | Best for |
|---|---|---|
| `llama-3.3-70b-versatile` *(default)* | Fast | Complex errors, best explanations |
| `llama-3.1-8b-instant` | Blazing fast | Simple errors, high-volume dev servers |
| `mixtral-8x7b-32768` | Fast | Errors with long stack traces (32k context) |
| `gemma2-9b-it` | Fast | Alternative quality option |

All models are **free** on Groq's developer tier.

---

## API

### `init(config?): ConsoleAI`

```ts
const ai = init({ model: "llama-3.1-8b-instant" });

// Manually analyse any error — returns the formatted box string
const output = await ai.analyse(someError);
process.stderr.write(output);

// Restore original console.error and remove process listeners
ai.restore();
```

---

## Privacy & security

Before anything is sent to Groq, `Ora.ai` automatically redacts:

| Pattern | Example |
|---|---|
| Absolute file paths | `/home/user/project/…` → `[REDACTED]` |
| Windows paths | `C:\Users\…` → `[REDACTED]` |
| Bearer / auth tokens | `Bearer eyJ…` → `[REDACTED]` |
| JWTs | `eyJ…` → `[REDACTED]` |
| `key=`, `token=`, `secret=`, `password=` pairs | `apiKey=sk-…` → `[REDACTED]` |
| AWS access key IDs | `AKIAIOSFODNN7…` → `[REDACTED]` |
| IPv4 addresses | `192.168.1.1` → `[REDACTED]` |
| Email addresses | `user@domain.com` → `[REDACTED]` |
| DB connection strings | `postgres://user:pass@…` → `[REDACTED]` |

Extend with `scrubPatterns` in config.

---

## Only in development

`Ora.ai` logs a warning if `NODE_ENV=production`. Guard it explicitly:

```ts
if (process.env.NODE_ENV !== "production") {
  const { init } = await import("@singhaanirban/ora.ai");
  init();
}
```

---

## License

MIT
