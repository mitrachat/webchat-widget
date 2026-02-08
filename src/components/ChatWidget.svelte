<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import ChatWindow from "./ChatWindow.svelte";
  import ChatLauncher from "./ChatLauncher.svelte";
  import { createWebchatClient } from "../lib/orpc-client";
  import { SubscriptionManager } from "../lib/subscription";
  import { getStoredSession, storeSession, clearSession, generateSessionId } from "../lib/session";
  import { messages, config, connection, unreadCount } from "../stores/messages";
  import type { WidgetProps, WebchatEvent, Message } from "../types";

  let { providerId, apiUrl, theme = "auto", position = "bottom-right" }: WidgetProps = $props();

  let isOpen = $state(false);
  let client = $state(createWebchatClient(apiUrl));
  let subscriptionManager = $state<SubscriptionManager | null>(null);
  let sessionId = $state("");

  onMount(async () => {
    // Try to restore existing session
    sessionId = getStoredSession(providerId) || generateSessionId();

    // Connect to webchat
    try {
      const result = await client.connect({
        providerId,
        sessionId,
        origin: window.location.origin,
      });

      // Persist session only after successful connect
      sessionId = result.sessionId;
      storeSession(providerId, sessionId);

      // Apply config
      if (result.config) {
        config.set(result.config);
        if (result.config.widgetColor) {
          config.updateColor(result.config.widgetColor);
        }
      }

      // Start oRPC subscription (SSE via eventIterator)
      subscriptionManager = new SubscriptionManager(
        client,
        sessionId,
        providerId,
        handleEvent,
      );
      subscriptionManager.connect();
    } catch (error) {
      console.error("[WebChat] Failed to connect:", error);
      connection.setError("Failed to connect");
    }
  });

  onDestroy(() => {
    subscriptionManager?.disconnect();
  });

  function handleEvent(event: WebchatEvent) {
    switch (event.type) {
      case "message":
        if (event.payload.content) {
          const message: Message = {
            id: event.payload.id || Date.now().toString(),
            content: event.payload.content,
            sender: event.payload.sender || "agent",
            timestamp: event.payload.timestamp,
          };
          messages.add(message);
          if (!isOpen) {
            unreadCount.increment();
          }
        }
        break;
      case "typing":
        messages.updateTyping(event.payload.isTyping || false);
        break;
      case "error":
        console.error("[WebChat] Server error:", event.payload.content);
        break;
      case "system":
        if (event.payload.content === "Conversation resolved") {
          // Session was resolved (possibly from dashboard)
          resetSession();
        }
        // Ignore heartbeat events — they are only for keeping the SSE connection alive
        break;
    }
  }

  async function handleSend(content: string) {
    if (!sessionId) return;

    // Add user message immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: "user",
      timestamp: new Date().toISOString(),
    };
    messages.add(userMessage);

    // Send to server
    try {
      await client.sendMessage({
        sessionId,
        providerId,
        content,
      });
    } catch (error) {
      console.error("[WebChat] Failed to send message:", error);
    }
  }

  async function handleResolve() {
    if (!sessionId) return;

    try {
      await client.resolve({ sessionId, providerId });
      resetSession();
    } catch (error) {
      console.error("[WebChat] Failed to resolve conversation:", error);
    }
  }

  function resetSession() {
    subscriptionManager?.disconnect();
    subscriptionManager = null;
    messages.clear();
    unreadCount.reset();
    clearSession(providerId);
    sessionId = "";
    isOpen = false;
    connection.setDisconnected();
  }

  async function handleTyping(isTyping: boolean) {
    if (!sessionId) return;

    try {
      await client.typing({
        sessionId,
        providerId,
        isTyping,
      });
    } catch (error) {
      // Silently fail - typing status is not critical
      console.debug("[WebChat] Failed to send typing status:", error);
    }
  }

  function handleToggle() {
    isOpen = !isOpen;
    if (isOpen) {
      unreadCount.reset();
    }
  }
</script>

<div class="mitrachat-widget" data-position={position}>
  {#if isOpen}
    <ChatWindow
      onClose={() => (isOpen = false)}
      onSend={handleSend}
      onResolve={handleResolve}
      onTyping={handleTyping}
    />
  {:else}
    <ChatLauncher onClick={handleToggle} unreadCount={$unreadCount} />
  {/if}
</div>

