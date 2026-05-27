import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import dts from "vite-plugin-dts";
import { resolve } from "path";
import { execSync } from "node:child_process";
import { writeFileSync, readFileSync } from "node:fs";

// Detect which build target via env: "embed" builds the IIFE embed script,
// default builds the library (ES + UMD).
const isEmbedBuild = process.env.BUILD_TARGET === "embed";

// webchat-p2-asset-cache-busting — content-hashed asset URLs so embedded
// widgets pick up new bytes without manual cache busting. Source of
// truth precedence:
//   1. WEBCHAT_ASSET_HASH env var (CI sets this from a known SHA)
//   2. current git short SHA
//   3. "dev" (local dev fallback — no caching guarantees)
function resolveAssetHash(): string {
	if (process.env.WEBCHAT_ASSET_HASH) {
		return process.env.WEBCHAT_ASSET_HASH;
	}
	try {
		return execSync("git rev-parse --short=8 HEAD").toString().trim();
	} catch {
		return "dev";
	}
}

const ASSET_HASH = resolveAssetHash();
const PKG = JSON.parse(
	readFileSync(resolve(__dirname, "package.json"), "utf-8"),
) as { version: string };

export default defineConfig({
	plugins: [
		svelte(),
		dts({
			insertTypesEntry: true,
			include: ["src/**/*"],
			exclude: ["src/**/*.test.ts", "src/**/*.spec.ts"],
		}),
		// webchat-p2 — emit dist/manifest.json on every build so the
		// operator-facing embed snippet can resolve the current hashed
		// filename without a hardcoded mapping.
		{
			name: "webchat-asset-manifest",
			apply: "build",
			closeBundle() {
				const manifest = {
					assets: {
						"embed.iife.js": `embed.${ASSET_HASH}.iife.js`,
						"index.es.js": `index.es.js`,
						"index.umd.js": `index.umd.js`,
					},
					sri: "",
					buildTime: new Date().toISOString(),
					version: PKG.version,
					hash: ASSET_HASH,
				};
				writeFileSync(
					resolve(__dirname, "dist/manifest.json"),
					JSON.stringify(manifest, null, 2),
				);
			},
		},
	],
	define: {
		__ASSET_HASH__: JSON.stringify(ASSET_HASH),
		__SRI_HASH__: JSON.stringify(""),
	},
	build: {
		sourcemap: true,
		lib: isEmbedBuild
			? {
					entry: resolve(__dirname, "src/embed.ts"),
					name: "MitraChatWidget",
					formats: ["iife"],
					// Filename contains the content hash so the embedded URL is
					// immutable and safe to cache long-lived. Operators (or our
					// `generateEmbedSnippet`) read the hash from the dist
					// manifest.json + VITE_WIDGET_ASSET_HASH env var on the web
					// app.
					fileName: () => `embed.${ASSET_HASH}.iife.js`,
				}
			: {
					entry: resolve(__dirname, "src/index.ts"),
					name: "MitraChatWidget",
					formats: ["es", "umd"],
					fileName: (format) => `index.${format}.js`,
				},
		rollupOptions: {
			external: [],
			output: {
				globals: {},
			},
		},
		cssCodeSplit: false,
		// Embed build writes to same dist dir without cleaning it
		emptyOutDir: !isEmbedBuild,
	},
	server: {
		port: 5174,
		open: "/demo.html",
	},
	preview: {
		port: 4174,
	},
});
