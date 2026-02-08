<script lang="ts">
  import type { Message } from "../types";

  interface Props {
    message: Message;
  }

  let { message }: Props = $props();

  function formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  /**
   * Lightweight markdown to HTML for AI responses.
   * Supports: bold, italic, inline code, code blocks, links, line breaks.
   * Sanitizes HTML tags to prevent XSS.
   */
  function renderMarkdown(text: string): string {
    let html = text
      // Escape HTML entities first (XSS prevention)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      // Code blocks (``` ... ```)
      .replace(/```(\w*)\n?([\s\S]*?)```/g, '<pre class="mc-code-block"><code>$2</code></pre>')
      // Inline code (` ... `)
      .replace(/`([^`]+)`/g, '<code class="mc-inline-code">$1</code>')
      // Bold (**text** or __text__)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/__(.+?)__/g, "<strong>$1</strong>")
      // Italic (*text* or _text_)
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/_(.+?)_/g, "<em>$1</em>")
      // Links [text](url)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="underline">$1</a>')
      // Line breaks
      .replace(/\n/g, "<br>");

    return html;
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
    {#if message.sender === 'user'}
      <p class="text-sm whitespace-pre-wrap">{message.content}</p>
    {:else}
      <div class="text-sm mc-markdown">{@html renderMarkdown(message.content)}</div>
    {/if}
    
    <span class="text-xs opacity-70 mt-1 block {message.sender === 'user' ? 'text-right' : ''}">
      {formatTime(message.timestamp)}
    </span>
  </div>
</div>

<style>
  :global(.mc-code-block) {
    background: rgba(0, 0, 0, 0.08);
    border-radius: 6px;
    padding: 8px 12px;
    margin: 4px 0;
    overflow-x: auto;
    font-size: 0.8em;
    font-family: ui-monospace, monospace;
    white-space: pre-wrap;
  }
  :global(.mc-inline-code) {
    background: rgba(0, 0, 0, 0.08);
    border-radius: 3px;
    padding: 1px 4px;
    font-size: 0.9em;
    font-family: ui-monospace, monospace;
  }
  :global(.mc-markdown strong) {
    font-weight: 600;
  }
</style>
