import { defineConfig } from "vitest/config";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  plugins: [svelte()],
  test: {
    environment: "jsdom",
    include: ["src/**/*.{test,spec}.{ts,tsx,svelte}"],
    exclude: ["**/node_modules/**", "**/dist/**"],
    setupFiles: ["./src/test-setup.ts"],
    clearMocks: true,
    resolve: {
      conditions: ["browser"],
    },
  },
  resolve: {
    conditions: ["browser"],
  },
});
