<script lang="ts">
  interface Props {
    onClick: () => void;
    unreadCount: number;
  }

  let { onClick, unreadCount }: Props = $props();
</script>

<button
  onclick={onClick}
  class="w-14 h-14 rounded-full bg-[var(--mc-primary)] text-white shadow-lg hover:scale-110 transition-transform flex items-center justify-center relative"
  style="background-color: var(--mc-primary, #3b82f6);"
  aria-label="Open chat"
>
  <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>

  {#if unreadCount > 0}
    <span class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
      {unreadCount > 9 ? "9+" : unreadCount}
    </span>
  {/if}
</button>
