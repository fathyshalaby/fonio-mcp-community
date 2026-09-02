# Community MCP for fonio (unofficial)

**Unofficial open-source community project by a community member — not fonio staff.** MIT licensed.

This repository is **not affiliated with, endorsed by, sponsored by, or associated with fonio GmbH or fonio.ai**. The maintainers have no employment or contractor relationship with fonio. fonio® and related marks belong to their owners.

The software is provided **“as is”**, without warranty of any kind. The authors and contributors are **not liable** for anything that results from using it — including billed phone calls, account issues, data loss, or other damages. See [LICENSE](./LICENSE). Bundled help-center copy can lag [fonio.info](https://fonio.info); trust the official app and docs if they disagree.

---

Community [Model Context Protocol](https://modelcontextprotocol.io) for [fonio.ai](https://www.fonio.ai)’s **public** API. Claude, ChatGPT, and Cursor can **configure a full paste-ready agent** (prompt, greetings, knowledge, transfers, calendar, webhooks, technical/GDPR, phone) and call the documented live endpoints. There is **no create-assistant API** — never claim the agent was saved in the workspace.

Auth is a **workspace API key** from [app.fonio.ai/api-keys](https://app.fonio.ai/api-keys), verified with `POST /public/v1/test-api-key`. Hosted MCP OAuth is a **community PKCE wrapper** around that key. It is **not** fonio GmbH login. This project never collects your fonio password.

## Best way to run this (community host)

If you do not work at fonio, do not ship a login that looks official.

1. **Safest — local stdio.** Each user runs `npm run mcp` with `FONIO_API_KEY` on their machine. You never see anyone’s key.
2. **Best for Claude / ChatGPT — self-host.** Each user deploys this repo (Docker or Vercel) on their own HTTPS origin. They hold their own encrypted session. You publish code, not an official-looking fonio login.
3. **Public community host (optional).** Label it unofficial everywhere, never collect passwords, only call the documented public API, and tell users the host stores an encrypted API key. People who do not trust the operator should self-host.

## What shows up in the assistant

Hosting this does **not** put it in Claude’s or ChatGPT’s official connector catalogs. Anthropic/OpenAI will not promote it for you.

It **does** show up as a normal custom MCP **for the people who add your `/mcp` URL** (or run local stdio):

- Claude, ChatGPT, and Cursor list the server as `fonio-community` and the model can call the tools in that chat.
- That is opt-in per user or workspace, not a store listing.
- It does **not** appear inside fonio’s own phone/WhatsApp assistants on app.fonio.ai.
- Do not submit it to connector directories as “the fonio MCP”. If you mention it anywhere, call it an unofficial community connector.

## Connect (hosted)

Point Claude, ChatGPT, or Cursor at:

```
https://<your-host>/mcp
```

The HTTP MCP **requires** a Bearer token so those clients start OAuth (401 + `WWW-Authenticate` resource metadata). They open **this** community connector: official login stays on [app.fonio.ai/login](https://app.fonio.ai/login), then paste a workspace key.

Claude Code:

```bash
claude mcp add --transport http fonio-community https://<your-host>/mcp
```

Then `/mcp` and paste the key. Next time, Allow is one click (encrypted cookie on **this** host).

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
| Build a receptionist that books Prophylaxe and transfers billing to Anna | `build_assistant` + full paste pack + `validate_assistant_prompt` |
| Write a receptionist prompt that books Prophylaxe and transfers billing to Anna | `search_docs` + paste-ready prompt |
| Look this caller up in HubSpot before the greeting | Inbound webhook JSON + `{{inboundContext}}` |
| A lead submitted the form — call Ada back about the Q3 quote | Outbound API curl, KYC checklist |
| Yes, dial +4915… from our imported number | `trigger_outbound_call` after confirm |

## Tools

| Tool | Purpose |
| --- | --- |
| `get_connection_status` | Whether a workspace API key is connected (last four chars only) |
| `list_assistant_templates` / `build_assistant` / `validate_assistant_prompt` / `draft_knowledge_base` / `list_voices` | Full paste-ready voice and WhatsApp agents |
| `search_docs` / `get_doc` / `list_docs` | Help-center knowledge (community snapshot) |
| `list_examples` | Ready-to-paste prompts |
| `get_api_reference` | OpenAPI, webhook IPs, `{{variables}}` |
| `test_api_key` | Connected workspace or `FONIO_API_KEY` |
| `list_remote_integration_servers` / `register_remote_integration_server` / `delete_remote_integration_server` | Live integration-manifest servers |
| `prepare_outbound_call` | Validate a destination and return a short-lived confirmation token |
| `trigger_outbound_call` | Real call — requires a matching `confirmationToken` and `confirmedToNumber` |

Hosted HTTP MCP requires OAuth + a verified key for **all** tools so Claude/ChatGPT actually connect. Local stdio can use docs/builder with or without `FONIO_API_KEY`; live calls still need the key. Outbound still requires a fonio Teams plan, KYC, and an imported/SIP `fromNumber`. You are responsible for any carrier cost.

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

## OAuth endpoints (MCP spec, this community host)

- `/.well-known/oauth-protected-resource`
- `/.well-known/oauth-authorization-server`
- `POST /oauth/register` (dynamic client registration)
- `GET/POST /oauth/authorize` (community connector: official login + paste workspace API key)
- `POST /oauth/token` (PKCE S256)

Official fonio API (not this project): [app.fonio.ai/api/docs](https://app.fonio.ai/api/docs). Official support: support@fonio.ai.
