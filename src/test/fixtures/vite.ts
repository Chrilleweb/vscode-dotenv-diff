/**
 * Fixtures for testing Vite env usage patterns.
 * Vite-exposed variables are conventionally prefixed with VITE_.
 */
export const prefixedDotNotation = `
  const apiUrl = import.meta.env.VITE_API_URL;
`;

export const prefixedBracketDoubleQuotes = `
  const apiUrl = import.meta.env["VITE_API_URL"];
`;

export const prefixedBracketSingleQuotes = `
  const apiUrl = import.meta.env['VITE_API_URL'];
`;
