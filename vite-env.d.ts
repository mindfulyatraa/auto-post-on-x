/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_TWITTER_API_KEY: string
    readonly VITE_TWITTER_API_SECRET: string
    readonly VITE_TWITTER_ACCESS_TOKEN: string
    readonly VITE_TWITTER_ACCESS_SECRET: string
    readonly VITE_GEMINI_API_KEY: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
