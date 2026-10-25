import type { NextConfig } from 'next';

const pages = process.env.GITHUB_PAGES === 'true';
const basePath = pages ? (process.env.NEXT_PUBLIC_BASE_PATH ?? '').replace(/\/+$/, '') : '';

const nextConfig: NextConfig = {
  output: pages ? 'export' : undefined,
  basePath,
  trailingSlash: pages ? true : undefined,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};
export default nextConfig;
