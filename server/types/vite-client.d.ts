/// <reference types="node" />
// server/types/vite-client.d.ts
// Minimal stub for ite/client to satisfy TypeScript until Vite types are available.
declare module "vite/client" {
  interface ImportMetaEnv {
    readonly NODE_ENV: string;
    readonly MODE: string;
    readonly BASE_URL: string;
    // add your VITE_ env keys here if you reference them:
    // readonly VITE_API_URL?: string;
  }
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}
