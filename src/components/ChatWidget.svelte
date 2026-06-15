<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import ChatWindow from "./ChatWindow.svelte";
  import ChatLauncher from "./ChatLauncher.svelte";
  import ContactForm from "./ContactForm.svelte";
  import { createWebchatClient } from "../lib/orpc-client";
  import { SubscriptionManager } from "../lib/subscription";
  import { getStoredSession, storeSession, clearSession, generateSessionId, getStoredContactInfo, storeContactInfo, clearContactInfo } from "../lib/session";
  import { messages, config, connection, unreadCount } from "../stores/messages";
  import type { WidgetProps, WebchatEvent, Message, ContactInfo, ReplyPreview } from "../types";

  let { providerId, apiUrl, theme = "auto", position = "bottom-right" }: WidgetProps = $props();

  let isOpen = $state(false);
  let client = $derived(createWebchatClient(apiUrl));
  let subscriptionManager = $state<SubscriptionManager | null>(null);
  let sessionId = $state("");
  let isConnected = $state(false);
  let showContactForm = $state(false);
  let contactInfo = $state<ContactInfo | undefined>(undefined);
  let replyTarget = $state<Message | null>(null);
  // Anti-bot honeypot: hidden field that humans never see/touch but
  // headless form-filling bots tend to populate. Server rejects connects
  // where this is non-empty.
  let honeypot = $state("");

  onMount(async () => {
    // Check for stored contact info
    const storedContactInfo = getStoredContactInfo(providerId);
    if (storedContactInfo) {
      contactInfo = storedContactInfo;
    }

    // Try to restore existing session
    sessionId = getStoredSession(providerId) || generateSessionId();

    // Connect to webchat
    await connectToWebchat();
  });

  onDestroy(() => {
    subscriptionManager?.disconnect();
  });

  async function connectToWebchat(contactInfoToUse?: ContactInfo) {
    try {
      const result = await client.connect({
        providerId,
        sessionId,
        origin: window.location.origin,
        contactInfo: contactInfoToUse,
        did: honeypot,
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

        // Check if contact form is required and we don't have contact info
        if (result.config.widgetRequireContactInfo && !contactInfo && !contactInfoToUse) {
          showContactForm = true;
          isConnected = false;
          return;
        }
      }

      isConnected = true;
      showContactForm = false;

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
  }

  // bag.7 #4 — re-attempt the connect handshake from the error state's Retry
  // button. Clears the error first so the panel shows a connecting state.
  async function retryConnect() {
    connection.setConnecting();
    await connectToWebchat(contactInfo);
  }

  function handleEvent(event: WebchatEvent) {
    switch (event.type) {
      case "message":
        if (event.payload.content || event.payload.attachments?.length) {
          const message: Message = {
            id: event.payload.id || Date.now().toString(),
            content: event.payload.content || "",
            sender: event.payload.sender || "agent",
            timestamp: event.payload.timestamp,
            attachments: event.payload.attachments,
            reply: event.payload.reply,
            format: event.payload.format,
          };
          messages.add(message);
          if (isOpen && message.sender !== "user") {
            messages.markOutgoingRead();
          }
          if (!isOpen) {
            unreadCount.increment();
          }
        }
        break;
      case "message.updated":
        if (event.payload.clientMessageId && event.payload.status) {
          messages.updateStatus(event.payload.clientMessageId, event.payload.status);
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
      case "config.updated":
        // Provider config changed in the dashboard. Re-fetch via connect
        // with the current sessionId so we apply the new values without
        // forcing the visitor to reload the host page.
        // Fire-and-forget; if it fails the widget keeps the prior config.
        void refreshConfig();
        break;
    }
  }

  async function refreshConfig() {
    try {
      const result = await client.connect({
        providerId,
        sessionId,
        origin: window.location.origin,
        did: honeypot,
      });
      if (result.config) {
        config.set(result.config);
        if (result.config.widgetColor) {
          config.updateColor(result.config.widgetColor);
        }
      }
    } catch (error) {
      console.warn("[WebChat] Failed to refresh config:", error);
    }
  }

  async function handleContactFormSubmit(submittedContactInfo: ContactInfo) {
    contactInfo = submittedContactInfo;
    storeContactInfo(providerId, submittedContactInfo);
    
    // Reconnect with contact info
    await connectToWebchat(submittedContactInfo);
  }

  function buildReplyPreview(message: Message): ReplyPreview {
    return {
      sender: message.sender,
      senderLabel:
        message.sender === "user"
          ? "You"
          : message.sender === "agent"
            ? "Agent"
            : "System",
      content: message.content || undefined,
      attachmentLabel:
        !message.content && message.attachments?.length
          ? message.attachments[0]?.name
          : undefined,
    };
  }

  async function handleSend(payload: {
    content?: string;
    attachments?: Array<{
      type: "image" | "file";
      name: string;
      mimeType: string;
      size: number;
      dataUrl: string;
    }>;
  }) {
    if (!sessionId) return;

    // Add user message immediately
    const userMessage: Message = {
      id: crypto.randomUUID(),
      content: payload.content || "",
      sender: "user",
      timestamp: new Date().toISOString(),
      attachments: payload.attachments?.map((attachment, index) => ({
        id: `local-${index}-${Date.now()}`,
        type: attachment.type,
        url: attachment.dataUrl,
        name: attachment.name,
        size: attachment.size,
      })),
      reply: replyTarget ? buildReplyPreview(replyTarget) : undefined,
      status: "pending",
    };
    messages.add(userMessage);

    // Send to server
    try {
      await client.sendMessage({
        sessionId,
        providerId,
        content: payload.content,
        clientMessageId: userMessage.id,
        replyToMessageId: replyTarget?.id,
        replyPreview: replyTarget ? buildReplyPreview(replyTarget) : undefined,
        attachments: payload.attachments,
      });
    } catch (error) {
      console.error("[WebChat] Failed to send message:", error);
      messages.updateStatus(userMessage.id, "failed");
    }

    replyTarget = null;
  }

  // bag.7 #5 — resend a failed message with the SAME clientMessageId; the
  // server enqueue is idempotent on webchat:<sessionId>:<clientMessageId>.
  async function handleRetry(message: Message) {
    if (!sessionId) return;
    messages.updateStatus(message.id, "pending");
    try {
      await client.sendMessage({
        sessionId,
        providerId,
        content: message.content || undefined,
        clientMessageId: message.id,
        replyPreview: message.reply,
        attachments: message.attachments?.map((attachment) => ({
          type: attachment.type,
          name: attachment.name,
          mimeType: "application/octet-stream",
          size: attachment.size ?? 0,
          dataUrl: attachment.url,
        })),
      });
    } catch (error) {
      console.error("[WebChat] Failed to resend message:", error);
      messages.updateStatus(message.id, "failed");
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
    // bag.7 #19 — tie stored contact info to the session lifetime so a new
    // visitor on a shared device isn't silently identified as the previous one.
    clearContactInfo(providerId);
    contactInfo = undefined;
    sessionId = "";
    isOpen = false;
    isConnected = false;
    replyTarget = null;
    connection.setDisconnected();
  }

  function handleToggle() {
    isOpen = !isOpen;
    if (isOpen) {
      unreadCount.reset();
      // bag.7 #13 — if we're open but have no live connection (the gated
      // contact form was dismissed, or the initial connect failed), re-run the
      // connect/restore flow so the visitor can resume instead of being stuck.
      if (!isConnected && !subscriptionManager) {
        void connectToWebchat(contactInfo);
      }
    }
  }
</script>

<div class="mitrachat-widget" data-position={position}>
  <!--
    Anti-bot honeypot: invisible to humans (off-screen, aria-hidden,
    tab-index=-1, no autocomplete). Headless form-filling bots that
    blindly populate inputs will set this; server rejects non-empty.
  -->
  <label class="mitrachat-honeypot" aria-hidden="true">
    <input
      type="text"
      name="did"
      tabindex={-1}
      autocomplete="off"
      aria-hidden="true"
      bind:value={honeypot}
    />
  </label>
  {#if isOpen}
    {#if showContactForm}
      <ContactForm 
        config={$config} 
        onSubmit={handleContactFormSubmit}
        onClose={() => (isOpen = false)}
      />
    {:else if isConnected}
      <ChatWindow
        onClose={() => (isOpen = false)}
        onSend={handleSend}
        onResolve={handleResolve}
        onReply={(message) => (replyTarget = message)}
        onRetry={handleRetry}
        reply={replyTarget ? {
          senderLabel: buildReplyPreview(replyTarget).senderLabel,
          content: buildReplyPreview(replyTarget).content,
          attachmentLabel: buildReplyPreview(replyTarget).attachmentLabel,
        } : null}
        onCancelReply={() => (replyTarget = null)}
      />
    {:else if $connection.error}
      <!-- bag.7 #4 — explicit error + retry instead of a blank dead-end panel. -->
      <div class="mitrachat-connect-error" role="alert">
        <p>Gagal terhubung ke layanan chat.</p>
        <button
          type="button"
          class="mitrachat-retry-btn"
          onclick={retryConnect}
        >
          Coba lagi
        </button>
      </div>
    {/if}
  {:else}
    <ChatLauncher onClick={handleToggle} unreadCount={$unreadCount} />
  {/if}
</div>

<style>
  .mitrachat-widget {
    position: fixed;
    z-index: 9999;
  }

  .mitrachat-widget[data-position="bottom-right"] {
    bottom: 1rem;
    right: 1rem;
  }

  .mitrachat-widget[data-position="bottom-left"] {
    bottom: 1rem;
    left: 1rem;
  }

  .mitrachat-connect-error {
    width: min(320px, calc(100vw - 2rem));
    padding: 1rem;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 0.75rem;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    font-size: 0.875rem;
    color: #374151;
    text-align: center;
  }

  .mitrachat-retry-btn {
    margin-top: 0.5rem;
    padding: 0.375rem 0.75rem;
    border: none;
    border-radius: 0.5rem;
    background: var(--widget-color, #6366f1);
    color: #fff;
    font-size: 0.8125rem;
    cursor: pointer;
  }

  .mitrachat-honeypot {
    position: absolute;
    left: -9999px;
    top: -9999px;
    width: 1px;
    height: 1px;
    overflow: hidden;
    opacity: 0;
    pointer-events: none;
  }
</style>
