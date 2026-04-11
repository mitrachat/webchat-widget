<script lang="ts">
  import type { Message } from "../types";
  import { marked } from 'marked';

  interface Props {
    message: Message;
    onReply?: (message: Message) => void;
  }

  let { message, onReply }: Props = $props();

  function formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  /**
   * Render markdown or HTML content based on message format
   * For HTML format: render directly (from server)
   * For plain format: convert markdown to HTML using marked
   */
  function renderContent(text: string, format?: "plain" | "html"): string {
    if (!text) return "";
    
    // If format is HTML, render directly (already sanitized on server)
    if (format === "html") {
      return text;
    }
    
    // Otherwise, convert markdown to HTML using marked
    return marked(text, {
      breaks: true,
      gfm: true,
    }) as string;
  }
</script>

<div
  class="chat-message flex {message.sender === 'user' ? 'justify-end' : 'justify-start'}"
>
  <div
    class="max-w-[80%] px-4 py-2 rounded-2xl {message.sender === 'user'
      ? 'bg-[var(--mc-primary)] text-white rounded-br-md'
      : 'bg-gray-200 text-gray-800 rounded-bl-md'}"
    style={message.sender === 'user' ? 'background-color: var(--mc-primary, #3b82f6);' : ''}
  >
    {#if onReply && message.sender !== "system"}
      <button
        type="button"
        class="mb-2 text-[11px] font-medium opacity-70 hover:opacity-100"
        onclick={() => onReply?.(message)}
      >
        Reply
      </button>
    {/if}

    {#if message.reply}
      <div class="mb-2 rounded-lg border border-black/10 bg-black/5 px-3 py-2 text-xs">
        <div class="font-semibold opacity-80">{message.reply.senderLabel}</div>
        {#if message.reply.content}
          <div class="mt-0.5 line-clamp-2 opacity-80">{message.reply.content}</div>
        {:else if message.reply.attachmentLabel}
          <div class="mt-0.5 opacity-80">{message.reply.attachmentLabel}</div>
        {/if}
      </div>
    {/if}

    {#if message.attachments?.length}
      <div class="mb-2 space-y-2">
        {#each message.attachments as attachment (attachment.id)}
          {#if attachment.type === "image"}
            <a href={attachment.url} target="_blank" rel="noopener noreferrer">
              <img
                src={attachment.url}
                alt={attachment.name}
                class="max-w-full max-h-48 rounded-lg border border-black/10"
              />
            </a>
          {:else}
            <a
              href={attachment.url}
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-2 rounded-lg border border-black/10 bg-white/70 px-3 py-2 text-sm"
            >
              <span>File</span>
              <span class="truncate">{attachment.name}</span>
            </a>
          {/if}
        {/each}
      </div>
    {/if}

    {#if message.sender === 'user' && message.content}
      <p class="text-sm whitespace-pre-wrap">{message.content}</p>
    {:else if message.content}
      <div class="text-sm mc-markdown">{@html renderContent(message.content, message.format)}</div>
    {/if}

    <span class="text-xs opacity-70 mt-1 block {message.sender === 'user' ? 'text-right' : ''}">
      {formatTime(message.timestamp)}
      {#if message.sender === 'user' && message.status}
        · {message.status}
      {/if}
    </span>
  </div>
</div>

<style>
  :global(.mc-markdown) {
    line-height: 1.5;
  }
  :global(.mc-markdown strong) {
    font-weight: 600;
  }
  :global(.mc-markdown em) {
    font-style: italic;
  }
  :global(.mc-markdown s) {
    text-decoration: line-through;
  }
  :global(.mc-markdown code) {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
    padding: 1px 4px;
    font-size: 0.9em;
    font-family: ui-monospace, monospace;
  }
  :global(.mc-markdown pre) {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 6px;
    padding: 8px 12px;
    margin: 4px 0;
    overflow-x: auto;
    font-size: 0.85em;
    font-family: ui-monospace, monospace;
    white-space: pre-wrap;
  }
  :global(.mc-markdown pre code) {
    background: transparent;
    padding: 0;
  }
  :global(.mc-markdown a) {
    color: inherit;
    text-decoration: underline;
    opacity: 0.9;
  }
  :global(.mc-markdown p) {
    margin: 0.25em 0;
  }
  :global(.mc-markdown ul),
  :global(.mc-markdown ol) {
    margin: 0.25em 0;
    padding-left: 1.25em;
  }
</style>
