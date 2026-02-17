import type { ContactInfo } from "../types";

const STORAGE_KEY = "mitrachat_session";
const CONTACT_KEY = "mitrachat_contact";

export function generateSessionId(): string {
  return crypto.randomUUID();
}

export function getStoredSession(providerId: string): string | null {
  if (typeof window === "undefined") return null;

  try {
    const data = localStorage.getItem(`${STORAGE_KEY}_${providerId}`);
    if (data) {
      const parsed = JSON.parse(data);
      // Check if session is not older than 24 hours
      if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
        return parsed.sessionId;
      }
    }
  } catch {
    // Ignore storage errors
  }
  return null;
}

export function storeSession(providerId: string, sessionId: string): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(
      `${STORAGE_KEY}_${providerId}`,
      JSON.stringify({ sessionId, timestamp: Date.now() }),
    );
  } catch {
    // Ignore storage errors
  }
}

export function clearSession(providerId: string): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(`${STORAGE_KEY}_${providerId}`);
  } catch {
    // Ignore storage errors
  }
}

export function getStoredContactInfo(providerId: string): ContactInfo | null {
  if (typeof window === "undefined") return null;

  try {
    const data = localStorage.getItem(`${CONTACT_KEY}_${providerId}`);
    if (data) {
      return JSON.parse(data);
    }
  } catch {
    // Ignore storage errors
  }
  return null;
}

export function storeContactInfo(providerId: string, contactInfo: ContactInfo): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(
      `${CONTACT_KEY}_${providerId}`,
      JSON.stringify(contactInfo),
    );
  } catch {
    // Ignore storage errors
  }
}

export function clearContactInfo(providerId: string): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(`${CONTACT_KEY}_${providerId}`);
  } catch {
    // Ignore storage errors
  }
}
