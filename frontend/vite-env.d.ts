/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_BACKEND_URL: string;
    readonly VITE_PORT: string;
    readonly VITE_SUPABASE_URL: string;
    readonly VITE_SUPABASE_KEY: string;
    readonly VITE_DEEPGRAM_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
