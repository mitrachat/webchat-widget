import { writable, derived } from "svelte/store";
import type { Message, WidgetConfig } from "../types";

function createMessagesStore() {
  const { subscribe, set, update } = writable<Message[]>([]);

  return {
    subscribe,
    add: (message: Message) => update((messages) => [...messages, message]),
    updateStatus: (
      targetId: string,
      status: NonNullable<Message["status"]>,
    ) =>
      update((messages) =>
        messages.map((message) =>
          message.id === targetId ? { ...message, status } : message,
        ),
      ),
    markOutgoingRead: () =>
      update((messages) =>
        messages.map((message) =>
          message.sender === "user" &&
          message.id !== "typing" &&
          message.status !== "failed"
            ? { ...message, status: "read" }
            : message,
        ),
      ),
    updateTyping: (isTyping: boolean) =>
      update((messages) => {
        const filtered = messages.filter((m) => m.id !== "typing");
        if (isTyping) {
          return [
            ...filtered,
            {
              id: "typing",
              content: "",
              sender: "agent",
              timestamp: new Date().toISOString(),
            },
          ];
        }
        return filtered;
      }),
    clear: () => set([]),
  };
}

export const messages = createMessagesStore();

function createUnreadCountStore() {
  const { subscribe, set, update } = writable(0);

  return {
    subscribe,
    increment: () => update((n) => n + 1),
    reset: () => set(0),
  };
}

export const unreadCount = createUnreadCountStore();

function createConfigStore() {
  const { subscribe, set } = writable<WidgetConfig>({});

  return {
    subscribe,
    set,
    updateColor: (color: string) => {
      if (typeof document !== "undefined") {
        document.documentElement.style.setProperty("--widget-color", color);
      }
    },
  };
}

export const config = createConfigStore();

function createConnectionStore() {
  const { subscribe, set, update } = writable({
    isConnected: false,
    isConnecting: false,
    error: null as string | null,
  });

  return {
    subscribe,
    setConnecting: () =>
      set({ isConnected: false, isConnecting: true, error: null }),
    setConnected: () =>
      set({ isConnected: true, isConnecting: false, error: null }),
    setDisconnected: () =>
      set({ isConnected: false, isConnecting: false, error: null }),
    setError: (error: string) =>
      set({ isConnected: false, isConnecting: false, error }),
  };
}

export const connection = createConnectionStore();
