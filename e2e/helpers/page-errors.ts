import type { ConsoleMessage, Page } from "@playwright/test";

// Known-benign console noise (Clerk dev keys etc). Keep this list short and
// specific — real errors must fail specs.
const ALLOWED_PATTERNS: RegExp[] = [/Clerk has been loaded with development keys/i];

/** Collect console errors and uncaught page errors; assert with
 * expectNoPageErrors at the end of each spec. */
export function capturePageErrors(page: Page): string[] {
  const problems: string[] = [];
  page.on("console", (msg: ConsoleMessage) => {
    if (msg.type() === "error" && !ALLOWED_PATTERNS.some((p) => p.test(msg.text()))) {
      problems.push(`console.error: ${msg.text()}`);
    }
  });
  page.on("pageerror", (err) => problems.push(`pageerror: ${err.message}`));
  return problems;
}
