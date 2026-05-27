import { describe, expect, it } from "vitest";

import {
	getCurrentAssetHash,
	getAssetUrl,
	getSriHash,
} from "./manifest";

describe("Asset Cache Busting (manifest.ts)", () => {
	describe("getCurrentAssetHash", () => {
		it("returns a non-empty string", () => {
			const hash = getCurrentAssetHash();
			expect(typeof hash).toBe("string");
			expect(hash.length).toBeGreaterThan(0);
		});

		it("returns a stable value across calls (deterministic per build)", () => {
			expect(getCurrentAssetHash()).toBe(getCurrentAssetHash());
		});
	});

	describe("getAssetUrl", () => {
		it("returns a URL containing the current content hash", () => {
			const url = getAssetUrl("https://cdn.example.com");
			expect(url).toContain(getCurrentAssetHash());
			expect(url).toMatch(/\.iife\.js$/);
		});

		it("places the hash between the canonical name and the format suffix", () => {
			const url = getAssetUrl("https://cdn.example.com");
			expect(url).toBe(
				`https://cdn.example.com/webchat/embed.${getCurrentAssetHash()}.iife.js`,
			);
		});

		it("strips a trailing slash on the base", () => {
			const a = getAssetUrl("https://cdn.example.com/");
			const b = getAssetUrl("https://cdn.example.com");
			expect(a).toBe(b);
		});
	});

	describe("getSriHash", () => {
		it("returns a string (empty when CI has not wired SRI yet)", () => {
			expect(typeof getSriHash()).toBe("string");
		});
	});
});
