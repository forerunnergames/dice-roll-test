import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    // Match the @/* alias from tsconfig.json so imports resolve in tests.
    alias: [
      {
        find: /^@\//,
        replacement: `${path.resolve(__dirname, ".")}/`,
      },
    ],
  },
});
