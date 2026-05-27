import { describe, expect, it } from "vitest";

import {
	getCurrentAssetHash,
	getManifestUrl,
	getAssetUrl,
	getSriHash,
	generateEmbedSnippet,
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

	describe("getManifestUrl", () => {
		it("appends /webchat/manifest.json to the given base", () => {
			const url = getManifestUrl("https://cdn.example.com");
			expect(url).toBe("https://cdn.example.com/webchat/manifest.json");
		});

		it("strips a trailing slash on the base", () => {
			const url = getManifestUrl("https://cdn.example.com/");
			expect(url).toBe("https://cdn.example.com/webchat/manifest.json");
		});

		it("does not embed the content hash in the manifest URL itself", () => {
			const url = getManifestUrl("https://cdn.example.com");
			expect(url).not.toContain(getCurrentAssetHash());
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
	});

	describe("getSriHash", () => {
		it("returns a string (empty when SRI not yet wired by CI)", () => {
			expect(typeof getSriHash()).toBe("string");
		});
	});

	describe("generateEmbedSnippet", () => {
		it("references the stable manifest URL, NOT a hashed URL", () => {
			// The embed snippet is what operators paste into their site —
			// it must be stable across deploys. The manifest is the
			// indirection that maps to current hashed assets.
			const snippet = generateEmbedSnippet("https://cdn.example.com");
			expect(snippet).toContain("manifest.json");
		});

		it("omits SRI attribute when getSriHash is empty", () => {
			const snippet = generateEmbedSnippet("https://cdn.example.com");
			if (getSriHash() === "") {
				expect(snippet).not.toContain("integrity=");
			}
		});
	});
});
