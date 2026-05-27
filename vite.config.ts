import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import dts from "vite-plugin-dts";
import { resolve } from "path";

// Detect which build target via env: "embed" builds the IIFE embed script,
// default builds the library (ES + UMD).
const isEmbedBuild = process.env.BUILD_TARGET === "embed";

export default defineConfig({
	plugins: [
		svelte(),
		dts({
			insertTypesEntry: true,
			include: ["src/**/*"],
			exclude: ["src/**/*.test.ts", "src/**/*.spec.ts"],
		}),
	],
	build: {
		sourcemap: true,
		lib: isEmbedBuild
			? {
					entry: resolve(__dirname, "src/embed.ts"),
					name: "MitraChatWidget",
					formats: ["iife"],
					// Stable filename — operator-facing URL is
					// https://mitrachat.id/webchat/embed.iife.js. Cache-busting
					// handled server-side via ETag + Cache-Control:
					// no-cache, must-revalidate.
					fileName: () => "embed.iife.js",
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
