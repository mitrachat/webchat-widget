import { test, expect, describe, beforeEach, vi } from "vitest";
import {
  getStoredSession,
  storeSession,
  clearSession,
  getStoredContactInfo,
  storeContactInfo,
  clearContactInfo,
} from "./session";

beforeEach(() => {
  localStorage.clear();
});

describe("getStoredSession", () => {
  test("returns null when no session stored", () => {
    expect(getStoredSession("provider-1")).toBeNull();
  });

  test("returns session when stored and fresh", () => {
    storeSession("provider-1", "session-abc");
    expect(getStoredSession("provider-1")).toBe("session-abc");
  });

  test("returns null when session is older than 24 hours", () => {
    const stale = JSON.stringify({
      sessionId: "old-session",
      timestamp: Date.now() - 25 * 60 * 60 * 1000,
    });
    localStorage.setItem("mitrachat_session_provider-1", stale);

    expect(getStoredSession("provider-1")).toBeNull();
  });

  test("returns null for corrupted data", () => {
    localStorage.setItem("mitrachat_session_provider-1", "not-json{{");
    expect(getStoredSession("provider-1")).toBeNull();
  });
});

describe("storeSession / clearSession", () => {
  test("store then get returns the session", () => {
    storeSession("prov-2", "sess-123");
    expect(getStoredSession("prov-2")).toBe("sess-123");
  });

  test("clear removes the session", () => {
    storeSession("prov-2", "sess-123");
    clearSession("prov-2");
    expect(getStoredSession("prov-2")).toBeNull();
  });

  test("sessions are isolated per provider", () => {
    storeSession("prov-a", "sess-a");
    storeSession("prov-b", "sess-b");
    expect(getStoredSession("prov-a")).toBe("sess-a");
    expect(getStoredSession("prov-b")).toBe("sess-b");
  });
});

describe("contact info", () => {
  test("returns null when no contact stored", () => {
    expect(getStoredContactInfo("provider-1")).toBeNull();
  });

  test("store then get returns contact info", () => {
    const contact = { name: "John", email: "john@test.com" };
    storeContactInfo("provider-1", contact);
    expect(getStoredContactInfo("provider-1")).toEqual(contact);
  });

  test("clear removes contact info", () => {
    storeContactInfo("provider-1", { name: "John" });
    clearContactInfo("provider-1");
    expect(getStoredContactInfo("provider-1")).toBeNull();
  });
});
