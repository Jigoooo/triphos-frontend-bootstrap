/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
  readonly VITE_PORT: string;
  readonly VITE_API_URL: string;
  readonly VITE_API_PORT: string;
  readonly VITE_SUFFIX_API_ENDPOINT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
