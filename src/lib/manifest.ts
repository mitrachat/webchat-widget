/**
 * Asset manifest for cache-busting.
 *
 * This module provides functions to generate content-hashed asset URLs
 * and a stable manifest URL for the embed snippet.
 *
 * The build process generates a manifest.json file that maps canonical
 * asset names to their content-hashed versions.
 */

// Build-time defines (set via Vite's `define` option)
declare const __ASSET_HASH__: string;
declare const __SRI_HASH__: string;

// Default base URL - overridden at build time or by the operator
const DEFAULT_BASE_URL = "https://widget.mitrachat.com";

// Current asset hash - populated at build time via Vite define
const CURRENT_HASH: string =
	typeof __ASSET_HASH__ !== "undefined" ? __ASSET_HASH__ : "dev";

// SRI hash - populated at build time
const SRI_HASH: string =
	typeof __SRI_HASH__ !== "undefined" ? __SRI_HASH__ : "";

/**
 * Get the current content hash for the widget assets.
 * This is a short hash (8 chars) derived from the build output.
 */
export function getCurrentAssetHash(): string {
	return CURRENT_HASH;
}

/**
 * Get the stable manifest URL.
 * This URL does NOT include a content hash - it always points to the
 * current manifest.json which maps to the latest hashed assets.
 */
export function getManifestUrl(baseUrl?: string): string {
	const base = (baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "");
	return `${base}/webchat/manifest.json`;
}

/**
 * Get the content-hashed asset URL for the embed script.
 * Format: {baseUrl}/webchat/embed.{hash}.iife.js
 */
export function getAssetUrl(baseUrl?: string): string {
	const base = (baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "");
	return `${base}/webchat/embed.${CURRENT_HASH}.iife.js`;
}

/**
 * Get the Subresource Integrity (SRI) hash for the current build.
 * Format: sha384-{base64hash}
 */
export function getSriHash(): string {
	return SRI_HASH;
}

/**
 * Generate the embed snippet for operators to paste into their site.
 * Uses the manifest URL for stable embedding with automatic cache-busting.
 */
export function generateEmbedSnippet(baseUrl?: string): string {
	const manifestUrl = getManifestUrl(baseUrl);
	const sri = getSriHash();

	const sriAttr = sri ? ` integrity="${sri}" crossorigin="anonymous"` : "";

	return `<!-- MitraChat Webchat Widget -->
<script src="${manifestUrl}"${sriAttr}></script>`;
}

/**
 * Build-time manifest structure.
 * Written to dist/manifest.json during the build process.
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
}
