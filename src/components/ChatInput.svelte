<script lang="ts">
  interface AttachmentInput {
    type: "image" | "file";
    name: string;
    mimeType: string;
    size: number;
    dataUrl: string;
  }

  interface ReplyState {
    senderLabel: string;
    content?: string;
    attachmentLabel?: string;
  }

  interface Props {
    onSend: (payload: {
      content?: string;
      attachments?: AttachmentInput[];
    }) => void;
    onTyping?: (isTyping: boolean) => void;
    placeholder?: string;
    disabled?: boolean;
    reply?: ReplyState | null;
    onCancelReply?: () => void;
  }

  let {
    onSend,
    onTyping,
    placeholder = "Type a message...",
    disabled = false,
    reply = null,
    onCancelReply,
  }: Props = $props();

  let message = $state("");
  let typingTimeout: ReturnType<typeof setTimeout> | null = null;
  let isTypingSent = $state(false);
  let fileInput = $state<HTMLInputElement | null>(null);
  let attachment = $state<AttachmentInput | null>(null);

  function handleSubmit(e: Event) {
    e.preventDefault();
    if ((message.trim() || attachment) && !disabled) {
      if (isTypingSent) {
        onTyping?.(false);
        isTypingSent = false;
      }
      if (typingTimeout) {
        clearTimeout(typingTimeout);
        typingTimeout = null;
      }

      onSend({
        content: message.trim() || undefined,
        attachments: attachment ? [attachment] : undefined,
      });

      message = "";
      clearAttachment();
    }
  }

  function handleInput() {
    if (!onTyping || disabled) return;

    if (!isTypingSent && message.trim()) {
      onTyping(true);
      isTypingSent = true;
    }

    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    typingTimeout = setTimeout(() => {
      if (isTypingSent) {
        onTyping(false);
        isTypingSent = false;
      }
    }, 1500);
  }

  async function handleFileChange(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    attachment = {
      type: file.type.startsWith("image/") ? "image" : "file",
      name: file.name,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
      dataUrl: await readFileAsDataUrl(file),
    };
  }

  function clearAttachment() {
    attachment = null;
    if (fileInput) {
      fileInput.value = "";
    }
  }

  function readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () =>
        reject(reader.error || new Error("Failed to read attachment"));
      reader.readAsDataURL(file);
    });
  }

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
  {#if reply}
    <div class="mb-2 flex items-start justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs">
      <div class="min-w-0">
        <div class="font-semibold text-gray-700">{reply.senderLabel}</div>
        <div class="truncate text-gray-500">{reply.content || reply.attachmentLabel || "Message"}</div>
      </div>
      <button
        type="button"
        class="text-gray-500 hover:text-gray-800"
        onclick={() => onCancelReply?.()}
      >
        Cancel
      </button>
    </div>
  {/if}

  {#if attachment}
    <div class="mb-2 flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs">
      <div class="min-w-0 truncate text-gray-600">{attachment.name}</div>
      <button type="button" class="text-gray-500 hover:text-gray-800" onclick={clearAttachment}>
        Remove
      </button>
    </div>
  {/if}

  <div class="flex items-center gap-2">
    <input
      bind:this={fileInput}
      type="file"
      class="hidden"
      oninput={handleFileChange}
      accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.csv"
    />

    <button
      type="button"
      {disabled}
      class="p-2 text-gray-500 hover:text-gray-800 disabled:opacity-50"
      onclick={() => fileInput?.click()}
      aria-label="Attach file"
    >
      +
    </button>

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
