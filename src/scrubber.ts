/**
 * Default patterns to scrub from error messages before sending to an AI model.
 * Covers: file paths, API keys, tokens, JWTs, connection strings, IPs, emails.
 */
const DEFAULT_PATTERNS: RegExp[] = [
  // Absolute POSIX paths  /home/username/... or /Users/...
  /(?:\/(?:home|Users|root|var|etc|usr|opt|tmp)\/[^\s"'`,;)]+)/g,
  // Windows paths  C:\Users\...
  /[A-Za-z]:\\[^\s"'`,;)]+/g,
  // Bearer / Authorization tokens
  /(?:Bearer\s+)[A-Za-z0-9\-._~+/]+=*/gi,
  // JWTs  three base64url segments separated by dots
  /eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g,
  // Generic secrets: key=VALUE, token=VALUE, secret=VALUE, password=VALUE
  /(?:key|token|secret|password|passwd|pwd|auth|apikey|api_key)\s*[:=]\s*["']?[^\s"',;)]{8,}["']?/gi,
  // AWS-style access keys  AKIA...
  /(?:AKIA|AIPA|ASIA)[A-Z0-9]{16}/g,
  // IPv4 addresses
  /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g,
  // Email addresses
  /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g,
  // MongoDB / Postgres / Redis connection strings
  /(?:mongodb(?:\+srv)?|postgresql|postgres|redis|mysql):\/\/[^\s"'`,)]+/gi,
];

export function scrub(
  input: string,
  customPatterns: Array<RegExp | string> = []
): string {
  let output = input;

  const allPatterns: RegExp[] = [
    ...DEFAULT_PATTERNS,
    ...customPatterns.map((p) =>
      typeof p === "string" ? new RegExp(p, "g") : p
    ),
  ];

  for (const pattern of allPatterns) {
    output = output.replace(pattern, "[REDACTED]");
  }

  return output;
}
