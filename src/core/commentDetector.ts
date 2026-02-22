/**
 * Returns true if the given match index is inside any kind of comment.
 * @param sourceText The full source text
 * @param matchIndex The character index to check
 */
export function isInComment(sourceText: string, matchIndex: number): boolean {
  // Check single-line comment: find start of current line
  const lineStart = sourceText.lastIndexOf("\n", matchIndex) + 1;
  const lineContent = sourceText.slice(lineStart, matchIndex).trimStart();

  if (
    lineContent.startsWith("//") || // single-line comment
    lineContent.startsWith("*") || // continuation line in block comment
    lineContent.startsWith("#") // shell-style comment
  ) {
    return true;
  }

  // Check block comment: /* ... */
  const textUpToMatch = sourceText.slice(0, matchIndex);
  const lastBlockOpen = textUpToMatch.lastIndexOf("/*");
  const lastBlockClose = textUpToMatch.lastIndexOf("*/");
  if (lastBlockOpen > lastBlockClose) {
    return true;
  }

  return false;
}
