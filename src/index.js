// Cloudflare Worker entrypoint for AI proxy
// This worker receives requests from the front-end, attaches the
// API key stored in an environment variable (or secret), and makes
// the real call to the third‑party AI service.  The key never leaves
// the Cloudflare environment.

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // only handle POSTs to the /api/ai path; serve other paths as
    // static assets or return 404
    if (request.method === 'POST' && url.pathname === '/api/ai') {
      try {
        const body = await request.text();

        // forward the request to the AI model backend
        const aiResponse = await fetch(env.AI_API_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // using a secret binding so the key is not in source control
            'Authorization': `Bearer ${env.AI_API_KEY}`
          },
          body
        });

        const text = await aiResponse.text();
        return new Response(text, {
          status: aiResponse.status,
          headers: {
            'content-type': aiResponse.headers.get('content-type') || 'application/json'
          }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
      }
    }

    // For everything else you could return static assets or a 404.
    return new Response('Found', { status: 404 });
  }
};
