import chalk, { type ChalkInstance } from "chalk";
import boxen from "boxen";
import type { ErrorAnalysis } from "./types.js";

const CONFIDENCE_COLOR: Record<ErrorAnalysis["confidence"], ChalkInstance> = {
  high: chalk.greenBright,
  medium: chalk.yellowBright,
  low: chalk.redBright,
};

const CONFIDENCE_ICON: Record<ErrorAnalysis["confidence"], string> = {
  high: "●",
  medium: "◐",
  low: "○",
};

function ruler(width = 52): string {
  return chalk.dim("─".repeat(width));
}

export function formatAnalysis(
  analysis: ErrorAnalysis,
  label: string
): string {
  const cc = CONFIDENCE_COLOR[analysis.confidence];
  const icon = CONFIDENCE_ICON[analysis.confidence];

  const header =
    chalk.bold.cyanBright(`  ✦ ${label}`) +
    "  " +
    cc(`${icon} ${analysis.confidence} confidence`);

  const whySection =
    chalk.bold.white("WHY IT HAPPENED\n") +
    chalk.white(wrapText(analysis.why, 56));

  const fixSection =
    chalk.bold.white("HOW TO FIX IT\n") +
    formatSteps(analysis.fix);

  const snippetSection = analysis.snippet
    ? "\n" +
      ruler() +
      "\n" +
      chalk.bold.white("SUGGESTED FIX\n") +
      chalk.bgBlack.greenBright(indentCode(analysis.snippet))
    : "";

  const body = [
    header,
    ruler(),
    whySection,
    "",
    fixSection,
    snippetSection,
  ]
    .filter((l) => l !== undefined)
    .join("\n");

  return boxen(body, {
    padding: { top: 0, bottom: 0, left: 1, right: 2 },
    margin: { top: 1, bottom: 1, left: 0, right: 0 },
    borderStyle: "round",
    borderColor: "cyan",
  });
}

export function formatError(label: string, message: string): string {
  return (
    boxen(
      chalk.bold.redBright(`  ✖ ${label} — AI Error\n`) +
        chalk.dim(ruler()) +
        "\n" +
        chalk.red(wrapText(message, 56)),
      {
        padding: { top: 0, bottom: 0, left: 1, right: 2 },
        margin: { top: 1, bottom: 1, left: 0, right: 0 },
        borderStyle: "round",
        borderColor: "red",
      }
    )
  );
}

export function formatSpinner(label: string): string {
  return chalk.dim(`  ⟳ ${label} is thinking…`);
}


function wrapText(text: string, width: number): string {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    if ((line + word).length > width) {
      if (line) lines.push(line.trimEnd());
      line = word + " ";
    } else {
      line += word + " ";
    }
  }
  if (line.trim()) lines.push(line.trimEnd());
  return lines.join("\n");
}

function formatSteps(fix: string): string {
  // If the fix already contains numbered steps, colorise them.
  const lines = fix
    .split(/\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  return lines
    .map((line, i) => {
      const stepNum = chalk.bold.cyanBright(`${i + 1}.`);
      const text = chalk.white(wrapText(line.replace(/^\d+\.\s*/, ""), 52));
      return `${stepNum} ${text}`;
    })
    .join("\n");
}

function indentCode(code: string): string {
  return code
    .split("\n")
    .map((l) => `  ${l}`)
    .join("\n");
}
