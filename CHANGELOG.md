# Changelog

## 0.1.16

- Hardened the marketplace validator to enforce `manifest.forbidden` paths and scan tracked
  text files for real `lsk_` API keys (placeholders excluded), so a leaked `credentials.json`
  or `.env` can no longer pass validation.
- Extended validation to the Cursor shim's inline `mcpServers.lyrashield` block, asserting the
  same Streamable HTTP / URL / no-headers invariants as the root plugin configs.
- Added `manifest.artifactVersions` pins and validator assertions so version drift across the
  Zed, Gemini, Codebuff, and OpenClaw exports is caught on the next export.
- Made the Cline installation guide and `mcp.json` sample OAuth-first; the API-key `Bearer`
  header is now a commented CI fallback rather than the default path.
- Fixed the Cline submission icon URL to track `/main/` instead of the stale `/v0.1.1/` tag.
- Stopped the Codebuff review agent from shipping an empty `LYRASHIELD_API_KEY`; when unset it
  now omits the env key so the stdio server falls back to the local credential store.
- Repaired the `git diff --check` workflow step to diff against the PR base instead of the
  working tree.

## Next

- Made the generated Cursor and Kiro shims OAuth-first, so neither writes an API-key variable into
  a plugin manifest. The Zed extension now starts from the same local OAuth credential store; its
  settings API key is an explicit CI/non-OAuth fallback and uses only Zed's `npm:install` capability.
- Corrected the bundled skill's pre-PR and weekly-monitor defaults to `QUICK`, matching the
  current bounded-release contract, and bumped the Codebuff read-only review agent to `0.1.2`.
- Flattened the portable Agent Plugin into the marketplace root, so conformant clients discover
  its `plugin.json`, OAuth-first `mcp.json`, and `skills/` together.
- Removed the mandatory API-key header from the Claude Code MCP config so fresh connections reach
  the hosted OAuth flow, and restored the complete Apache-2.0 license plus the OpenClaw MIT-0 file.
- Bundled LyraShield workspace dependencies into the published MCP package so a clean `npx`
  installation does not try to resolve private workspace packages from npm.
- Clarified that repository auto-detection is local-stdio-only; hosted MCP clients now require an
  explicit repository or target identifier instead of inspecting the server checkout.
- Republished Codebuff `lyrashield-review` as `0.1.1` with its read-only LyraShield MCP
  server declaration; the prior public `0.1.0` listing had an empty MCP server map.
- Added a narrow MIT-0 grant for the OpenClaw skill directory so the community ClawHub listing can
  publish its `v1.0.1` metadata correction without changing the Apache-2.0 license of the broader
  marketplace bundle.

## 0.1.12

- Declared Zed's required Node process capability in the extension manifest.

## 0.1.11

- Corrected API-key settings links in the Cline and Zed installation guides.

## 0.1.10

- Declared the bundled skill in the OpenAI/Codex manifest using the current plugin format.

## 0.1.9

- Added Claude Code-native root `skills/` and `.mcp.json` artifacts.
- Made Claude Code OAuth-first by registering only the hosted remote MCP server.
- Aligned public artifact metadata with the public marketplace repository.

## 0.1.8

- Reconciled exported marketplace artifacts with current source.
- Corrected Codebuff publisher slug to `lyrashield`.
- Refreshed OAuth/legal link metadata and reviewer pack.

## 0.1.0

- Initial Apache-2.0 marketplace release boundary.
- OAuth-first hosted MCP connection with read-only default and approval-gated writes.
- Gemini CLI, Kiro, Cline, Kilo, OpenClaw, Zed, and Codebuff artifacts.
- Sanitized reviewer workflows and marketplace submission fixtures.
