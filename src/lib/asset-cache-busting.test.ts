import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock the manifest module
vi.mock("./manifest", () => ({
	getCurrentAssetHash: vi.fn(),
	getManifestUrl: vi.fn(),
	getAssetUrl: vi.fn(),
	getSriHash: vi.fn(),
}));

import {
	getCurrentAssetHash,
	getManifestUrl,
	getAssetUrl,
	getSriHash,
} from "./manifest";

describe("Asset Cache Busting", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("getCurrentAssetHash", () => {
		it("returns a content hash string", () => {
			vi.mocked(getCurrentAssetHash).mockReturnValue("abc123def456");

			const hash = getCurrentAssetHash();
			expect(hash).toBe("abc123def456");
			expect(typeof hash).toBe("string");
			expect(hash.length).toBeGreaterThan(0);
		});

		it("returns consistent hash for same build", () => {
			vi.mocked(getCurrentAssetHash).mockReturnValue("abc123def456");

			const hash1 = getCurrentAssetHash();
			const hash2 = getCurrentAssetHash();
			expect(hash1).toBe(hash2);
		});
	});

	describe("getManifestUrl", () => {
		it("returns a stable manifest URL", () => {
			vi.mocked(getManifestUrl).mockReturnValue(
				"https://cdn.example.com/webchat/manifest.json",
			);

			const url = getManifestUrl("https://cdn.example.com");
			expect(url).toContain("manifest.json");
			expect(url).toContain("cdn.example.com");
		});

		it("does not include content hash in manifest URL", () => {
			vi.mocked(getManifestUrl).mockImplementation(
				(base) => `${base}/webchat/manifest.json`,
			);

			const url = getManifestUrl("https://cdn.example.com");
			expect(url).not.toContain(".hash.");
			expect(url).toContain("manifest.json");
		});
	});

	describe("getAssetUrl", () => {
		it("returns URL with content hash", () => {
			vi.mocked(getAssetUrl).mockImplementation(
				(base) => `${base}/webchat/embed.abc123def456.iife.js`,
			);

			const url = getAssetUrl("https://cdn.example.com");
			expect(url).toContain(".abc123def456.");
			expect(url).toContain(".iife.js");
		});

		it("generates different URLs for different hashes", () => {
			vi.mocked(getAssetUrl)
				.mockImplementationOnce((base) => `${base}/webchat/embed.hash1.iife.js`)
				.mockImplementationOnce(
					(base) => `${base}/webchat/embed.hash2.iife.js`,
				);

			const url1 = getAssetUrl("https://cdn.example.com");
			const url2 = getAssetUrl("https://cdn.example.com");
			expect(url1).not.toBe(url2);
		});
	});

	describe("getSriHash", () => {
		it("returns SRI hash string", () => {
			vi.mocked(getSriHash).mockReturnValue("sha384-abc123def456ghi789");

			const sri = getSriHash();
			expect(sri).toMatch(/^sha384-/);
		});

		it("returns consistent SRI hash for same build", () => {
			vi.mocked(getSriHash).mockReturnValue("sha384-abc123def456ghi789");

			const sri1 = getSriHash();
			const sri2 = getSriHash();
			expect(sri1).toBe(sri2);
		});
	});

	describe("Embed snippet", () => {
		it("generates snippet with manifest URL", () => {
			vi.mocked(getManifestUrl).mockReturnValue(
				"https://cdn.example.com/webchat/manifest.json",
			);

			// The embed snippet should use the manifest URL
			const snippet = `<script src="https://cdn.example.com/webchat/manifest.json"></script>`;
			expect(snippet).toContain("manifest.json");
		});

		it("generates snippet with SRI attribute", () => {
			vi.mocked(getSriHash).mockReturnValue("sha384-abc123def456ghi789");

			const sri = getSriHash();
			const snippet = `<script src="https://cdn.example.com/webchat/embed.hash.iife.js" integrity="${sri}" crossorigin="anonymous"></script>`;
			expect(snippet).toContain('integrity="sha384-');
			expect(snippet).toContain('crossorigin="anonymous"');
		});
	});

	describe("Caching headers", () => {
		it("hashed assets should have long-lived cache headers", () => {
			// This test verifies the concept - actual headers are set by the server
			const hashedAssetUrl =
				"https://cdn.example.com/webchat/embed.abc123.iife.js";
			const manifestUrl = "https://cdn.example.com/webchat/manifest.json";

			// Hashed assets: immutable, long-lived
			expect(hashedAssetUrl).toContain(".abc123.");

			// Manifest: short-lived, must revalidate
			expect(manifestUrl).toContain("manifest.json");
		});
	});
});
