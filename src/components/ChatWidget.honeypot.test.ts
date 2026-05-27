import { test, expect, afterEach, vi } from "vitest";
import { render, cleanup } from "@testing-library/svelte";
import ChatWidget from "./ChatWidget.svelte";

// The widget bootstraps by calling client.connect() on mount. Mock the
// oRPC client factory so the network never fires during these tests —
// what we're asserting is purely the rendered DOM shape of the
// honeypot field, not the connect handshake.
vi.mock("../lib/orpc-client", () => ({
	createWebchatClient: () => ({
		connect: vi.fn(async () => ({
			sessionId: "session-honeypot-test",
			config: {},
		})),
		sendMessage: vi.fn(async () => ({})),
		subscribe: vi.fn(async function* () {}),
		typing: vi.fn(async () => ({})),
		resolve: vi.fn(async () => ({})),
		publishReadEvent: vi.fn(async () => ({})),
	}),
}));

// The SubscriptionManager kicks off an SSE loop we don't care about
// here. Stub it to a no-op so test teardown is clean.
vi.mock("../lib/subscription", () => ({
	SubscriptionManager: class {
		constructor() {}
		connect() {}
		disconnect() {}
	},
}));

afterEach(() => cleanup());

test("ChatWidget renders a honeypot input with name=did", () => {
	const { container } = render(ChatWidget, {
		props: { providerId: "test-provider", apiUrl: "http://localhost" },
	});

	const input = container.querySelector('input[name="did"]');
	expect(input).not.toBeNull();
	expect(input?.getAttribute("type")).toBe("text");
	expect(input?.getAttribute("tabindex")).toBe("-1");
	expect(input?.getAttribute("autocomplete")).toBe("off");
});

test("honeypot input is wrapped in an aria-hidden label with the off-screen class", () => {
	// JSDOM does not actually apply Svelte's scoped <style> block, so we
	// can't assert getComputedStyle. The structural contract is enough:
	// any visually-rendered field would either be missing aria-hidden or
	// the off-screen class hook, both of which we assert here.
	const { container } = render(ChatWidget, {
		props: { providerId: "test-provider", apiUrl: "http://localhost" },
	});

	const label = container.querySelector(".mitrachat-honeypot");
	expect(label).not.toBeNull();
	expect(label?.getAttribute("aria-hidden")).toBe("true");
});

test("honeypot value defaults to empty string", () => {
	const { container } = render(ChatWidget, {
		props: { providerId: "test-provider", apiUrl: "http://localhost" },
	});

	const input = container.querySelector(
		'input[name="did"]',
	) as HTMLInputElement | null;
	expect(input).not.toBeNull();
	expect(input?.value).toBe("");
});
