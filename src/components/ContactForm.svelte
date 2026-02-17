<script lang="ts">
  import { X } from "lucide-svelte";
  import type { WidgetConfig } from '../types';
  
  interface Props {
    config: WidgetConfig;
    onSubmit: (contactInfo: { name: string; email: string; phone?: string }) => void;
    onClose: () => void;
  }
  
  let { config, onSubmit, onClose }: Props = $props();
  
  let name = $state('');
  let email = $state('');
  let phone = $state('');
  let errors = $state({ name: '', email: '', phone: '' });
  let isSubmitting = $state(false);
  let submitError = $state('');
  
  const fields = $derived(config.widgetContactFields || { name: true, email: true, phone: false });
  const requiredFields = $derived(config.widgetContactRequiredFields || { name: true, email: true, phone: false });
  
  function validate(): boolean {
    errors = { name: '', email: '', phone: '' };
    let isValid = true;
    
    if (fields.name && requiredFields.name && !name.trim()) {
      errors.name = 'Name is required';
      isValid = false;
    }
    
    if (fields.email && requiredFields.email) {
      if (!email.trim()) {
        errors.email = 'Email is required';
        isValid = false;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = 'Please enter a valid email';
        isValid = false;
      }
    }
    
    if (fields.phone && requiredFields.phone && !phone.trim()) {
      errors.phone = 'Phone is required';
      isValid = false;
    }
    
    if (fields.phone && phone.trim() && !/^[\d\s\-\+\(\)]+$/.test(phone)) {
      errors.phone = 'Please enter a valid phone number';
      isValid = false;
    }
    
    return isValid;
  }
  
  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (!validate()) return;

    isSubmitting = true;
    try {
      await onSubmit({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
      });
    } catch (err) {
      submitError = err instanceof Error ? err.message : 'Failed to submit';
    } finally {
      isSubmitting = false;
    }
  }
</script>

<div class="chat-window bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col"
     style="width: 380px; height: 600px;">
  
  <!-- Header -->
  <header class="text-white px-4 py-3 flex items-center gap-3 shrink-0"
          style="background-color: var(--mc-primary, #3b82f6);">
    {#if config.widgetLogoUrl}
      <img src={config.widgetLogoUrl} alt="Logo" class="w-10 h-10 rounded-full object-cover" />
    {:else}
      <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </div>
    {/if}

    <div class="flex-1 min-w-0">
      <h3 class="font-semibold text-sm truncate">{config.widgetTitle || "Start a conversation"}</h3>
      {#if config.widgetSubtitle}
        <p class="text-xs text-white/80 truncate">{config.widgetSubtitle}</p>
      {/if}
    </div>

    <button
      onclick={onClose}
      class="p-2 hover:bg-white/20 rounded-full transition-colors"
      aria-label="Close chat"
    >
      <X class="w-5 h-5" />
    </button>
  </header>
  
  <!-- Scrollable Content -->
  <div class="flex-1 overflow-y-auto">
    <div class="contact-form-container">
      <div class="contact-form-header">
        <h3>Welcome! 👋</h3>
        <p>Please provide your information to start chatting</p>
      </div>
      
      <form onsubmit={handleSubmit} class="contact-form">
        {#if fields.name}
          <div class="form-group">
            <label for="name">
              Name
              {#if requiredFields.name}
                <span class="required">*</span>
              {/if}
            </label>
            <input
              type="text"
              id="name"
              bind:value={name}
              placeholder="Your name"
              class:error={errors.name}
            />
            {#if errors.name}
              <span class="error-message">{errors.name}</span>
            {/if}
          </div>
        {/if}
        
        {#if fields.email}
          <div class="form-group">
            <label for="email">
              Email
              {#if requiredFields.email}
                <span class="required">*</span>
              {/if}
            </label>
            <input
              type="email"
              id="email"
              bind:value={email}
              placeholder="your@email.com"
              class:error={errors.email}
            />
            {#if errors.email}
              <span class="error-message">{errors.email}</span>
            {/if}
          </div>
        {/if}
        
        {#if fields.phone}
          <div class="form-group">
            <label for="phone">
              Phone
              {#if requiredFields.phone}
                <span class="required">*</span>
              {/if}
            </label>
            <input
              type="tel"
              id="phone"
              bind:value={phone}
              placeholder="Your phone number"
              class:error={errors.phone}
            />
            {#if errors.phone}
              <span class="error-message">{errors.phone}</span>
            {/if}
          </div>
        {/if}
        
        <button type="submit" class="submit-btn" disabled={isSubmitting}>
          {#if isSubmitting}
            Starting...
          {:else}
            Start Chat
          {/if}
        </button>
        {#if submitError}
          <span class="error-message">{submitError}</span>
        {/if}
      </form>
    </div>
  </div>
</div>

<style>
  .contact-form-container {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    min-height: 100%;
  }
  
  .contact-form-header {
    text-align: center;
  }
  
  .contact-form-header h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.25rem;
    font-weight: 600;
  }
  
  .contact-form-header p {
    margin: 0;
    color: #6b7280;
    font-size: 0.875rem;
  }
  
  .contact-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  
  label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
  }
  
  .required {
    color: #ef4444;
    margin-left: 0.25rem;
  }
  
  input {
    padding: 0.625rem 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    transition: border-color 0.15s ease;
  }
  
  input:focus {
    outline: none;
    border-color: var(--mc-primary, #3b82f6);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  input.error {
    border-color: #ef4444;
  }
  
  input.error:focus {
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
  }
  
  .error-message {
    font-size: 0.75rem;
    color: #ef4444;
  }
  
  .submit-btn {
    padding: 0.75rem 1rem;
    background: var(--mc-primary, #3b82f6);
    color: white;
    border: none;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.15s ease;
    margin-top: 0.5rem;
  }
  
  .submit-btn:hover {
    background: var(--mc-primary-dark, #2563eb);
  }
  
  .submit-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
</style>
