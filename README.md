# Unofficial fonio MCP

Use Claude, ChatGPT, Cursor, or another MCP client to build Fonio assistants, prepare outbound calls, search Fonio guidance, and connect remote integrations.

This is an independent MIT-licensed community project. It is not made by, endorsed by, or affiliated with fonio GmbH. It is not a hosted product or a Fonio login service.

## What it can do

- Build a complete, paste-ready voice or WhatsApp assistant.
- Draft the prompt, greeting, knowledge-base Q&A, tools, transfers, calendar, webhooks, and setup checklist.
- Validate prompts against the documented Fonio guidance.
- Test an API key and trigger outbound calls with an explicit confirmation step.
- Register remote integration-manifest servers in Fonio.
- Optionally create or update an assistant through the visible Fonio dashboard in a local browser.

Fonio’s public API does not currently provide assistant create/update endpoints. The local browser option exists for that missing dashboard step; it does not use private Fonio HTTP APIs.

## Quick start: local MCP

```bash
git clone https://github.com/fathyshalaby/fonio-mcp-community.git
cd fonio-mcp-community
npm install
cp .env.example .env.local
npm run mcp
```

For local API access, set `FONIO_API_KEY` in `.env.local`. Create a key in [Fonio API keys](https://app.fonio.ai/api-keys). Never put your Fonio password in the environment file.

Add the running MCP to your client using its local stdio configuration. For Claude Code:

```bash
claude mcp add unofficial-fonio-mcp -- npm run mcp
```

## Create an assistant through the local dashboard

The public API can’t save assistants, so local users can opt into a visible Chrome bridge. It uses a separate browser profile on your machine. You log in manually; credentials and session data never leave the machine.

Add this to `.env.local`:

```bash
FONIO_ENABLE_BROWSER=true
```

Then run `npm run mcp` and use the tools in this order:

1. `get_dashboard_browser_status`
2. `open_dashboard_browser`, then log in at `app.fonio.ai`
3. `prepare_dashboard_assistant`
4. Review the plan and explicitly confirm it.
5. Call `create_dashboard_assistant` or `update_dashboard_assistant`.

The bridge fills the assistant name, greeting, and prompt when Fonio exposes those fields accessibly. It reports the remaining voice, language, knowledge, calendar, transfer, webhook, and tool settings for review. It will not guess if the Fonio UI changes.

Optional browser settings:

```bash
# Use a specific dedicated profile directory
FONIO_BROWSER_PROFILE_DIR=/absolute/path/to/fonio-profile

# Use a Chrome instance started with remote debugging
FONIO_BROWSER_CDP_URL=http://127.0.0.1:9222

# Only if Chrome is not found automatically
FONIO_BROWSER_EXECUTABLE_PATH=/absolute/path/to/chrome
```

Never enable the browser bridge on a hosted deployment.

## Connect a hosted MCP

You can self-host the HTTP MCP on your own HTTPS origin and add:

```text
https://your-host.example/mcp
```

Hosted mode uses the community OAuth wrapper and a Fonio workspace API key. The local browser bridge is intentionally unavailable in hosted mode.

### Vercel

```bash
npx vercel --prod
```

Set these environment variables:

| Variable | Purpose |
| --- | --- |
| `FONIO_MCP_SECRET` | Random secret for OAuth/session encryption |
| `NEXT_PUBLIC_MCP_ORIGIN` | Public HTTPS URL of the deployment |

### Docker

```bash
docker build -t unofficial-fonio-mcp .
docker run --rm -p 43147:43147 \
  -e FONIO_MCP_SECRET="$(openssl rand -hex 32)" \
  -e NEXT_PUBLIC_MCP_ORIGIN="https://your-host.example" \
  unofficial-fonio-mcp
```

## Main tools

| Tool group | Tools |
| --- | --- |
| Assistant building | `list_assistant_templates`, `build_assistant`, `validate_assistant_prompt`, `draft_knowledge_base`, `list_voices` |
| Local dashboard | `get_dashboard_browser_status`, `open_dashboard_browser`, `prepare_dashboard_assistant`, `create_dashboard_assistant`, `update_dashboard_assistant` |
| Fonio docs | `search_docs`, `get_doc`, `list_docs`, `get_api_reference`, `list_examples` |
| Outbound calls | `prepare_outbound_call`, `trigger_outbound_call` |
| Remote integrations | `list_remote_integration_servers`, `register_remote_integration_server`, `delete_remote_integration_server` |

Outbound calls can cost money and require the Fonio Teams plan, KYC, and an imported or SIP number. The tool always requires an exact destination confirmation before dialing.

## Development

```bash
npm run dev
npm run mcp
npm test
npm run lint
npm run typecheck
```

The public API reference is [app.fonio.ai/api/docs](https://app.fonio.ai/api/docs). If this repository disagrees with the official Fonio app or docs, trust the official source.

## License and disclaimer

MIT licensed and provided “as is”. This project stores no Fonio passwords and does not claim to be an official Fonio integration. You are responsible for your own deployment, API keys, browser profile, calls, costs, and data.
