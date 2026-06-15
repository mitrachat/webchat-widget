<script lang="ts">
  import type { Message } from "../types";
  import { marked } from 'marked';
  import DOMPurify from 'dompurify';

  interface Props {
    message: Message;
    onReply?: (message: Message) => void;
    onRetry?: (message: Message) => void;
  }

  let { message, onReply, onRetry }: Props = $props();

  function formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  /**
   * Render markdown or HTML content based on message format.
   * All HTML is sanitized via DOMPurify before insertion into the DOM.
   */
  function renderContent(text: string, format?: "plain" | "html"): string {
    if (!text) return "";

    // Force rel="noopener noreferrer" on any link opened in a new tab to
    // prevent reverse tabnabbing from agent-generated or user-shared links.
    DOMPurify.addHook("afterSanitizeAttributes", (node) => {
      if (node.tagName === "A" && node.getAttribute("target") === "_blank") {
        node.setAttribute("rel", "noopener noreferrer");
      }
    });

    let rawHtml: string;
    if (format === "html") {
      rawHtml = text;
    } else {
      rawHtml = marked(text, { breaks: true, gfm: true }) as string;
    }

    const sanitized = DOMPurify.sanitize(rawHtml, {
      ALLOWED_TAGS: [
        "p", "br", "strong", "b", "em", "i", "s", "strike", "del",
        "code", "pre", "a", "ul", "ol", "li", "blockquote", "h1",
        "h2", "h3", "h4", "h5", "h6", "img", "span", "div",
      ],
      ALLOWED_ATTR: [
        "href", "title", "target", "rel", "src", "alt", "class",
      ],
    });

    // Hooks persist on the shared DOMPurify instance; remove this one so
    // subsequent sanitization rounds do not stack duplicate hooks.
    DOMPurify.removeHook("afterSanitizeAttributes");

    return sanitized;
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
      {#if message.sender === 'user' && message.status && message.status !== 'failed'}
        · {message.status}
      {/if}
    </span>

    <!-- bag.7 #5 — failed sends are visually distinct (red) with tap-to-retry
         that re-sends with the same clientMessageId (idempotent server-side). -->
    {#if message.sender === 'user' && message.status === 'failed'}
      <div class="mt-1 flex items-center gap-2 {message.sender === 'user' ? 'justify-end' : ''}">
        <span class="text-xs font-medium text-red-600">⚠ Gagal terkirim</span>
        {#if onRetry}
          <button
            type="button"
            class="text-xs font-medium text-red-600 underline"
            onclick={() => onRetry?.(message)}
          >
            Coba lagi
          </button>
        {/if}
      </div>
    {/if}
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
