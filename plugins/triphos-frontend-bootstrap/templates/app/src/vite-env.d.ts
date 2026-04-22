/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
  readonly VITE_PORT: string;
  readonly VITE_API_ORIGIN: string;
  readonly VITE_API_PREFIX: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
