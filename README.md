# Verity

This project is a browser-based interactive game.  It uses Cloudflare Workers
as a backend to securely call third-party AI services without exposing API
keys in the client-side code.

## Architecture

```
/ (workspace root)
  ├─ index.html, game.js, etc.   # static assets served directly
  ├─ src/
  │   └─ index.js                # Cloudflare Worker entrypoint
  ├─ wrangler.toml               # worker configuration
  └─ temp-config.jsonc           # example wrangler config (optional)
```

### AI integration flow
1. The frontend (`game.js`) collects user messages and sends them to
   `/api/ai` (relative path).  There are several request types:
   * **character_chat** – normal dialogue with a character.  Each character
     has its own conversation history (and system prompt) so they act as
     persistent, independent AI instances during a mission.
   * **prompt_suggestion** – the user’s input is run through the AI to
     suggest improvements.  Suggestions appear just below the chat input.
   * **report_analysis** – when the player submits a verdict/justification the
     text is sent to the AI for a review to ensure all critical evidence has
     been covered.  The result is shown in a notification.
2. The Cloudflare Worker (in `src/index.js`) receives that POST request. It
   also serves static assets (the entire `public/` directory) so the same
   worker can host the HTML/CSS/JS for the game.  `index.html` is your
   landing page; other files are linked relative to it.
3. The worker attaches the secret API key stored in the environment (via
   `wrangler secret put AI_API_KEY`) and forwards the request to the real
   AI provider endpoint (or uses the built‑in Cloudflare AI binding).  The
   response is streamed back to the browser.

## Setup & deployment

1. Install Wrangler:
   ```bash
   npm install -g wrangler
   ```
2. Authenticate with Cloudflare:
   ```bash
   wrangler login
   ```
3. Add the secret key:
   ```bash
   wrangler secret put AI_API_KEY
   ```
   Optionally set `AI_API_ENDPOINT` via `wrangler kv:namespace` or your
   own variable.
4. Deploy the worker:
   ```bash
   wrangler deploy
   ```
5. Update `aiModelConfig.enabled = true` in `game.js` once the worker is live.

## Local development

Run `wrangler dev` to start a local server that mimics the Worker runtime.
Point your frontend at `http://localhost:8787/api/ai` while developing.

