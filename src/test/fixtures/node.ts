/**
 * Fixtures for testing Node.js env usage patterns.
 */
export const processEnvDotNotation = `
  const apiUrl = process.env.PUBLIC_API_URL;
`;

export const processEnvBracketDoubleQuotes = `
  const apiUrl = process.env["PUBLIC_API_URL"];
`;

export const processEnvBracketSingleQuotes = `
  const apiUrl = process.env['PUBLIC_API_URL'];
`;

export const multipleProcessEnvDotNotation = `
  const a = process.env.KEY_ONE;
  const b = process.env.KEY_TWO;
  const c = process.env.KEY_THREE;
`;

export const processEnvLowercaseKey = `
  const apiUrl = process.env.public_api_url;
`;

export const processEnvDestructuring = `
  const { PUBLIC_API_URL } = process.env;
`;

export const processEnvDestructuringWithAliasAndDefault = `
  const {
    SECRET_KEY: key,
    API_TOKEN = "fallback",
    PUBLIC_URL,
  } = process.env;
`;
