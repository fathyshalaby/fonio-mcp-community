export const GITHUB_REPO = "https://github.com/fathyshalaby/fonio-mcp-community";

export const AFFILIATION_DISCLAIMER =
  "This is an independent, unofficial, open-source community project. It is not affiliated with, endorsed by, sponsored by, or associated with fonio GmbH or fonio.ai. The authors are community members and have no employment or contractor relationship with fonio.";

export const NOT_SAAS =
  "This is not a SaaS product, company, or paid service. It is an MIT-licensed open-source MCP server. You run it yourself (local stdio or self-host). A volunteer may also put a copy on a free domain as a convenience. That copy is not a product: no accounts, no subscription, no SLA, no support, and no liability.";

export const LIABILITY_DISCLAIMER =
  "The software is licensed under the MIT License and provided “as is”, without warranty of any kind. The authors and contributors are not liable for anything that happens if you use the code or a volunteer-hosted copy — including downtime, lost data, billed phone calls, leaked or stored API keys, account issues, or other damages. Using a free-domain instance is entirely at your own risk.";

export const DOCS_ACCURACY_DISCLAIMER =
  "Bundled help-center copy is a community snapshot of public fonio.info articles. It can be incomplete or wrong. Treat app.fonio.ai and fonio.info as the source of truth, and file an issue if this repo disagrees with them.";

export const API_KEY_DISCLAIMER =
  "This connector never asks for your fonio password. Claude, ChatGPT, and Cursor authenticate with a workspace API key from app.fonio.ai/api-keys, verified live against POST /public/v1/test-api-key. HTTP MCP OAuth is a community PKCE wrapper around that key — it is not fonio GmbH login.";

export const HOSTING_GUIDANCE = `This is open-source software, not a hosted product.

1. Recommended — run it yourself: \`npm run mcp\` with FONIO_API_KEY, or Docker/Vercel on your own HTTPS origin. Your key stays under your control.
2. Optional — a volunteer may publish a copy on a free domain so Claude/ChatGPT have an HTTPS /mcp URL. That instance encrypts API keys on the volunteer’s machine. It can go down, disappear, or be wrong. The volunteer accepts no liability. Self-host if you do not want that.
3. Never collect fonio passwords. Only call the documented public API. Do not brand the OAuth screen as “Sign in with fonio”.`;

export const AUTH_REQUIRED_MESSAGE =
  "This unofficial open-source MCP has no workspace API key yet. In Claude, ChatGPT, or Cursor, finish the community connector: open the official login at app.fonio.ai (we never collect that password), then paste a workspace key from app.fonio.ai/api-keys. Local stdio: set FONIO_API_KEY. Prefer running this repo yourself. A volunteer-hosted URL is unpaid, no warranty, no liability.";

export const MCP_LIMITATION =
  "fonio’s documented public API cannot create or update assistants. This MCP generates a full paste-ready spec for app.fonio.ai and only performs live writes for outbound calls, API-key tests, and remote integration servers.";

export const ASSISTANT_VISIBILITY = `What shows up in Claude, ChatGPT, or Cursor:

- Only after someone pastes a /mcp URL (or runs local stdio). Anthropic and OpenAI do not scrape this repo and will not list or promote it in their official connector catalogs.
- In that user’s chat it is a normal custom MCP: the client shows the server name (fonio-community) and the model can call the tools. That is opt-in per user or workspace, not a store listing and not a SaaS.
- It does not appear inside fonio’s own phone/WhatsApp assistants on app.fonio.ai.
- Do not submit this connector to Claude/ChatGPT directories as “the fonio MCP”. If you mention it, call it an unofficial open-source community MCP.`;
