import { test, expect } from "vitest";
import { readFileSync } from "node:fs";

const configSource = readFileSync("vite.config.ts", "utf-8");

test("widget build enables source maps", () => {
	expect(configSource).toContain("sourcemap: true");
});

test("widget build generates declaration files", () => {
	expect(configSource).toContain("vite-plugin-dts");
});

test("widget build resolves a content hash for cache-busting", () => {
	expect(configSource).toContain("resolveAssetHash");
	expect(configSource).toContain("WEBCHAT_ASSET_HASH");
});

test("widget build injects __ASSET_HASH__ via Vite define", () => {
	expect(configSource).toContain("__ASSET_HASH__");
});

test("widget IIFE filename includes the asset hash", () => {
	expect(configSource).toMatch(/embed\.\$\{ASSET_HASH\}\.iife\.js/);
});

test("widget build emits a manifest.json under dist/", () => {
	expect(configSource).toContain("webchat-asset-manifest");
	expect(configSource).toContain("dist/manifest.json");
});
