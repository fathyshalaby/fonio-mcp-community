# fonio MCP

Model Context Protocol server for [fonio.ai](https://www.fonio.ai) — the European AI phone and WhatsApp assistant. Connect Claude, ChatGPT, Cursor, VS Code, or any MCP client so it can search [fonio.info](https://fonio.info) docs, inspect the [public API](https://app.fonio.ai/api/docs), and trigger outbound calls.

This is the same product shape as the ElevenLabs MCP: a local stdio server for Claude Desktop, a hosted Streamable HTTP endpoint for Claude Code / Cursor / OpenAI, and a docs site that explains how to connect.

## What the assistant can do

| Tool | Purpose |
| --- | --- |
| `search_docs` | Search bundled help-center knowledge (prompts, webhooks, campaigns, calendar, WhatsApp, GDPR) |
| `get_doc` / `list_docs` | Read a full article or list the catalog |
| `get_api_reference` | Public OpenAPI, webhook source IPs, built-in `{{variables}}` |
| `test_api_key` | `POST /public/v1/test-api-key` |
| `trigger_outbound_call` | `POST /public/v1/outbound_call` — **places a real call** |

Prompts: `write_assistant_prompt`, `setup_outbound_call`, `setup_inbound_webhook`.

Resources: `fonio://docs/{slug}`, `fonio://api/openapi`, `fonio://variables`.

Docs search works without a key. Live API tools need `FONIO_API_KEY` from [app.fonio.ai](https://app.fonio.ai). Outbound calling requires the Teams plan, completed KYC, and an imported or SIP number. `fromNumber` selects the outbound assistant assigned to that number.

## Run locally

```bash
npm install
cp .env.example .env.local   # optional FONIO_API_KEY for live tools
npm run dev                  # docs site + hosted MCP on http://127.0.0.1:43147
```

Hosted MCP URL: `http://127.0.0.1:43147/mcp`

Stdio (Claude Desktop):

```bash
FONIO_API_KEY=your_key npm run mcp
```

## Connect a client

**Claude Code**

```bash
claude mcp add --transport http fonio http://127.0.0.1:43147/mcp
```

**Cursor** (`mcp.json`)

```json
{
  "mcpServers": {
    "fonio": {
      "url": "http://127.0.0.1:43147/mcp"
    }
  }
}
```

**Claude Desktop** (`claude_desktop_config.json`) — from this repo after `npm install`:

```json
{
  "mcpServers": {
    "fonio": {
      "command": "npx",
      "args": ["tsx", "./src/mcp/stdio.ts"],
      "env": {
        "FONIO_API_KEY": "<your-fonio-api-key>"
      }
    }
  }
}
```

**ChatGPT / OpenAI Agents** — add a remote MCP server pointing at `http://127.0.0.1:43147/mcp` (or your deployed URL) and set `FONIO_API_KEY` in the connector environment.

## Public API (what the MCP wraps)

```bash
curl -X POST https://app.fonio.ai/api/public/v1/outbound_call \
  -H "Authorization: Bearer $FONIO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "fromNumber": "+43123456789",
    "toNumber": "+4915123456789",
    "context": { "name": "Ada" }
  }'
```

Official spec: [app.fonio.ai/api/docs](https://app.fonio.ai/api/docs). Help center: [fonio.info](https://fonio.info). Academy videos: [fonio.academy](https://fonio.academy).

## Tests

```bash
npm test
```

## Layout

- `src/mcp/` — API client, docs catalog, tool registration, stdio entry
- `src/app/mcp/route.ts` — Streamable HTTP MCP endpoint
- `src/app/` — docs site (install, tools, knowledge, API)

This repository is an MCP integration for fonio users. It is not published by fonio GmbH; product behaviour is taken from the public API and help center. Support for the fonio product itself: support@fonio.ai.
