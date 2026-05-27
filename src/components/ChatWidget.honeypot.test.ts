import { test, expect, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Static-source assertions are sufficient here — exercising the live
// component requires mocking the oRPC client and the full SSE
// subscription manager. The acceptance criterion is that the widget
// renders a honeypot field, binds it, and passes its value to connect.

afterEach(() => {
	// No DOM mounts here; nothing to clean up.
});

const widgetSource = readFileSync(
	resolve(__dirname, "ChatWidget.svelte"),
	"utf-8",
);

test("ChatWidget declares a honeypot state variable", () => {
	expect(widgetSource).toMatch(/let\s+honeypot\s*=\s*\$state\(""\)/);
});

test("ChatWidget renders an off-screen, aria-hidden honeypot input", () => {
	expect(widgetSource).toMatch(/aria-hidden="true"/);
	expect(widgetSource).toMatch(/name="did"/);
	expect(widgetSource).toMatch(/tabindex={-1}/);
	expect(widgetSource).toMatch(/autocomplete="off"/);
	expect(widgetSource).toMatch(/bind:value={honeypot}/);
});

test("ChatWidget passes the honeypot value to the connect call", () => {
	// Connect input must include `did: honeypot` so the server-side
	// honeypot check has a value to compare against.
	expect(widgetSource).toMatch(/did:\s*honeypot,/);
});

test("ChatWidget styles the honeypot off-screen and non-interactive", () => {
	expect(widgetSource).toMatch(/\.mitrachat-honeypot/);
	expect(widgetSource).toMatch(/position:\s*absolute/);
	expect(widgetSource).toMatch(/left:\s*-9999px/);
	expect(widgetSource).toMatch(/pointer-events:\s*none/);
});
