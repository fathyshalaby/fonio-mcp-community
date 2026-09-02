# fonio MCP (community)

**Unofficial open-source community project.** MIT licensed.

This repository is **not affiliated with, endorsed by, sponsored by, or associated with fonio GmbH or fonio.ai**. The maintainers have no relationship with fonio. fonio® and related marks belong to their owners.

The software is provided **“as is”**, without warranty of any kind. The authors and contributors are **not liable** for anything that results from using it — including billed phone calls, account issues, data loss, or other damages. See [LICENSE](./LICENSE).

---

Community [Model Context Protocol](https://modelcontextprotocol.io) server that talks to [fonio.ai](https://www.fonio.ai)’s **public** API and helps you **build agents in Claude, ChatGPT, or Cursor** — same idea as the ElevenLabs MCP. Add a URL, complete **Sign in with fonio** on the official app, then design paste-ready voice/WhatsApp assistants, search [fonio.info](https://fonio.info), and trigger outbound calls.

fonio’s public API is API-key based today (no workspace OAuth client yet, and **no create-assistant endpoint**). Sign in with fonio opens [app.fonio.ai/login](https://app.fonio.ai/login). After you copy a key from [API keys](https://app.fonio.ai/api-keys), this server verifies it live with `POST /public/v1/test-api-key` and keeps an encrypted session on the host — not in the chat. It never collects your fonio password. Agent-builder tools (`build_assistant`, templates, prompt validation) work before login.

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
| Build a receptionist that books Prophylaxe and transfers billing to Anna | `build_assistant` + `validate_assistant_prompt` + paste-ready spec |
| Write a receptionist prompt that books Prophylaxe and transfers billing to Anna | `search_docs` + paste-ready prompt |
| Look this caller up in HubSpot before the greeting | Inbound webhook JSON + `{{inboundContext}}` |
| A lead submitted the form — call Ada back about the Q3 quote | Outbound API curl, KYC checklist |
| Yes, dial +4915… from our imported number | `trigger_outbound_call` after confirm |

## Tools

| Tool | Purpose |
| --- | --- |
| `list_assistant_templates` / `build_assistant` / `validate_assistant_prompt` / `draft_knowledge_base` / `list_voices` | Build paste-ready voice and WhatsApp agents |
| `search_docs` / `get_doc` / `list_docs` | Help-center knowledge |
| `list_examples` | Ready-to-paste prompts |
| `get_api_reference` | OpenAPI, webhook IPs, `{{variables}}` |
| `test_api_key` | Connected workspace or `FONIO_API_KEY` |
| `list_remote_integration_servers` / `register_remote_integration_server` / `delete_remote_integration_server` | Live integration-manifest servers |
| `prepare_outbound_call` | Validate a destination and return a short-lived confirmation token |
| `trigger_outbound_call` | Real call — requires a matching `confirmationToken` and `confirmedToNumber` after you confirm the number |

Docs tools and the agent builder work before login. Live calls and remote integration servers need the OAuth session (hosted) or `FONIO_API_KEY` (local stdio). Outbound still requires a fonio Teams plan, KYC, and an imported/SIP `fromNumber`. You are responsible for any carrier cost.

The outbound flow first prepares the exact numbers without dialing. It will only proceed when the short-lived `confirmationToken` and `confirmedToNumber` both match that preparation after you have explicitly confirmed the destination. The token is consumed after use to help prevent accidental or repeated calls.

## Local

```bash
git clone https://github.com/fathyshalaby/fonio-mcp-community.git
cd fonio-mcp-community
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

Official fonio API (not this project): [app.fonio.ai/api/docs](https://app.fonio.ai/api/docs). Official support: support@fonio.ai.
