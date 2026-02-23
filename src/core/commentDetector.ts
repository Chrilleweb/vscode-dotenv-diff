/**
 * Returns true if the given match index is inside a comment or string-like region.
 * This avoids false positives from commented-out code and fixture/template content.
 * @param sourceText The full source text
 * @param matchIndex The character index to check
 */
export function isInComment(sourceText: string, matchIndex: number): boolean {
  let inLineComment = false;
  let inBlockComment = false;
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inTemplateString = false;
  let escaped = false;

  for (let i = 0; i < matchIndex; i++) {
    const ch = sourceText[i];
    const next = sourceText[i + 1];

    if (inLineComment) {
      if (ch === "\n") {
        inLineComment = false;
      }
      continue;
    }

    if (inBlockComment) {
      if (ch === "*" && next === "/") {
        inBlockComment = false;
        i++;
      }
      continue;
    }

    if (inSingleQuote) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === "\\") {
        escaped = true;
        continue;
      }
      if (ch === "'") {
        inSingleQuote = false;
      }
      continue;
    }

    if (inDoubleQuote) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === "\\") {
        escaped = true;
        continue;
      }
      if (ch === '"') {
        inDoubleQuote = false;
      }
      continue;
    }

    if (inTemplateString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === "\\") {
        escaped = true;
        continue;
      }
      if (ch === "`") {
        inTemplateString = false;
      }
      continue;
    }

    if (ch === "/" && next === "/") {
      inLineComment = true;
      i++;
      continue;
    }

    if (ch === "/" && next === "*") {
      inBlockComment = true;
      i++;
      continue;
    }

    if (ch === "'") {
      inSingleQuote = true;
      continue;
    }

    if (ch === '"') {
      inDoubleQuote = true;
      continue;
    }

    if (ch === "`") {
      inTemplateString = true;
    }
  }

  return (
    inLineComment ||
    inBlockComment ||
    inSingleQuote ||
    inDoubleQuote ||
    inTemplateString
  );
}
