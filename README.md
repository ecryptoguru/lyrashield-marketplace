# LyraShield AI marketplace release source

The installable client boundary is `packages/agent-plugin/plugin/` plus the generated
client shims. It is Apache-2.0; the hosted dashboard, worker, and engine remain proprietary.
The release job must export only these files to the dedicated public `lyrashield-marketplace`
repository:

- `plugin.json`, `mcp.json`, `skills/`, client shims, and client adapters
- Zed extension and Codebuff agent sources
- marketplace icons, screenshots, changelog, support/privacy/terms links, and test fixtures

The export must not contain `.env` files, credentials, database schema, customer data, hosted
service source, or generated build caches. Run
`pnpm --filter @lyrashield/agent-plugin export:marketplace /path/to/export` to create the
deterministic release boundary. `manifest.json` records the source package, version, generated
files, and forbidden hosted-service paths; the export test fails if an artifact disappears.

The export also contains the native/review artifacts used by the first submission wave:
Gemini CLI, Kiro Power, Cline, Kilo, OpenClaw, Zed, Codebuff, a 400×400 icon, and the sanitized
reviewer pack. The Gemini repository must additionally carry the `gemini-cli-extension` topic.

## Submission order

1. Founder/counsel approval of `/privacy`, `/terms`, `/support`, and the security-reporting mailbox.
2. Create and verify the LyraShield AI publisher identity and sanitized reviewer workspace.
3. Export and tag the public repository with an immutable version.
4. Smoke-test OAuth connect, workspace selection, read-only MCP calls, denied writes, pending approval,
   disconnect/revocation, CLI API-key fallback, Zed, Codebuff, and the generated marketplace fixtures.
5. Submit the shared listing to OpenAI/Codex, Claude, Cursor, GitHub/Copilot, Kiro, Cline, Kilo, Zed,
   Codebuff, Gemini CLI, and ClawHub according to each channel's current intake.

Marketplace availability is not claimed until the publisher submission is accepted; direct adapter
guides remain available for clients without a verified marketplace program.

## Submission tracking

- Cline: [issue #2213](https://github.com/cline/mcp-marketplace/issues/2213) submitted; awaiting review.
- Kilo: [PR #217](https://github.com/Kilo-Org/kilo-marketplace/pull/217) submitted; awaiting review.
- Zed: [PR #7137](https://github.com/zed-industries/extensions/pull/7137) submitted; local Cargo validation remains pending because Rust is not installed here.
- Gemini CLI: public repository topic `gemini-cli-extension` and root `gemini-extension.json` are live.
- OpenClaw: ClawHub dry-run passes; authenticated publisher login is still required for publication.
- Kiro: form is prepared; submission requires acceptance of Kiro's publisher terms.
- Claude and Codebuff: publisher sessions are required before their official forms/commands can be completed.
