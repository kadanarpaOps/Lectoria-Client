import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const plugins: any = [react(), tailwindcss()];
  
  const needSsl = env.VITE_NEED_LOCAL_SSL === 'true';
  
  if (needSsl) {
    plugins.push(basicSsl());
  }

  const config: any = {
    plugins
  }

  if (needSsl) {
    config.server = {
      https: true
    }
  }

  return config;
});