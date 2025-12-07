import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import VueRouter from "unplugin-vue-router/vite";
import UnoCSS from "unocss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    UnoCSS(),
    VueRouter({
      extensions: [".page.vue"],
      routesFolder: ["src/page", "src/text"]
    })
  ],
  resolve: {
    alias: {
      "@": "/src"
    }
  }
});
