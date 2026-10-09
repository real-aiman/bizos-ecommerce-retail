import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  esbuild: {
    jsx: "automatic"
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    css: false,
    restoreMocks: true,
    clearMocks: true,
    mockReset: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      exclude: ["src/test/**", "**/*.d.ts"]
    }
  }
});
