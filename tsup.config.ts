import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["cli/src/index.ts"],
  outDir: "dist",
  clean: true,
  splitting: false,
  sourcemap: true,
  format: ["esm"],
  target: "node18",
  dts: false,
  banner: {
    js: "#!/usr/bin/env node"
  }
});
