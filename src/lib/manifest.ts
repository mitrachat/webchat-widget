/**
 * Asset manifest for cache-busting.
 *
 * Build pipeline writes `dist/manifest.json` containing the current
 * content hash and the canonical-to-hashed asset name mapping. The
 * web app (ProviderForm) reads `VITE_WIDGET_ASSET_HASH` directly and
 * appends `?v={hash}` to the embed URL — that path is what operators
 * copy. This module's consumers are limited to build tooling / tests
 * that need to know the active hash.
 */

// Build-time defines (set via Vite's `define` option)
declare const __ASSET_HASH__: string;
declare const __SRI_HASH__: string;

const CURRENT_HASH: string =
	typeof __ASSET_HASH__ !== "undefined" ? __ASSET_HASH__ : "dev";

const SRI_HASH: string =
	typeof __SRI_HASH__ !== "undefined" ? __SRI_HASH__ : "";

/** Short hash (typically git short SHA) baked into the current build. */
export function getCurrentAssetHash(): string {
	return CURRENT_HASH;
}

/** Content-hashed embed URL: `{base}/webchat/embed.{hash}.iife.js`. */
export function getAssetUrl(baseUrl: string): string {
	const base = baseUrl.replace(/\/$/, "");
	return `${base}/webchat/embed.${CURRENT_HASH}.iife.js`;
}

/** Subresource Integrity hash for the current build, or "" if absent. */
export function getSriHash(): string {
	return SRI_HASH;
}

/**
 * Build-time manifest structure. Mirrors what the
 * `webchat-asset-manifest` vite plugin writes to `dist/manifest.json`.
 */
export interface AssetManifest {
	/** Canonical asset name -> content-hashed filename */
	assets: Record<string, string>;
	/** SRI hash for the main bundle */
	sri: string;
	/** Timestamp of the build */
	buildTime: string;
	/** Version from package.json */
	version: string;
	/** Short hash baked into hashed filenames */
	hash: string;
}
