<script lang="ts">
  import ChatHeader from "./ChatHeader.svelte";
  import ChatMessages from "./ChatMessages.svelte";
  import ChatInput from "./ChatInput.svelte";
  import { config, connection } from "../stores/messages";
  import { onMount } from "svelte";

  interface Props {
    onClose: () => void;
    onSend: (payload: {
      content?: string;
      attachments?: Array<{
        type: "image" | "file";
        name: string;
        mimeType: string;
        size: number;
        dataUrl: string;
      }>;
    }) => void;
    onResolve: () => void;
    onReply: (message: import("../types").Message) => void;
    onRetry?: (message: import("../types").Message) => void;
    reply: {
      senderLabel: string;
      content?: string;
      attachmentLabel?: string;
    } | null;
    onCancelReply: () => void;
  }

  let { onClose, onSend, onResolve, onReply, onRetry, reply, onCancelReply }: Props = $props();

  let dialogEl = $state<HTMLDivElement | null>(null);

  onMount(() => {
    // bag.7 #12 — move focus into the panel when it opens.
    dialogEl?.focus();
  });

  function handleKeydown(event: KeyboardEvent) {
    // bag.7 #12 — Escape closes the dialog.
    if (event.key === "Escape") {
      onClose();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- bag.7 #11 — responsive sizing so the panel never overflows small/mobile
     viewports (clamped to the viewport minus the 1rem offset on each side). -->
<div bind:this={dialogEl}
     class="chat-window bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col"
     style="width: min(380px, calc(100vw - 2rem)); height: min(600px, calc(100dvh - 2rem));"
     role="dialog"
     aria-modal="true"
     aria-label={$config.widgetTitle || "Chat"}
     tabindex="-1">
  <ChatHeader 
    title={$config.widgetTitle || "Chat with us"}
    subtitle={$config.widgetSubtitle || "We typically reply within minutes"}
    logoUrl={$config.widgetLogoUrl}
    onClose={onClose}
    onResolve={onResolve}
  />

  <div class="flex-1 flex flex-col min-h-0">
    <ChatMessages {onReply} {onRetry} />
    
    {#if $connection.error}
      <div class="px-4 py-2 bg-red-50 text-red-600 text-sm text-center">
        {$connection.error}
      </div>
    {/if}

    <ChatInput 
      onSend={onSend}
      placeholder={$config.widgetPlaceholderText || "Type a message..."}
      disabled={!$connection.isConnected}
      {reply}
      onCancelReply={onCancelReply}
    />
  </div>
</div>
