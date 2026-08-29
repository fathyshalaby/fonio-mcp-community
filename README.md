# fonio MCP

Hosted Model Context Protocol server for [fonio.ai](https://www.fonio.ai). Same shape as the ElevenLabs MCP: add a URL in Claude, ChatGPT, or Cursor, **Sign in with fonio** on the official app, then search [fonio.info](https://fonio.info) and trigger outbound calls.

fonio’s public API is API-key based today (no workspace OAuth client yet). Sign in with fonio opens [app.fonio.ai/login](https://app.fonio.ai/login). After you copy a key from [API keys](https://app.fonio.ai/api-keys), we verify it live with `POST /public/v1/test-api-key` and keep an encrypted session on this host — not in the chat. We never collect your fonio password.

## Connect (hosted)

Point any MCP client at:

```
https://<your-host>/mcp
```

Claude Code:

```bash
claude mcp add --transport http fonio https://<your-host>/mcp
```

Then run `/mcp` and complete **Sign in with fonio**. The next time, Allow access is one click (workspace cookie on this host).

## Host it

### Vercel (public HTTPS)

```bash
npx vercel --prod
```

Set:

| Variable | Value |
| --- | --- |
| `FONIO_MCP_SECRET` | long random string (`openssl rand -hex 32`) |
| `NEXT_PUBLIC_MCP_ORIGIN` | the deployment URL, e.g. `https://your-app.vercel.app` |

Without `NEXT_PUBLIC_MCP_ORIGIN`, OAuth metadata is inferred from the `Host` header.

### Docker

```bash
docker build -t fonio-mcp .
docker run --rm -p 43147:43147 \
  -e FONIO_MCP_SECRET="$(openssl rand -hex 32)" \
  -e NEXT_PUBLIC_MCP_ORIGIN="https://your.public.host" \
  fonio-mcp
```

Put a reverse proxy or Cloudflare Tunnel in front so Claude/ChatGPT can reach HTTPS.

## Examples

Open `/examples` on the site, or ask the connected assistant for `list_examples`.

| You say | What happens |
| --- | --- |
| Write a receptionist prompt that books Prophylaxe and transfers billing to Anna | `search_docs` + paste-ready prompt |
| Look this caller up in HubSpot before the greeting | Inbound webhook JSON + `{{inboundContext}}` |
| A lead submitted the form — call Ada back about the Q3 quote | Outbound API curl, KYC checklist |
| Yes, dial +4915… from our imported number | `trigger_outbound_call` after confirm |

LinkedIn copy (EN + DE) lives at `/share`.

## Tools

| Tool | Purpose |
| --- | --- |
| `search_docs` / `get_doc` / `list_docs` | Help-center knowledge |
| `list_examples` | Ready-to-paste prompts |
| `get_api_reference` | OpenAPI, webhook IPs, `{{variables}}` |
| `test_api_key` | Connected workspace or `FONIO_API_KEY` |
| `trigger_outbound_call` | Real call — confirm the number first |

Docs tools work before login. Live calls need the OAuth session (hosted) or `FONIO_API_KEY` (local stdio). Outbound still requires Teams, KYC, and an imported/SIP `fromNumber`.

## Local

```bash
npm install
cp .env.example .env.local
# FONIO_MCP_SECRET=long-random-string
npm run dev          # http://127.0.0.1:43147  +  /mcp
npm run mcp          # stdio for Claude Desktop
npm test
```

## OAuth endpoints (MCP spec)

- `/.well-known/oauth-protected-resource`
- `/.well-known/oauth-authorization-server`
- `POST /oauth/register` (dynamic client registration)
- `GET/POST /oauth/authorize` (Sign in with fonio — official login + encrypted workspace session)
- `POST /oauth/token` (PKCE S256)

When fonio GmbH ships a workspace OAuth app, replace the API-key step with a redirect to `app.fonio.ai` — the MCP client flow stays the same.

Official API: [app.fonio.ai/api/docs](https://app.fonio.ai/api/docs). Support: support@fonio.ai.
