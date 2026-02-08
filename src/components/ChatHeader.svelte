<script lang="ts">
  import { X, RotateCcw } from "lucide-svelte";

  interface Props {
    title: string;
    subtitle?: string;
    logoUrl?: string;
    onClose: () => void;
    onResolve: () => void;
  }

  let { title, subtitle, logoUrl, onClose, onResolve }: Props = $props();
</script>

<header class="bg-[var(--mc-primary)] text-white px-4 py-3 flex items-center gap-3"
        style="background-color: var(--mc-primary, #3b82f6);">
  {#if logoUrl}
    <img src={logoUrl} alt="Logo" class="w-10 h-10 rounded-full object-cover" />
  {:else}
    <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    </div>
  {/if}

  <div class="flex-1 min-w-0">
    <h3 class="font-semibold text-sm truncate">{title}</h3>
    {#if subtitle}
      <p class="text-xs text-white/80 truncate">{subtitle}</p>
    {/if}
  </div>

  <button
    onclick={onResolve}
    class="p-2 hover:bg-white/20 rounded-full transition-colors"
    aria-label="End conversation"
    title="End conversation"
  >
    <RotateCcw class="w-4 h-4" />
  </button>

  <button
    onclick={onClose}
    class="p-2 hover:bg-white/20 rounded-full transition-colors"
    aria-label="Close chat"
  >
    <X class="w-5 h-5" />
  </button>
</header>
