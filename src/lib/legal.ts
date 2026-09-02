export const GITHUB_REPO = "https://github.com/fathyshalaby/fonio-mcp-community";

export const AFFILIATION_DISCLAIMER =
  "This is an independent, unofficial, open-source community project. It is not affiliated with, endorsed by, sponsored by, or associated with fonio GmbH or fonio.ai. The authors are community members and have no employment or contractor relationship with fonio.";

export const LIABILITY_DISCLAIMER =
  "The software is licensed under the MIT License and provided “as is”, without warranty of any kind. The authors and contributors are not liable for anything that happens if you use it — including lost data, billed phone calls, account issues, or other damages.";

export const DOCS_ACCURACY_DISCLAIMER =
  "Bundled help-center copy is a community snapshot of public fonio.info articles. It can be incomplete or wrong. Treat app.fonio.ai and fonio.info as the source of truth, and file an issue if this repo disagrees with them.";

export const API_KEY_DISCLAIMER =
  "This connector never asks for your fonio password. Claude, ChatGPT, and Cursor authenticate with a workspace API key from app.fonio.ai/api-keys, verified live against POST /public/v1/test-api-key. Hosted MCP OAuth is a community PKCE wrapper around that key — it is not fonio GmbH login.";

export const HOSTING_GUIDANCE = `Best way to run this if you are a community member (not fonio staff):

1. Safest — local stdio: each user runs \`npm run mcp\` with FONIO_API_KEY on their own machine. You never see anyone’s key.
2. Best for Claude / ChatGPT — self-host: each user deploys this repo (Docker or Vercel) on their own HTTPS origin. They hold their own encrypted session. You publish code, not a login page that looks like fonio.
3. Optional public community host — only if you label it unofficial everywhere, never collect passwords, only call the documented public API, and tell users the host stores an encrypted API key. People who do not trust the operator should self-host. Do not brand the OAuth screen as “Sign in with fonio”.`;

export const AUTH_REQUIRED_MESSAGE =
  "This unofficial community MCP has no workspace API key yet. In Claude, ChatGPT, or Cursor, finish the community connector screen: open the official login at app.fonio.ai (we never collect that password), then paste a workspace key from app.fonio.ai/api-keys. Local stdio: set FONIO_API_KEY. Prefer self-hosting this repo if you do not want the host to store an encrypted copy of your key.";

export const MCP_LIMITATION =
  "fonio’s documented public API cannot create or update assistants. This MCP generates a full paste-ready spec for app.fonio.ai and only performs live writes for outbound calls, API-key tests, and remote integration servers.";
