/// <reference types="vite/client" />
//declare module "*.css";
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  // adicione outras variáveis aqui se precisar
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}