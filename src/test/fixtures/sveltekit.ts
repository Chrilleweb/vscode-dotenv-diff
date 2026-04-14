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

export const staticImportWithoutUsage = `
  import { SECRET } from '$env/static/private';
`;

export const staticAliasedImport = `
  import { SECRET_KEY as SECRET } from '$env/static/private';
  const key = SECRET;
`;

export const envWithoutImport = `
  const env = {};
  const url = env.PUBLIC_API_URL;
`;

export const dynamicDestructuringSingleKey = `
  import { env } from '$env/dynamic/private';
  const { SECRET_KEY } = env;
`;

export const dynamicDestructuringAliasAndFallback = `
  import { env } from '$env/dynamic/public';
  const { PUBLIC_API_URL: apiUrl, PUBLIC_BASE_URL = "http://localhost" } = env;
`;

export const dynamicDestructuringWithoutImport = `
  const env = {};
  const { SECRET_KEY } = env;
`;

export const dynamicAliasedPrivateImport = `
  import { env as privateEnv } from '$env/dynamic/private';
  const key = privateEnv.SUPABASE_SERVICE_ROLE_KEY;
`;

export const dynamicAliasedPublicImport = `
  import { env as publicEnv } from '$env/dynamic/public';
  const url = publicEnv.PUBLIC_API_URL;
`;

export const dynamicMultipleAliasedImports = `
  import { env as publicEnv } from '$env/dynamic/public';
  import { env as privateEnv } from '$env/dynamic/private';
  const url = publicEnv.PUBLIC_SUPABASE_URL;
  const key = privateEnv.SUPABASE_SERVICE_ROLE_KEY;
`;

export const dynamicAliasedDestructuring = `
  import { env as privateEnv } from '$env/dynamic/private';
  const { SECRET_KEY } = privateEnv;
`;
