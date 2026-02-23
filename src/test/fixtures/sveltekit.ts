/**
 * Fixtures for testing SvelteKit env usage patterns.
 */
export const dynamicPrivateImport = `
  import { env } from '$env/dynamic/private';
    const secret = env.SECRET_KEY;
`;

export const dynamicPublicImport = `
  import { env } from '$env/dynamic/public';
  const url = env.PUBLIC_API_URL;
`;

export const staticPrivateImport = `
  import { SECRET_KEY } from '$env/static/private';
    const secret = SECRET_KEY;
`;

export const staticPublicImport = `
  import { PUBLIC_API_URL } from '$env/static/public';
  const url = PUBLIC_API_URL;
`;

export const envWithoutImport = `
  const env = {};
  const url = env.PUBLIC_API_URL;
`;
