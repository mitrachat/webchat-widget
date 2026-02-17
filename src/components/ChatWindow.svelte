<script lang="ts">
  import ChatHeader from "./ChatHeader.svelte";
  import ChatMessages from "./ChatMessages.svelte";
  import ChatInput from "./ChatInput.svelte";
  import { config, connection } from "../stores/messages";

  interface Props {
    onClose: () => void;
    onSend: (content: string) => void;
    onResolve: () => void;
  }

  let { onClose, onSend, onResolve }: Props = $props();
</script>

<div class="chat-window bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col"
     style="width: 380px; height: 600px;">
  <ChatHeader 
    title={$config.widgetTitle || "Chat with us"}
    subtitle={$config.widgetSubtitle || "We typically reply within minutes"}
    logoUrl={$config.widgetLogoUrl}
    onClose={onClose}
    onResolve={onResolve}
  />

  <div class="flex-1 flex flex-col min-h-0">
    <ChatMessages />
    
    {#if $connection.error}
      <div class="px-4 py-2 bg-red-50 text-red-600 text-sm text-center">
        {$connection.error}
      </div>
    {/if}

    <ChatInput 
      onSend={onSend}
      placeholder={$config.widgetPlaceholderText || "Type a message..."}
      disabled={!$connection.isConnected}
    />
  </div>
</div>
