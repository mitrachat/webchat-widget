<script lang="ts">
  import ChatBubble from "./ChatBubble.svelte";
  import TypingIndicator from "./TypingIndicator.svelte";
  import { messages, config } from "../stores/messages";
  import { onMount } from "svelte";

  let messagesContainer: HTMLDivElement;

  // Auto-scroll to bottom when new messages arrive
  $effect(() => {
    if (messagesContainer && $messages.length > 0) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  });

  onMount(() => {
    // Scroll to bottom on mount
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  });
</script>

<div 
  bind:this={messagesContainer}
  class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
>
  {#if $messages.length === 0}
    <div class="text-center text-gray-400 py-8">
      {#if $config.widgetWelcomeMessage}
        <p class="text-sm">{$config.widgetWelcomeMessage}</p>
      {:else}
        <p class="text-sm">Send a message to start chatting</p>
      {/if}
    </div>
  {:else}
    {#each $messages as message (message.id)}
      {#if message.id === "typing"}
        <TypingIndicator />
      {:else}
        <ChatBubble {message} />
      {/if}
    {/each}
  {/if}
</div>
