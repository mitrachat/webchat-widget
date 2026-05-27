/// <reference types="node" />
import { test, expect } from "vitest";
import { readFileSync } from "node:fs";

const configSource = readFileSync("vite.config.ts", "utf-8");

test("widget build enables source maps", () => {
	expect(configSource).toContain("sourcemap: true");
});

test("widget build generates declaration files", () => {
	expect(configSource).toContain("vite-plugin-dts");
});

test("widget IIFE output is the stable filename embed.iife.js (matches server URL)", () => {
	// The operator-facing embed URL is
	// https://mitrachat.id/webchat/embed.iife.js — the file on disk must
	// match. If we ever switch back to hashed filenames, the server-side
	// /webchat/* static route + ProviderForm.getEmbedScriptUrl need to be
	// updated in lockstep.
	expect(configSource).toMatch(/fileName: \(\) => "embed\.iife\.js"/);
});
