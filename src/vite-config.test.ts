import { test, expect } from "vitest";
import { readFileSync } from "node:fs";

const configSource = readFileSync("vite.config.ts", "utf-8");

test("widget build enables source maps", () => {
  expect(configSource).toContain("sourcemap: true");
});

test("widget build generates declaration files", () => {
  expect(configSource).toContain("declaration");
});
