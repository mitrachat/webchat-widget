# @mitrachat/webchat-widget

Embeddable WebChat widget for MitraChat - built with Svelte 5, Vite, and Tailwind v4.

## Installation

### Via NPM

```bash
npm install @mitrachat/webchat-widget
# or
yarn add @mitrachat/webchat-widget
# or
bun add @mitrachat/webchat-widget
```

```typescript
import { mountWebchat } from "@mitrachat/webchat-widget";

mountWebchat({
  providerId: "your-provider-id",
  apiUrl: "https://api.mitrachat.com",
  theme: "auto",
  position: "bottom-right",
});
```

### Via CDN

```html
<script src="https://cdn.mitrachat.com/widget/v1/webchat-widget.iife.js" async></script>
<script>
  window.MitraChatWidget.init({
    providerId: "your-provider-id",
    apiUrl: "https://api.mitrachat.com",
  });
</script>
```

### Via Custom Element

```html
<div
  data-mitrachat-provider="your-provider-id"
  data-mitrachat-api-url="https://api.mitrachat.com"
  data-mitrachat-theme="auto"
  data-mitrachat-position="bottom-right">
</div>
```

## Local Development & Testing

### Prerequisites

1. Backend server running: `bun run dev:server` (runs on http://localhost:3000)
2. Create a webchat provider in the MitraChat dashboard
3. Note the provider ID

### Option 1: Dev Server with Hot Reload (Recommended)

```bash
cd packages/webchat-widget
bun install
bun run dev
```

This will:
- Start Vite dev server on http://localhost:5174
- Open the demo page automatically
- Enable hot module replacement (HMR) for instant updates

The demo page allows you to:
- Configure provider ID, API URL, theme, and position
- Load/unload the widget dynamically
- See the embed code preview

### Option 2: Build and Test

```bash
cd packages/webchat-widget
bun install
bun run build
```

Then open `public/demo.html` in a browser (requires a local server):

```bash
# Using Python 3
python3 -m http.server 8080

# Using Node.js
npx serve .

# Using Bun
bunx serve .
```

Visit http://localhost:8080/public/demo.html

### Option 3: Test in Main App

You can also test the widget directly in the main web app:

1. Build the widget: `bun run build`
2. Import it in a test page in `apps/web/src/pages/`
3. Run the web app: `bun run dev:web`

## Configuration

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `providerId` | `string` | **required** | The webchat provider ID from MitraChat |
| `apiUrl` | `string` | **required** | The API base URL (e.g., http://localhost:3000) |
| `theme` | `'light' \| 'dark' \| 'auto'` | `'auto'` | Widget theme |
| `position` | `'bottom-right' \| 'bottom-left'` | `'bottom-right'` | Widget position |

### Provider Configuration

Configure the widget appearance in the MitraChat dashboard:

- `widget_title` - Chat window title
- `widget_subtitle` - Subtitle text
- `widget_color` - Primary color (hex)
- `widget_position` - Position on screen
- `allowed_domains` - Allowed domains for security
- `widget_welcome_message` - Initial message
- `widget_placeholder_text` - Input placeholder
- `widget_logo_url` - Custom logo URL

## Architecture

### Real-time Communication

The widget uses **Server-Sent Events (SSE)** for real-time communication:

```
Widget <-- SSE Stream --> Server (oRPC eventIterator)
Widget -- HTTP POST --> Server (oRPC procedures)
```

Benefits:
- Works through corporate firewalls
- Automatic reconnection
- No WebSocket server changes needed
- Type-safe via oRPC

### Message Flow

1. User sends message → `POST /api/webchat.sendMessage`
2. Server queues message to BullMQ
3. AI agent or n8n webhook processes message
4. Server pushes response via SSE stream
5. Widget displays response

## Development

### Project Structure

```
packages/webchat-widget/
├── src/
│   ├── components/       # Svelte components
│   ├── lib/             # Utilities (oRPC client, SSE, session)
│   ├── stores/          # Svelte stores
│   ├── types/           # TypeScript types
│   ├── styles/          # Tailwind CSS
│   ├── index.ts         # NPM entry point
│   └── embed.ts         # CDN entry point
├── public/
│   └── demo.html        # Local test page
└── dist/                # Build output
```

### Scripts

- `bun run dev` - Start dev server with HMR
- `bun run build` - Build for production
- `bun run preview` - Preview production build
- `bun run typecheck` - Run TypeScript checks

### Build Outputs

- `dist/index.es.js` - ESM build (for bundlers)
- `dist/index.umd.js` - UMD build (for legacy)
- `dist/embed.iife.js` - IIFE build (for CDN/script tag)
- `dist/style.css` - Compiled CSS

## Troubleshooting

### Widget not connecting

1. Check browser console for errors
2. Verify backend is running on the correct port
3. Check provider ID is correct
4. Ensure domain is in `allowed_domains` (or leave empty)

### CORS errors

The widget uses `credentials: "omit"` for requests. Ensure your backend CORS settings allow the widget domain.

### SSE connection drops

The widget has automatic reconnection with exponential backoff. Check:
- Network connectivity
- Backend SSE endpoint is working
- Redis is running (for session storage)

## License

MIT
