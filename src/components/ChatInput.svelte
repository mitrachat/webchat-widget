<script lang="ts">
  interface Props {
    onSend: (content: string) => void;
    onTyping?: (isTyping: boolean) => void;
    placeholder?: string;
    disabled?: boolean;
  }

  let { onSend, onTyping, placeholder = "Type a message...", disabled = false }: Props = $props();

  let message = $state("");
  let typingTimeout: ReturnType<typeof setTimeout> | null = null;
  let isTypingSent = $state(false);

  function handleSubmit(e: Event) {
    e.preventDefault();
    if (message.trim() && !disabled) {
      // Clear typing status when message is sent
      if (isTypingSent) {
        onTyping?.(false);
        isTypingSent = false;
      }
      if (typingTimeout) {
        clearTimeout(typingTimeout);
        typingTimeout = null;
      }
      onSend(message.trim());
      message = "";
    }
  }

  function handleInput() {
    if (!onTyping || disabled) return;

    // User started typing
    if (!isTypingSent && message.trim()) {
      onTyping(true);
      isTypingSent = true;
    }

    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Set timeout to stop typing after 1.5 seconds of inactivity
    typingTimeout = setTimeout(() => {
      if (isTypingSent) {
        onTyping(false);
        isTypingSent = false;
      }
    }, 1500);
  }

  // Cleanup on unmount
  $effect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      if (isTypingSent && onTyping) {
        onTyping(false);
      }
    };
  });
</script>

<form onsubmit={handleSubmit} class="border-t border-gray-200 p-3 bg-white">
  <div class="flex items-center gap-2">
    <input
      type="text"
      bind:value={message}
      oninput={handleInput}
      {placeholder}
      {disabled}
      class="flex-1 px-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:border-[var(--mc-primary)] focus:ring-1 focus:ring-[var(--mc-primary)]"
      style="--mc-primary: var(--widget-color, #3b82f6);"
    />
    
    <button
      type="submit"
      {disabled}
      class="p-2 bg-[var(--mc-primary)] text-white rounded-full hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
      style="background-color: var(--mc-primary, #3b82f6);"
      aria-label="Send message"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
      </svg>
    </button>
  </div>
</form>
